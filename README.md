# OpenPostcards AI Builder

Open-source AI-ready email builder. Drag-and-drop modules, JSON-first document model, table-based HTML export, embeddable in React/Vue/vanilla JS.

## Run

```bash
npm install
npm run dev      # http://localhost:5316
npm run build
```

## Architecture

```
src/
  core/         # types, theme, renderer, validation, AI actions, plugins
  modules/      # module registry + default module pack
  themes/       # default theme pack
  store/        # zustand store with undo/redo, import/export
  editor/       # TopBar, LeftSidebar, Canvas, RightSidebar
  App.tsx       # composes the editor
  index.ts      # public API: <EmailBuilder/> + createEmailBuilder()
```

## Embedding

### React
```tsx
import { EmailBuilder } from "openpostcards-builder";

<EmailBuilder
  initialDocument={emailJson}
  onChange={(doc) => console.log(doc)}
  onExportHtml={(html) => console.log(html)}
/>
```

### Vanilla JS
```js
import { createEmailBuilder } from "openpostcards-builder";

createEmailBuilder({
  container: document.getElementById("builder"),
  initialDocument,
  onChange(doc) {}
});
```

## AI

The AI never edits HTML. It returns either a full validated `EmailDocument` or an array of typed actions (`update_meta`, `apply_theme`, `insert_module`, `update_element`, ...). All AI output is validated via Zod before being applied.

```ts
import { documentSchema, applyAIActions, mockAIProvider } from "openpostcards-builder";
```

## Plugins

```ts
registerPlugin({
  name: "ecommerce-modules",
  type: "modules",
  setup(builder) {
    builder.registerModule(productGridModule);
  },
});
```



Suggested next plugins
Quick wins (asset / API style — same shape as this one):

S3 / R2 / GCS direct-upload — pre-signed URL flow (browser → cloud, server only signs); cheaper at scale and removes file proxying.
Unsplash / Pexels picker — searchable stock-photo modal that returns a URL + alt + attribution string.
Image library / DAM browser — list previously uploaded assets so users don't re-upload.
Image transformer — auto-resize/optimize on upload (max width 1200, convert HEIC→JPG, strip EXIF).
Content / AI:

AI copywriter (ai-provider) — wraps OpenAI / Anthropic / local LLM for "Rewrite", "Shorter", "More casual" actions on text blocks.
AI image generator — DALL·E / SDXL endpoint that fills an image field from a prompt.
Translation plugin — bulk-translate the document to N languages, producing one variant per locale.
Brand voice / linter — flags off-brand words, banned phrases, reading-level warnings in the right sidebar.
Data & personalization:

Merge tag plugin — {{first_name}} etc. with autocomplete from a configured schema, plus a preview-with-sample-data toggle.
Product feed plugin — fetches Shopify / WooCommerce / CSV feed and lets the user drop products into a productGrid from a picker.
Countdown timer module — image generated from a timer-image service URL (?ends=...) for flash sales.
Delivery / workflow:

ESP send/test plugin — "Send test to me" button that pushes the rendered HTML to Mailgun / SES / Postmark / Resend.
Inbox preview plugin — Litmus / Email on Acid screenshot integration.
Spam-score linter — runs the HTML through SpamAssassin / Mail-Tester and reports.
Git / version-control plugin — commit document JSON to a repo on save; PR review for marketing changes.
Multi-version A/B plugin — duplicate the doc into A/B variants with a single subject-line diff editor.
Theme / styling:

Brand kit importer — reads a brand.json (or fetches from your design-system endpoint) and registers it as a Theme.
Dark-mode preview plugin — toggle in the canvas that simulates iOS Mail dark inversion to catch logo issues.
Persistence:

Document storage plugin — replace localStorage with a REST/Supabase backend; auto-save with conflict detection.
Webhook on save / send — fire a configurable webhook with the document JSON or rendered HTML for downstream automation (Zapier, n8n, internal CRMs).