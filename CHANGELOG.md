# Changelog

All notable changes to this package are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format.

## [0.6.1] — 2026-09-03

### Fixed

- **Rich-text toolbar position** — removed incorrect `window.scrollY` / `scrollX`
  offsets from the `position: fixed` toolbar. `getBoundingClientRect()` already
  returns viewport-relative coordinates; adding scroll offsets pushed the toolbar
  far off-screen when the canvas was scrolled. Also: toolbar is now clamped to
  the viewport on all four edges; all popovers (link, colour, emoji, merge-tag)
  now open **upward** (`bottom-full`) instead of downward, preventing them from
  falling off-screen when the toolbar is near the bottom of the visible area.
- **Color inputs show resolved hex** — `ColorInput` in the right sidebar now
  displays the resolved hex value (e.g., `#FFFFFF`) in the text field instead of
  the raw theme token string (e.g., `{colors.buttonText}`). The token is still
  preserved in the document until the user types a custom value. The **Reset to
  theme token** button tooltip was updated to show the token path.

### Changed

- **Recommendations → opt-in plugin** — the Recommendations panel in the right
  sidebar is now hidden by default and only appears when explicitly enabled.
  This decouples the feature from the core editor for hosts that do not use
  personalised recommendations.
  - New React prop: `<EmailBuilder enableRecommendations />`.
  - New plugin object: `recommendationsPlugin` (pass to `registerPlugin()`).
  - New `BuilderHandle` method: `builder.registerRecommendationsPlugin()`.
  - New reactive store export: `useRecommendationsStore`.
  - New documentation: `src/recommendations/README.md` — covers the data
    schema, algorithm catalog, activation, backend processor integration, and
    the legacy Vibetrace interop shape.
  - **No breaking change for existing documents** — any `module.data.recommendations`
    already in saved JSON is preserved; the panel just won't be visible until
    the plugin is registered.

## [0.6.0] — 2026-09-03

### Added

- **8 new email templates** covering core ecommerce lifecycle flows:
  - `back-in-stock` — urgency-first product return notification
  - `price-drop-alert` — 3-product grid with old/new price comparison
  - `post-purchase-follow-up` — warm thank-you, usage tips, soft review request
  - `review-request` — ⭐ prompt with founder personal note and CTA
  - `replenishment-reminder` — "Running low?" reorder with subscription nudge
  - `vip-early-access` — exclusive luxury-themed 24h early access
  - `birthday-reward` — personalised (uses `{user.firstname}` merge tag) birthday voucher
  - `win-back` — re-engagement with "what's new" grid and best offer
- **HTML preview files** for all 16 templates generated via new script
  (`scripts/generate-previews.mjs`) to `examples/previews/<id>.html`.
  Each preview wraps the email HTML in a minimal browser shell with a sticky
  info bar (template name, category, description).
- `"generate:previews"` npm script: `npm run build && node scripts/generate-previews.mjs`.

### Fixed

- **Text selection loss** — `TextRender` in `Canvas.tsx` no longer uses
  `dangerouslySetInnerHTML`. innerHTML is now synced from the store **only
  when the element is not focused**, preventing React from clobbering
  in-progress text selections or cursor positions during parent re-renders.
  This was the root cause of "cursor jumps to start of block" when editing.
- **Bold button missing** in the rich-text toolbar — replaced lucide `Bold`,
  `Italic`, `Underline` icons with styled `<b>B</b>`, `<i>I</i>`, `<u>U</u>`
  text to avoid icon availability issues and to match toolbar conventions.
- **Link insertion** (`LinkPopover`) now correctly focuses the contenteditable
  element and restores the saved selection range before calling `insertHTML`,
  so links are inserted at the correct position.

### Changed

- **Right sidebar** — added an **expand/narrow** toggle button (◁▷) next to
  the existing collapse button. The sidebar now has three states:
  - **Collapsed**: 6px strip with re-open button
  - **Normal**: 288px (w-72) — default
  - **Expanded**: 576px (w-[576px]) — double width, useful for complex panels
  Smooth CSS transition between states.

## [0.5.0] — 2026-09-03

### Added

