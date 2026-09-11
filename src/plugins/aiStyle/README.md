# AI Style Plugin

Generate or restyle a complete email from a reference image and/or a text description.
The plugin is **fully independent** from the email-builder core — it is never loaded
unless explicitly registered.

---

## What it does

A **Style** button (wand icon) appears in the left sidebar rail. Clicking it opens a panel where the user can:

1. **Upload a reference image** — any screenshot of an email design, brand guideline, or mood board.
2. **Describe the desired style** in plain text — fonts, colors, layout, mood.
3. Click **Generate style** — the AI analyzes the input and returns a complete, valid `EmailDocument` matching the requested style. The editor's blocks are updated instantly.

The AI respects the builder's module catalog: it only uses real registered block types
so the output is always renderable.

---

## Enabling the plugin

### Using the vtmarketing panel API

```ts
import { registerPlugin, aiStylePlugin } from "@one-million-lines/email-builder";
import { ACCESS_TOKEN_KEY } from "@/misc/ApiClient";

registerPlugin(aiStylePlugin({
  endpoint: `${import.meta.env.VITE_BASE_API_URL}/ai/email-style`,
  headers: {
    get Authorization() {
      const t = localStorage.getItem(ACCESS_TOKEN_KEY);
      return t ? `Bearer ${t}` : "";
    },
  },
  withCredentials: true,
}));
```

### Using the standalone Python backend

```ts
registerPlugin(aiStylePlugin({
  endpoint: "http://localhost:3001/ai/generate-style",
}));
```

### Feature flag (per-account control)

```ts
registerPlugin(aiStylePlugin({
  endpoint: "...",
  enabled: () => currentUser.features.includes("ai_style"),
}));
```

---

## Request / response wire protocol

**POST** `<endpoint>`

```json
{
  "description": "Dark navy background, gold accent, serif heading",
  "image_base64": "<base64 string, no data-URL prefix>",
  "catalog": [ /* CatalogEntry[] — same shape as /ai/generate */ ],
  "document": { /* current EmailDocument, optional */ }
}
```

**Response** — an `AIResponse`:

```json
{
  "document": { /* complete EmailDocument */ },
  "text": "Applied a dark navy style with gold accents."
}
```

The `transformResponse` option lets you unwrap custom server envelopes:

```ts
aiStylePlugin({
  endpoint: "...",
  transformResponse: (body) => (body as any).data,
})
```

---

## Backend implementation (vtmarketing panel API)

The `POST /ai/email-style` route in `interfaces_vtcdn_net/mypanel/routes/ai_email_style.py`:

1. Receives `description`, `image_base64`, `catalog`, `document`.
2. Builds a detailed system prompt that explains the `EmailDocument` JSON schema.
3. Calls a vision-capable LLM (gpt-4o) via litellm when an image is provided;
   falls back to gpt-4o-mini for text-only requests.
4. Returns the complete `EmailDocument` wrapped in `{ "data": { "document": … } }`.

---

## Exports

| Export | Purpose |
|---|---|
| `aiStylePlugin` | Plugin factory (register with `registerPlugin`). |
| `createHttpAIStyleProvider` | Build a provider from options (used internally). |
| `getStyleProvider` / `setStyleProvider` | Access the active provider. |
| `AIStylePanel` | The panel component (lazy-loaded by the sidebar). |
| `AIStyleRequest` | TypeScript type for the request payload. |
| `AIStyleProvider` | Interface for custom provider implementations. |
| `HttpAIStyleProviderOptions` | Options for the HTTP provider. |
| `AIStylePluginOptions` | Options for the plugin factory. |
