# Voucher Select Plugin

Lets users pick a discount code from your backend instead of typing it. When a
voucher provider is registered, selecting a **voucher block** (any module with a
`voucherCode` text element — e.g. the built-in **Voucher Code** module) shows a
**Select voucher** dropdown in the right sidebar. Picking one fills the code; the
text stays fully editable afterwards.

The voucher list is fetched **once** and cached — lazily the first time a voucher
block is selected, or eagerly at editor start (`preload: true`).

---

## 1. Usage

```ts
import { registerPlugin, voucherPlugin } from "@one-million-lines/email-builder";

registerPlugin(
  voucherPlugin({
    endpoint: "https://api.example.com/vouchers", // required
    method: "GET",           // optional, default "GET"
    headers: { Authorization: "Bearer …" }, // optional
    withCredentials: false,  // optional, send cookies
    timeoutMs: 15000,        // optional
    preload: true,           // optional: fetch at editor start (default: lazy)
  })
);
```

Or via the React component / vanilla factory:

```tsx
<EmailBuilder voucherEndpoint="https://api.example.com/vouchers" />
// or: <EmailBuilder voucherProvider={myProvider} />
// preload eagerly: <EmailBuilder voucherEndpoint={{ endpoint: "…", preload: true }} />
```

You can also build just the provider:

```ts
import { createVoucherProvider } from "@one-million-lines/email-builder";
const provider = createVoucherProvider({ endpoint: "/vouchers" });
const vouchers = await provider.list(); // Voucher[]
```

---

## 2. The voucher block

Any module that contains a text element with `role: "voucherCode"` is
"voucher-aware" and gets the dropdown. The package ships one out of the box —
the **Voucher Code** module (`ecom.voucher`): a *"Your code"* label, the code,
and a Redeem button. Use `isVoucherAware(module)` to detect such modules and
`findVoucherCodeElement(module)` to locate the code element.

Without a provider the block still works as a normal editable text block.

---

## 3. Wire protocol

The provider issues `GET {endpoint}` and expects a JSON list of vouchers. The
default mapping accepts a bare array or an envelope
(`{ vouchers | results | items | data | coupons: [...] }`) and both camelCase and
snake_case field names:

| Field         | Accepted keys                                                    | Required |
| ------------- | ---------------------------------------------------------------- | -------- |
| `code`        | `code`, `voucher_code`, `coupon`, `coupon_code`, `value`         | ✅¹      |
| `id`          | `id`, `voucher_id`, `uid` (falls back to `code`)                 |          |
| `title`       | `title`, `name`, `label` (falls back to `code`)                  |          |
| `description` | `description`, `desc`, `summary`                                 |          |

¹ Each item needs at least a `code` or an `id`; missing/other items are skipped.

`code` may be a literal code (`SAVE20`) or an ESP merge tag resolved per
recipient at send time (e.g. `**|voucher_79jq|**`).

### Example response

```json
[
  { "id": "voucher_welcome10", "title": "Welcome — 10% off", "code": "WELCOME10" },
  { "id": "voucher_save20", "title": "Spring Sale — 20% off", "code": "SAVE20" },
  { "id": "voucher_79jq", "title": "VIP personal code", "code": "**|voucher_79jq|**" }
]
```

Error responses may carry a top-level `{ "error": "…" }`, surfaced in the panel.

### Custom mapping

```ts
voucherPlugin({
  endpoint: "/discounts",
  transformResponse: (body) =>
    (body as any).discounts.map((d) => ({ id: d.uuid, title: d.name, code: d.token })),
});
```

---

## 4. Demo backend

The Python service in [`../../../backend`](../../../backend) implements
`GET /vouchers` over a small in-memory list (`voucher_service.py`). Start it and
point the builder at it:

```bash
cd backend && pip install -r requirements.txt && python app.py
# then run the demo with VITE_VOUCHER_ENDPOINT=http://localhost:3001/vouchers
```

---

## 5. Security notes

The plugin runs in the browser and has no privileged access. Serve `/vouchers`
yourself, authenticate it (`headers` / `withCredentials`), and only return codes
the recipient is allowed to see. Voucher codes are written into the block's text
element like any other text.
