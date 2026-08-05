# AI Assistant Backend

A small, dependency-light **Flask** service that powers the email builder's AI
chat panel. It turns a natural-language instruction into structured editor
actions (`AIResponse`) that the client validates with Zod and applies.

It is intentionally simple and **provider-agnostic**: any OpenAI-compatible Chat
Completions endpoint works (OpenAI, Azure OpenAI, Ollama, LM Studio, vLLM, …).
With **no API key** it runs a deterministic offline planner, so it works out of
the box for demos, tests and contributors.

---

## Why output is always valid & visible

The service never lets the model invent raw HTML or unknown blocks:

1. The **client sends a catalog** (`context.catalog`) of every available module —
   built-ins **and** gallery items — each with a concrete, renderable `sample`
   (real module JSON). This is the single source of truth.
2. The **model only picks module `type`s** from that catalog and may supply short
   text overrides.
3. The service **assembles the email from the real samples**, so whatever is
   returned renders correctly in the editor.
4. The **client re-validates** with `documentSchema` and regenerates ids before
   applying (`applyAIResponse`).

---

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Offline heuristic mode (no key needed):
python app.py

# Model-backed mode:
AI_API_KEY=sk-... python app.py
```

The service listens on `http://localhost:3001` by default.

### Configuration

Copy `.env.example` to `.env` (auto-loaded) or export the variables directly.
Real environment variables always win over `.env`.

| Variable        | Default                      | Purpose                                            |
|-----------------|------------------------------|----------------------------------------------------|
| `AI_API_KEY`    | *(empty)*                    | Model API key. Empty → offline heuristic planner.  |
| `AI_MODEL`      | `gpt-4o-mini`                | Model name.                                        |
| `AI_BASE_URL`   | `https://api.openai.com/v1`  | OpenAI-compatible base URL.                        |
| `AI_MAX_MODULES`| `8`                          | Max modules inserted per request.                  |
| `AI_TIMEOUT`    | `45`                         | Model request timeout (seconds).                   |
| `PORT`          | `3001`                       | HTTP port.                                         |
| `CORS_ORIGINS`  | `*`                          | Comma-separated allowed origins (set in prod).     |

---

## Connect the editor

```ts
import { registerPlugin, aiAssistantPlugin } from "@one-million-lines/email-builder";

registerPlugin(aiAssistantPlugin({ endpoint: "http://localhost:3001/ai/generate" }));
```

or via the React component:

```tsx
<EmailBuilder aiEndpoint="http://localhost:3001/ai/generate" />
```

Once a provider is configured, an **AI** tab appears at the top of the left
sidebar with a chat panel.

For the standalone dev app, set `VITE_AI_ENDPOINT` in a `.env` file at the project
root to enable the panel automatically.

---

## Wire protocol

### `GET /health`

```json
{ "status": "ok", "model": "gpt-4o-mini", "mode": "offline" }
```

### `POST /ai/generate`

Request body — an `AIRequest` (see `src/core/aiActions.ts`):

```json
{
  "task": "create_email",
  "instruction": "Create a flash sale email for our shop",
  "document": { "...": "current EmailDocument (optional)" },
  "context": { "catalog": [ { "type": "header.hero", "category": "header", "sample": { "...": "module JSON" } } ] }
}
```

`task` is one of: `create_email`, `rewrite_text`, `generate_subject`,
`generate_preview`, `translate`, `adapt_tone`, `apply_theme`.

Success response — an `AIResponse`:

```json
{
  "actions": [ { "type": "insert_module", "index": 0, "module": { "...": "module JSON" } } ],
  "text": "Assembled your email from the available blocks."
}
```

- Layout tasks return `actions` (structured edits). `insert_module` modules are
  cloned from catalog samples; the client regenerates ids on apply.
- Text tasks (`rewrite_text`, `generate_subject`, …) return only `text`.
- A full `document` may be returned instead of `actions` for a complete rebuild.

Error response:

```json
{ "error": "Human-readable message shown in the chat panel" }
```

| Code  | Meaning                                             |
|------:|-----------------------------------------------------|
| `200` | Success (`AIResponse`).                             |
| `400` | Bad request (body is not a JSON object).           |
| `422` | Recoverable failure (e.g. missing catalog).        |
| `500` | Internal error.                                    |

### `GET|POST /products/search`

Backs the builder's product-search modal. Send the query as `?q=` (GET) or
`{"query": "…"}` (POST); the service replies with a single best-matching product.

```jsonc
// GET /products/search?q=linen%20tote  ->  200
{
  "name": "Linen Tote Bag",
  "final_price": "$39.00",
  "old_price": "$59.00",
  "description": "Heavyweight natural linen, made in Portugal.",
  "link": "https://example.com/products/linen-tote-bag",
  "image": "https://placehold.co/560x400?text=Linen+Tote",
  "stars": 4.5,
  "sku": "TOTE-LIN-01"
}
```

`404 { "error": "No product matched '…'." }` signals no result. Connect it with
`productSearchPlugin({ endpoint })` or `<EmailBuilder productEndpoint="…" />`;
for the dev app set `VITE_PRODUCT_ENDPOINT`. The demo catalog lives in
`product_service.py` — swap it for a real product source in production. Field
mapping details: [`../src/plugins/productSearch/README.md`](../src/plugins/productSearch/README.md).

### `GET /vouchers`

Backs the builder's voucher-select dropdown. Returns a JSON array of vouchers.

```jsonc
// GET /vouchers  ->  200
[
  { "id": "voucher_welcome10", "title": "Welcome — 10% off", "code": "WELCOME10" },
  { "id": "voucher_save20", "title": "Spring Sale — 20% off", "code": "SAVE20" },
  { "id": "voucher_79jq", "title": "VIP personal code", "code": "**|voucher_79jq|**" }
]
```

Connect it with `voucherPlugin({ endpoint })` or `<EmailBuilder voucherEndpoint="…" />`;
for the dev app set `VITE_VOUCHER_ENDPOINT`. The demo list lives in
`voucher_service.py`. Field mapping details:
[`../src/plugins/voucherSelect/README.md`](../src/plugins/voucherSelect/README.md).

---

## Files

| File                 | Purpose                                                             |
|----------------------|---------------------------------------------------------------------|
| `app.py`             | Flask app: `/health`, `/ai/generate`, `/products/search`, `/vouchers`. |
| `ai_service.py`      | Prompt building, model client, offline planner, module assembly.    |
| `product_service.py` | In-memory demo catalog + single-result search.                      |
| `voucher_service.py` | In-memory demo voucher list.                                        |
| `requirements.txt`   | `flask`, `flask-cors` (model client uses stdlib only).              |
| `.env.example`       | Configuration template.                                             |

---

## Security checklist

- Set a specific `CORS_ORIGINS` in production (never `*` with credentials).
- Put the service behind auth (e.g. an API gateway) — it does not authenticate.
- Keep `AI_API_KEY` server-side only; the browser never sees it.
- Rate-limit per session/IP; model calls cost money and time.
- The client re-validates every response, but treat this service as untrusted
  input on the client anyway (it already does).