- **Inline rich-text toolbar** — a floating, selection-aware formatting bar
  appears whenever the cursor is inside a text element in the canvas.
  - **Formatting**: Bold, Italic, Underline — toggle buttons that reflect the
    current selection state via `queryCommandState`.
  - **Font family** — email-safe font stacks: Arial, Georgia, Tahoma, Trebuchet
    MS, Verdana, Courier New, Times New Roman. Wraps the selection in
    `<span style="font-family:...">`.
  - **Font size** — 10–48 px presets. Wraps the selection in
    `<span style="font-size:...px">`.
  - **Text colour** — 21 preset swatches plus a custom hex/name input. Uses
    `styleWithCSS` + `execCommand('foreColor')` to produce
    `<span style="color:...">`.
  - **Insert link** — inline popover with a URL input and a special-link role
    dropdown (Unsubscribe, View in browser, Manage preferences, User profile).
    Wraps the selection in `<a href="..." data-link-type="...">` or inserts a
    standalone linked anchor when nothing is selected.
  - **Emoji picker** — 44 curated emojis in a compact grid; inserts at cursor.
  - **Merge-tag inserter** — when `mergeTags` are configured, a tag dropdown
    appears in the toolbar; selecting a tag inserts `{attribute}` at the cursor.
  - The toolbar uses `onMouseDown + preventDefault` on all buttons so the
    contenteditable never loses focus during formatting.
  - New files: `src/editor/RichTextToolbar.tsx`, `src/editor/richTextState.ts`.

### Changed

- **Right sidebar — Text element panel** simplified. Removed per-selection
  properties (font family, font size, font weight, colour, link URL, link role,
  merge-tag inserter) which are now handled by the inline toolbar. The sidebar
  now only shows block-level settings: default alignment, line height, letter
  spacing, padding, and visibility (hide on mobile / desktop).
