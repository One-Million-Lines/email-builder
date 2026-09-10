# Dev demos

Interactive development demos for each email-builder plugin. Each page loads
the editor with a specific plugin wired to a local mock backend server.

---

## Quick start

```bash
# 1. Build the library (required — demos load from dist/)
npm run build

# 2. Start the mock backend + static file server
node dev/mock-server.mjs
# or: npm run dev:mock

# 3. Open the demo index
http://localhost:3001/dev/
```

The mock server runs on port `3001` by default. Override with `PORT=XXXX node dev/mock-server.mjs`.

---

## Demo pages

| Page | URL | Plugins |
|------|-----|---------|
| Index | `/dev/` | — |
| 01 — Plain | `/dev/01-plain.html` | none |
| 02 — Image Uploader | `/dev/02-image-uploader.html` | `imageUploader` |
| 03 — Product Search | `/dev/03-product-search.html` | `productSearch` |
| 04 — Voucher Select | `/dev/04-voucher-select.html` | `voucherSelect` |
| 05 — Recommendations | `/dev/05-recommendations.html` | `recommendations` |
| 06 — AI Assistant | `/dev/06-ai-assistant.html` | `aiAssistant` |
| 07 — All Plugins | `/dev/07-all-plugins.html` | all of the above |

---

## Mock API endpoints

All endpoints are exposed by `dev/mock-server.mjs`.

### `POST /api/upload`

Accepts any multipart form body (does not actually persist the file) and returns
a placeholder image URL.

**Response**
```json
{ "url": "https://placehold.co/600x400/…?text=Uploaded_…", "alt": "Uploaded image" }
```

---

### `GET /api/products/search?q=<query>`  
### `POST /api/products/search` body `{"query":"…"}`

Searches a small in-memory catalog of 8 products using a simple keyword-scoring
algorithm.

**Catalog** (try these queries): `tote`, `mug`, `lamp`, `skillet`, `chair`,
`candle`, `throw`, `vase`

**Response (200)** — first matched product:
```json
{
  "sku": "MUG-CER-02",
  "name": "Ceramic Mug",
  "final_price": "$24.00",
  "description": "Stoneware mug with a matte reactive glaze. 350 ml.",
  "link": "https://example.com/products/ceramic-mug",
  "image": "https://placehold.co/560x400/…",
  "stars": 4.0
}
```

**Response (404)** — no match:
```json
{ "error": "No product matched \"unicorn\"." }
```

---

### `GET /api/vouchers`

Returns the list of 5 demo vouchers.

```json
[
  { "id": "voucher_welcome10", "title": "Welcome — 10% off first order", "code": "WELCOME10", "description": "…" },
  { "id": "voucher_save20", "title": "Spring Sale — 20% off", "code": "SAVE20", "description": "…" },
  { "id": "voucher_freeship", "title": "Free shipping over $50", "code": "FREESHIP", "description": "…" },
  { "id": "voucher_flash30", "title": "Flash sale — 30% off (today only)", "code": "FLASH30", "description": "…" },
  { "id": "voucher_79jq", "title": "VIP personal code", "code": "**|voucher_79jq|**", "description": "…" }
]
```

---

### `POST /api/ai/generate`

Accepts an `AIRequest` JSON body and returns a mock `AIResponse`.

| Task | Mock response |
|------|--------------|
| `create_email` | `{ actions: [ insert_module × N ] }` — picks modules from the catalog supplied in `context.catalog` |
| `rewrite_text` | `{ text: "[Mock AI] <instruction>" }` |
| `generate_subject` | `{ text: "✨ Your exclusive offer expires tonight" }` (rotates) |
| `generate_preview` | `{ text: "Take a peek at what we've been saving for you." }` (rotates) |
| `translate` | `{ text: "⚠ Translation requires a real AI backend…" }` |
| `adapt_tone` | `{ text: "⚠ Tone adaptation requires a real AI backend…" }` |
| anything else | `{ actions: [] }` |

The `create_email` task is the most useful: the editor sends its full module catalog in `context.catalog`; the mock picks known types (`header.hero`, `content.headline_body`, `ecom.product_grid_2col`, `cta.simple`, `footer.simple`) and returns `insert_module` actions. The editor validates and applies them with fresh IDs.

---

## Upgrading to a real backend

Replace mock endpoints with the Python service in `backend/`:

```bash
cd backend
pip install -r requirements.txt
AI_API_KEY=sk-...  python app.py   # port 3001
```

Then update the endpoint URLs in each HTML file from `/api/…` to
`http://localhost:3001/…` (or use a reverse proxy).
