# Product Search Plugin

Connects the builder's product cards to your catalog. When a product provider is
registered, the editor shows:

- a **Find** button on every product grid (adds a searched product), and
- a **search icon** on each product card (replaces that card from search).

Clicking either opens a modal: type a query, preview the returned product, and
press **Save** to populate the card. Every field stays fully editable afterwards
(title, price, old price, description, link, image, stars).

---

## 1. Usage

Wire it as a plugin:

```ts
import { registerPlugin, productSearchPlugin } from "@one-million-lines/email-builder";

registerPlugin(
  productSearchPlugin({
    endpoint: "https://api.example.com/products/search", // required
    method: "GET",        // optional, default "GET"
    queryParam: "q",      // optional GET param, default "q"
    bodyParam: "query",   // optional POST body field, default "query"
    headers: { Authorization: "Bearer …" }, // optional
    withCredentials: false,                  // optional, send cookies
    timeoutMs: 15000,                        // optional
  })
);
```

Or, with the React component / vanilla factory:

```tsx
<EmailBuilder productEndpoint="https://api.example.com/products/search" />
// or: <EmailBuilder productProvider={myProvider} />
```

You can also build just the provider (e.g. to search programmatically):

```ts
import { createProductSearchProvider } from "@one-million-lines/email-builder";

const provider = createProductSearchProvider({ endpoint: "/products/search" });
const product = await provider.search("linen tote"); // ProductSearchResult | null
```

---

## 2. Wire protocol

By default the query is sent as `GET {endpoint}?q={query}`. Set `method: "POST"`
to send `{"query": "…"}` as a JSON body instead.

The server returns **one** product as JSON. The default response mapping is
forgiving — it accepts a bare product object, or an envelope
(`{ "product": … }`, `{ "results": [ … ] }`, `{ "products": [ … ] }`, or a
top-level array, taking the first item), and both camelCase and snake_case
field names:

| Field         | Accepted keys                                                        | Required |
| ------------- | -------------------------------------------------------------------- | -------- |
| `name`        | `name`, `title`, `product_name`, `productName`                       | ✅       |
| `finalPrice`  | `finalPrice`, `final_price`, `price`, `sale_price`, `salePrice`      | ✅       |
| `oldPrice`    | `oldPrice`, `old_price`, `compare_at_price`, `list_price`            |          |
| `description` | `description`, `desc`, `summary`                                     |          |
| `link`        | `link`, `url`, `product_url`, `permalink`                            |          |
| `image`       | `image`, `image_url`, `imageUrl`, `thumbnail`, `img`                 |          |
| `imageAlt`    | `imageAlt`, `image_alt`, `alt`                                       |          |
| `stars`       | `stars`, `rating`, `review_score`, `score` (number, 0–5)            |          |
| `sku`         | `sku`, `id`, `product_id`, `productId`                               |          |

Return HTTP `404` (or a body without a `name`/price) to signal "no match" — the
modal shows a friendly empty state. On error responses, a top-level
`{ "error": "…" }` message is surfaced to the user.

### Example success response

```json
{
  "name": "Linen Tote Bag",
  "final_price": "$39.00",
  "old_price": "$59.00",
  "description": "Heavyweight natural linen, made in Portugal.",
  "link": "https://example.com/products/linen-tote-bag",
  "image": "https://cdn.example.com/tote.png",
  "stars": 4.5,
  "sku": "TOTE-LIN-01"
}
```

### Custom mapping

If your API differs, map it yourself with `transformResponse`:

```ts
productSearchPlugin({
  endpoint: "/search",
  transformResponse: (body) => {
    const hit = (body as any).data?.[0];
    if (!hit) return null;
    return { name: hit.title, finalPrice: hit.price_formatted, image: hit.img, stars: hit.rating };
  },
});
```

---

## 3. Demo backend

The Python service in [`../../../backend`](../../../backend) implements this
protocol over a small in-memory catalog at `GET|POST /products/search`. Start it
and point the builder at it:

```bash
cd backend && pip install -r requirements.txt && python app.py
# then run the demo with VITE_PRODUCT_ENDPOINT=http://localhost:3001/products/search
```

Swap `CATALOG` in `backend/product_service.py` for a real database or search
query in production.

---

## 4. Security notes

The plugin runs in the browser and has no privileged access. Serve the search
endpoint yourself, authenticate it as needed (`headers` / `withCredentials`),
and never return secrets in the product payload. All product URLs are passed
through the builder's `safeUrl` sanitizer before they are rendered into email
HTML.