- `TextRender` in `Canvas.tsx` now registers/unregisters itself with
  `useRichTextStore` on focus/blur, supplies a `data-email-text` attribute for
  toolbar targeting, and prevents click events from bubbling when the element is
  actively being edited (so caret repositioning clicks don't deselect the element).

## [0.4.0] — 2026-09-03

### Added

- **Special link types** — links can now be tagged with a semantic `linkType`
  (`"unsubscribe"`, `"view_in_browser"`, `"manage_preferences"`, `"user_profile"`).
  The rendered HTML carries both a `data-link-type` attribute on the anchor element
  **and** a placeholder href value (e.g. `{{unsubscribe_url}}`), giving backend
  processors two independent ways to locate and replace per-recipient URLs.
  - New `SpecialLinkType` union type and `SPECIAL_LINK_PLACEHOLDERS` map exported
    from `core/types`.
  - `linkType` field added to `ButtonElement` and `ImageElement` (top-level), and
    to `TextElement.style` (alongside the existing `link`).
  - `text()`, `button()`, and `muted()` helpers accept a `linkType` option.
  - New `footerLinks(links, opts?)` helper creates a text element with multiple
    inline `<a>` tags, each carrying `data-link-type` — ideal for footer lines
    that combine "Unsubscribe · View in browser".
  - All built-in footer modules updated to use `footerLinks()` and proper
    `linkType` values instead of plain text.
  - Right sidebar: **Link role** dropdown added below the Link URL field for
    Text, Image, and Button elements. Selecting a role auto-fills the placeholder
    URL.
  - `safeUrl()` updated to pass through `{{...}}` placeholder URLs without
    stripping them.
  - Validation schema updated to accept `linkType` on image and button elements.

- **Merge tags / personalisation tokens** — dynamic content placeholders can
  now be configured and inserted directly from the editor sidebar.
  - New `MergeTag` interface: `{ attribute: string; title: string }`.
  - New `mergeTags` prop on `<EmailBuilder>` (React) and `createEmailBuilder`
    (vanilla) accepts an array of merge tag definitions.
  - New `builder.registerMergeTags(tags)` method on `BuilderHandle` for plugin
    authors.
  - New `useMergeTagsStore` reactive store (`src/plugins/mergeTags/state.ts`).
  - Right sidebar: **Insert merge tag** dropdown appears in the Text element
    panel when merge tags are configured. Selecting one appends
    `{attribute}` to the text content.
  - `MergeTag` exported from the public API.

- **Template & block authoring guide** (`src/templates/TEMPLATE_GUIDE.md`) —
  comprehensive, AI-agent-ready reference documenting:
  - The full `EmailDocument` JSON schema
  - All element types and their style options
  - Module structure, categories, and naming conventions
  - Theme tokens and how to reference them
  - All helper functions with options tables
  - Special link types and merge tags
  - Step-by-step instructions for creating new templates and module definitions
  - A complete template code example
  - A commit checklist and AI agent prompt template

## [Unreleased]

### Added
- **AI assistant module** (`src/ai/`) — optional chat-driven editing. When an AI
  provider is configured an **AI** tab appears in the left sidebar. The client
  sends a catalog of real modules so the assistant only ever assembles valid,
  renderable emails; every response is validated with `documentSchema` and gets
  fresh ids before being applied. New exports: `aiAssistantPlugin`,
  `createHttpAIProvider`, `buildCatalog`, `applyAIResponse`, `mockAIProvider`,
  `applyAIActions`, `validateAIDocument`, and the related types. New `aiEndpoint`
  prop on `<EmailBuilder>`. See `src/ai/README.md`.
- **Python AI backend** (`backend/`) — a small Flask service (`app.py`,
  `ai_service.py`) exposing `GET /health` and `POST /ai/generate`. Works with any
  OpenAI-compatible endpoint and falls back to a deterministic offline planner
  when no API key is set. See `backend/README.md`.
- **Feature module additions** — five new blocks added to the Feature category:
  `feature.gradient_hero` (launch CTA hero), `feature.pull_quote`,
  `feature.stat_row`, `feature.single_product_spotlight`, `feature.pill_nav`.


## [0.1.4] — 2026-07-02

### Changed
- **Dependencies upgraded to latest releases** (no public API changes):
  - `@dnd-kit/core` `^6.1.0` → `^6.3.1`
  - `@dnd-kit/sortable` `^8.0.0` → `^10.0.0`
  - `lucide-react` `^0.460.0` → `^1.23.0`
  - `zod` `^3.23.8` → `^4.4.3` (v4 is API-compatible for the schemas used here)
  - `zustand` `^5.0.2` → `^5.0.14`
- **Dev dependencies upgraded to latest releases**:
  - `react` / `react-dom` (dev) `^19.0.0` → `^19.2.7`
  - `@types/react` `^19.0.0` → `^19.2.17`
  - `@types/react-dom` `^19.0.0` → `^19.2.3`
  - `@tailwindcss/vite` `^4.1.0` → `^4.3.2`
  - `tailwindcss` `^4.1.0` → `^4.3.2`
  - `@vitejs/plugin-react-swc` `^3.5.0` → `^4.3.1`
  - `typescript` `^5.5.3` → `^6.0.3`
  - `vite-plugin-dts` `^4.0.0` → `^5.0.3`
  - `jsdom` `^25.0.1` → `^29.1.1`
  - `eslint` `^9.x` → `^10.6.0`
- `engines.node` bumped to `>=22` in line with supported LTS range.

## [0.1.2] — 2026-06-30

### Added
- npm library build (`dist/email-builder.js` ESM, `dist/email-builder.cjs` CommonJS).
- Generated TypeScript declarations (`dist/index.d.ts` + per-module `.d.ts`).
- Compiled stylesheet at `dist/styles.css`, imported via `@one-million-lines/email-builder/styles.css`.
- `exports` map, `files` allowlist, and publishing metadata in `package.json`.
- Library-only stylesheet (`src/lib.css`) that omits app `html/body/#root` globals.

### Fixed
- **CSS isolation** — `src/lib.css` no longer imports Tailwind Preflight
  (`@import "tailwindcss"` → `@import "tailwindcss/theme"` + `@import
  "tailwindcss/utilities"`). The global CSS reset no longer leaks into the host
  application.
- Added `.oml-email-builder` as the root class on the `<App>` element. All
  builder styles are now nested under this class in the DOM.
- Scoped minimal reset (`box-sizing`, `button`, `input`, `img` defaults) applied
  only inside `.oml-email-builder` via `@layer base`, replacing the Preflight
  rules that were previously global.
- `[contenteditable="true"]:focus` selector is now scoped to
  `.oml-email-builder` and no longer affects host page content.
- Replaced `h-screen w-screen` on the builder root with `h-full w-full` so the
  builder fills its container rather than always taking up the full viewport. The
  host is responsible for sizing the container (e.g., `height: 100vh`).

### Changed
- `react` and `react-dom` are now **peer dependencies** (no longer bundled).
- Runtime dependencies (`@dnd-kit/*`, `lucide-react`, `zod`, `zustand`) are
  externalized from the bundle and declared as `dependencies`.

## [0.1.0]

### Added
- Initial visual email builder: JSON document model, modules, templates, themes,
  table-based HTML renderer, plugin hooks, React component, and vanilla factory.
