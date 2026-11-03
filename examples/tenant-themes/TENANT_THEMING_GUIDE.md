# Tenant Theming Guide — `@one-million-lines/email-builder`

> **For AI agents**: This document is the authoritative reference for adding tenant-specific themes, starter templates, and custom blocks to the email builder. Read it in full before generating any code. The file structure, type contracts, and serialization rules here are mandatory.

---

## Table of contents

1. [System architecture](#1-system-architecture)
2. [Theme configuration](#2-theme-configuration)
3. [Starter templates](#3-starter-templates)
4. [Custom blocks (tenant-specific modules)](#4-custom-blocks-tenant-specific-modules)
5. [Custom block HTML specification](#5-custom-block-html-specification)
6. [Backend serialization format](#6-backend-serialization-format)
7. [Host app integration](#7-host-app-integration)
8. [Gallery item structure](#8-gallery-item-structure)
9. [End-to-end data flow](#9-end-to-end-data-flow)
10. [Complete reference examples](#10-complete-reference-examples)
11. [AI agent checklists](#11-ai-agent-checklists)

---

## 1. System architecture

The email builder supports three layers of per-tenant customisation, each progressively more specific:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 1 — Theme                                                            │
│  Colours, fonts, spacing, radius.                                           │
│  Passed via `themes` prop or `registerTheme()`.                             │
│  Appears in the "Themes" panel (left sidebar, bottom rail).                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 2 — Starter Template                                                 │
│  Pre-built EmailDocument JSON seeded with the brand theme.                  │
│  Registered with `templateRegistry.register()`.                             │
│  Appears in the "Browse templates" modal (top bar).                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 3 — Custom Blocks                                                    │
│  Tenant-specific ModuleDefinitions with category "custom".                  │
│  HTML content via `htmlOverride` (email-safe table HTML).                   │
│  Passed via `modules` prop or `registerModule()`.                           │
│  Appears in the "Custom" tab (purple accent, puzzle icon) in the sidebar.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Storage backends

| Artefact | Where it lives | Serializable? |
|---|---|---|
| `Theme` object | Embedded in `EmailDocument` (JSON) | ✅ Pure JSON |
| `EmailDocument` | `gallery_content.params.builder` (MongoDB) | ✅ Pure JSON |
| `TemplateDefinition.build()` | TypeScript file (code) | ❌ Has function |
| `ModuleDefinition.create()` | TypeScript file OR deserialized from `params.custom_modules` | ❌ Has function |
| Serialized custom block | `gallery_content.params.custom_modules[]` (MongoDB) | ✅ Pure JSON |

---

## 2. Theme configuration

### Type definition

```ts
interface Theme {
  id:     string;       // unique kebab-case identifier, e.g. "hamangiu"
  name:   string;       // display name in the Themes panel
  tokens: ThemeTokens;
}

interface ThemeTokens {
  colors:  Record<string, string>;  // hex values only
  fonts:   Record<string, string>;  // CSS font-family strings
  spacing: Record<string, number>;  // pixels (integer)
  radius:  Record<string, number>;  // pixels (integer)
}
```

### Required color keys

| Key | Semantic role |
|---|---|
| `background` | Outer email wrapper / page background |
| `surface` | Content panel / card background (usually white) |
| `primary` | Brand accent: links, eyebrow labels, price text |
| `text` | Body text (paragraphs, descriptions) |
| `muted` | Secondary / caption text, dividers |
| `buttonBackground` | CTA button fill |
| `buttonText` | CTA button label |

All extra keys (e.g. `secondary`, `accent`, `dark`) are allowed and can be referenced in styles.

### Required font keys

| Key | Used for |
|---|---|
| `heading` | h1/h2 text elements with `role: "headline"` |
| `body` | Default text, descriptions, body copy |
| `button` | CTA button labels |

Use email-safe font stacks (no Google Fonts, no @font-face):
```
"Arial, Helvetica, sans-serif"
"Georgia, 'Times New Roman', serif"
"'Courier New', Courier, monospace"
```

### Spacing keys (recommended)

```ts
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 }
```

### Radius keys (recommended)

```ts
// Professional / editorial feel:
radius: { sm: 2, md: 4, lg: 8 }

// Clean / modern feel:
radius: { sm: 4, md: 8, lg: 12 }

// Rounded / casual:
radius: { sm: 8, md: 16, lg: 24 }
```

### Token syntax in element styles

Anywhere an element style accepts a `string` value, you can reference a theme token:
```ts
style: {
  color:           "{colors.primary}",       // resolves at render time
  fontFamily:      "{fonts.heading}",
  backgroundColor: "{colors.surface}",
}
```

Element styles with numeric values (`fontSize`, `padding*`, etc.) always use raw numbers — tokens can only be used for string-type style properties.

### Example: extracting colors from a website

Given a brand website, map UI elements to tokens:

| Website element | Token |
|---|---|
| Page background / very light outer bg | `background` |
| Content cards / white panels | `surface` |
| Primary brand CTA buttons | `buttonBackground` / `primary` |
| Button label text | `buttonText` |
| Headings, nav items | `text` |
| Subtext, footer, breadcrumbs | `muted` |

---

## 3. Starter templates

A `TemplateDefinition` wraps an `EmailDocument` in a factory function so fresh unique IDs are generated on every load.

### Type

```ts
interface TemplateDefinition {
  id:          string;              // unique kebab-case
  name:        string;              // label in the Templates modal
  category:    TemplateCategory;   // see below
  description: string;             // one-liner shown in the card
  tags?:       string[];           // free-form search keywords
  thumbnail?:  string;             // optional preview image URL
  build:       () => EmailDocument; // called fresh on every template load
}
```

### Categories

| Value | Label | Typical use |
|---|---|---|
| `"newsletter"` | Newsletter | Editorial / publishing |
| `"ecommerce"` | Ecommerce | Product promotions |
| `"abandoned_cart"` | Abandoned Cart | Retargeting |
| `"product_launch"` | Product Launch | New arrivals |
| `"onboarding"` | Onboarding | Welcome / activation |
| `"event"` | Event | Invitations, reminders |
| `"transactional"` | Transactional | Order receipts, alerts |
| `"publishing"` | Publishing | Blog digests |
| `"account"` | My Templates | **Account-specific templates from gallery** |

### Structure of `build()` return value

```ts
{
  version: "1.0",
  meta:    { name: string, previewText: string },
  theme:   Theme,                    // the brand theme object (full, not a reference)
  settings: {
    width:                  600,     // email width in px; always 600
    backgroundColor:        "{colors.background}",
    contentBackgroundColor: "{colors.surface}",
  },
  modules: EmailModule[],            // ordered list of sections / rows
}
```

### Using helpers vs raw JSON

**Preferred (helpers):**
```ts
import { mod, heading, text, button, image, spacer, PLACEHOLDER }
  from "@one-million-lines/email-builder";

modules: [
  mod("header.logo", "Header", [
    image(PLACEHOLDER(150, 40, "LOGO"), "Logo", { width: 150, align: "left" }),
  ], { backgroundColor: "#FFFFFF" }),

  mod("hero.content", "Hero", [
    heading("Big Campaign Headline"),
    text("Sub-copy goes here"),
    button("Shop now", "#"),
    spacer(16),
  ]),
]
```

**Raw JSON** (when no helpers available, e.g. Python backend):
```python
{
  "id": "ham_mod_hero",   # must be unique within the document
  "type": "hero.content", # dot-notation semantic identifier
  "name": "Hero",
  "style": {
    "backgroundColor": "{colors.surface}",
    "paddingTop": 16, "paddingBottom": 16,
    "mobile": { "paddingLeft": 0, "paddingRight": 0 }
  },
  "children": [...]
}
```

### Recommended module order

1. `header.logo` — logo + optional "view in browser" link
2. `header.eyebrow` / `header.announcement` — optional strip
3. `hero.*` — main visual + headline + CTA
4. `content.*` — body copy sections
5. `ecommerce.*` — product grids
6. `footer.*` — address + legal links

### ID rules

- Module ids: `uid("module")` (generates `module_abc123xyz`)
- Element ids: `uid("el")` (generates `el_abc123xyz`)
- For static JSON in databases: use descriptive prefixed IDs like `ham_mod_header`, `ham_el_logo`
- **IDs must be unique within a single document**. They do NOT need to be globally unique across all documents.

---

## 4. Custom blocks (tenant-specific modules)

Custom blocks are `ModuleDefinition` objects with `category: "custom"`. They appear in a **"Custom" tab** in the left sidebar — shown with a purple accent and puzzle icon — and only appear when at least one custom module is registered.

### Why `htmlOverride`?

The standard element system (text, image, button, productGrid…) produces single-column, full-width content. Complex brand-specific layouts — horizontal tab bars, two-column feature rows, split-badge promos — require custom table-based HTML that cannot be expressed through the element system.

Setting `htmlOverride` on a module makes the builder inject that raw HTML inside the module's outer `<tr><td>` wrapper. The module's `children` array is ignored; the `style` still applies (background, padding).

### Type

```ts
interface ModuleDefinition {
  type:        string;         // unique dot-notation: "brand.category.name"
  category:    ModuleCategory; // always "custom" for tenant blocks
  name:        string;         // label shown in the sidebar card
  description: string;         // shown in the sidebar card subtitle
  tags?:       string[];       // free-form search keywords
  thumbnail?:  string;         // optional preview image URL
  create:      () => EmailModule; // factory — called when user clicks to add
}
```

### Module instance returned by `create()`

```ts
{
  id:           uid("module"),      // always generate fresh id
  type:         "brand.section.name",
  name:         "Human-readable name",
  style:        {
    backgroundColor: "#FFFFFF",    // hardcode or use token string
    paddingTop:    0,
    paddingBottom: 0,
    mobile: { paddingLeft: 0, paddingRight: 0 },
  },
  children:     [],                // EMPTY — content is in htmlOverride
  htmlOverride: RAW_HTML_STRING,   // the actual block content
}
```

### Type naming convention

```
{tenantId}.{category}.{blockName}

Examples:
  hamangiu.nav.categories
  hamangiu.content.book_feature
  hamangiu.promo.badge
  feroshop.header.promo_strip
  feroshop.promo.deal_badge
  feroshop.content.b2b_features
```

### Registration

**Static (TypeScript, code-defined):**
```ts
// In a *-blocks.ts file:
import { uid } from "@one-million-lines/email-builder";

export const myBlock: ModuleDefinition = {
  type: "acme.promo.strip",
  category: "custom",
  name: "Promo Strip",
  description: "Dark promo banner with orange CTA.",
  create: () => ({
    id: uid("module"),
    type: "acme.promo.strip",
    name: "Promo Strip",
    style: { backgroundColor: "#1C1C1C", paddingTop: 0, paddingBottom: 0 },
    children: [],
    htmlOverride: PROMO_STRIP_HTML,
  }),
};

// In the host app:
<EmailBuilder modules={[myBlock, ...otherBlocks]} />
```

**Dynamic (runtime, from gallery API):**
```ts
import { registerModule } from "@one-million-lines/email-builder";

registerModule({
  type:        "acme.promo.strip",
  category:    "custom",
  name:        "Promo Strip",
  description: "Dark promo banner with orange CTA.",
  create: () => ({
    id:          uid("module"),
    type:        "acme.promo.strip",
    name:        "Promo Strip",
    style:       serializedMod.style,
    children:    [],
    htmlOverride: serializedMod.html,
  }),
});
```

`registerModule()` increments `customModulesRevision` in the Zustand store, causing the sidebar to re-render and show the Custom tab.

---

## 5. Custom block HTML specification

### Fundamental rules

1. **Table-based layout only.** No CSS flexbox, no CSS grid.
2. **All styles must be inline.** No `<style>` tags, no CSS classes that reference external stylesheets.
3. **Use only email-safe CSS properties.** No `background: linear-gradient(...)`, no CSS variables, no `calc()`, no `clip-path`.
4. **No external scripts or SVG animations.** No `<script>`, no JavaScript.
5. **Images must use `width` attribute.** Always set `width=NNN` on `<img>` for Outlook compatibility.
6. **All colors must be hardcoded hex.** Token syntax (`{colors.primary}`) only works in element `style` objects, NOT inside `htmlOverride` HTML strings.
7. **Use `display:block` on images.** Prevents phantom space below images in some clients.
8. **Use `border-collapse:collapse` on tables** unless intentionally separating borders.
9. **Add `role="presentation"` to layout tables.** For accessibility.
10. **Set `cellpadding="0" cellspacing="0" border="0"` on every table.**

### Table layout patterns

**Full-width section (single cell):**
```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background-color:#1C1C1C;">
  <tr>
    <td style="padding:20px 24px;">
      <!-- content -->
    </td>
  </tr>
</table>
```

**Two-column layout:**
```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="40%" style="padding:16px 12px 16px 24px;vertical-align:top;">
      <!-- left column -->
    </td>
    <td width="60%" style="padding:16px 24px 16px 12px;vertical-align:top;">
      <!-- right column -->
    </td>
  </tr>
</table>
```

**Three-column layout:**
```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;">
      <!-- col 1 -->
    </td>
    <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;
         border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
      <!-- col 2 -->
    </td>
    <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;">
      <!-- col 3 -->
    </td>
  </tr>
</table>
```

**Rounded-corner button (VML fallback for Outlook):**
```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td bgcolor="#E05020" style="border-radius:8px;">
      <a href="#" style="display:inline-block;padding:12px 24px;
         font-family:Arial,Helvetica,sans-serif;font-size:14px;
         font-weight:bold;color:#FFFFFF;text-decoration:none;">
        Call to action
      </a>
    </td>
  </tr>
</table>
```

### Text styling

```html
<!-- Heading -->
<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;
   font-size:24px;font-weight:bold;color:#111827;line-height:1.3;">
  Headline text
</p>

<!-- Body copy -->
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;
   font-size:14px;color:#6B7280;line-height:1.6;">
  Body text goes here.
</p>

<!-- Eyebrow / label -->
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;
   font-size:11px;font-weight:bold;color:#E05020;
   letter-spacing:2px;text-transform:uppercase;">
  SECTION LABEL
</p>
```

### Image handling

```html
<img src="https://example.com/image.jpg"
     alt="Description"
     width="560"
     style="display:block;max-width:100%;height:auto;" />
```

For placeholder images during development:
```
https://placehold.co/WIDTHxHEIGHT/BG_HEX/TEXT_HEX?text=Label
Example: https://placehold.co/560x300/D6E4EF/1A1A2E?text=PRODUCT+IMAGE
```

### Special HTML entities for email

Use HTML entities for special characters (not raw Unicode when in Python dicts):
```
&middot;  →  ·  (middle dot separator)
&rarr;    →  →  (right arrow)
&ndash;   →  –  (en dash)
&mdash;   →  —  (em dash)
&deg;     →  °  (degree)
&nbsp;    →     (non-breaking space)
&bull;    →  •  (bullet)
&amp;     →  &  (ampersand)
&lt;      →  <  (less-than)
&gt;      →  >  (greater-than)
```

Unicode emoji are fine (stored as `\UXXXXXXXX` in Python source or directly in TypeScript):
```html
<p>&#x1F381; Gift emoji</p>   <!-- HTML entity form -->
<p>🎁 Gift emoji</p>          <!-- direct Unicode — works in most clients -->
```

---

## 6. Backend serialization format

### Why serialization matters

`ModuleDefinition.create()` is a JavaScript function and cannot be stored in a database. To persist custom blocks in a backend (MongoDB, SQL, etc.), we use a **serialized format** that replaces the function with its data ingredients.

### Serialized module entry structure

```json
{
  "type":        "brand.category.blockName",
  "name":        "Human-readable name",
  "description": "One-line description for sidebar and AI context.",
  "tags":        ["brand-id", "category-keyword", "custom"],
  "style": {
    "backgroundColor": "#FFFFFF",
    "paddingTop":    0,
    "paddingBottom": 0,
    "mobile": { "paddingLeft": 0, "paddingRight": 0 }
  },
  "html": "<table role=\"presentation\" width=\"100%\"...>...</table>"
}
```

All fields are primitive JSON types. The `html` field is the complete email-safe HTML that will be set as `htmlOverride`.

### Where to store in MongoDB

In the `vt4.gallery_content` collection, inside the `params` object of an email gallery item:

```json
{
  "_id": 9001,
  "type": "email",
  "title": "Acme — Starter",
  "shop": 1,
  "gatt": "sys_top",
  "params": {
    "builder": { ...EmailDocument... },
    "theme":   { ...Theme... },
    "custom_modules": [
      { "type": "acme.promo.strip", "name": "...", "html": "..." },
      { "type": "acme.nav.tabs",   "name": "...", "html": "..." }
    ]
  }
}
```

### Python backend (gallery.py)

System-level gallery items with hardcoded themes and custom blocks are defined as Python dicts in `routes/gallery.py`. They are merged into the `/gallery-content` list response when `scope=system` or `scope=all`:

```python
_MY_THEME = {
    "id": "my-brand",
    "name": "My Brand",
    "tokens": {
        "colors": {
            "background": "#F4F5F6",
            "surface": "#FFFFFF",
            "primary": "#E05020",
            "text": "#111827",
            "muted": "#6B7280",
            "buttonBackground": "#E05020",
            "buttonText": "#FFFFFF",
        },
        "fonts": {
            "heading": "Arial, Helvetica, sans-serif",
            "body":    "Arial, Helvetica, sans-serif",
            "button":  "Arial, Helvetica, sans-serif",
        },
        "spacing": {"xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 40},
        "radius":  {"sm": 4, "md": 8, "lg": 12},
    },
}

_BUILTIN_SYSTEM_ITEMS = [
    {
        "_id": 9001,
        "type": "email",
        "title": "My Brand \u2014 Starter",
        "shop": 1,
        "gatt": "sys_top",
        "deleted": False,
        "description": "Starter email for My Brand.",
        "tags": ["my-brand", "ecommerce", "starter", "tenant"],
        "params": {
            "builder": _MY_DOCUMENT,     # full EmailDocument dict
            "theme":   _MY_THEME,        # Theme dict
            "custom_modules": [          # serialized block definitions
                {
                    "type":        "mybrand.promo.strip",
                    "name":        "Promo Strip",
                    "description": "Dark promotional banner.",
                    "tags":        ["my-brand", "promo", "custom"],
                    "style":       {"backgroundColor": "#1C1C1C"},
                    "html":        "<table ...>...</table>",
                },
            ],
        },
    },
]
```

### IDs for hardcoded items

Use IDs in the **9000–9999** range for hardcoded system items to avoid collision with auto-increment DB IDs:

| Range | Use |
|---|---|
| `9001–9099` | Brand starter templates |
| `9100–9199` | Reserved for future use |

---

## 7. Host app integration

### Option A — Static TypeScript (code-defined themes + blocks)

Best for: known tenants whose themes/blocks change rarely.

```tsx
// theme + blocks defined in code:
import { hamangiuTheme }  from "./hamangiu-theme";
import { hamangiuBlocks } from "./hamangiu-blocks";
import { defaultThemes }  from "@one-million-lines/email-builder";

<EmailBuilder
  themes={[hamangiuTheme, ...defaultThemes]}
  modules={hamangiuBlocks}
  initialDocument={hamangiuStarterDef.build()}
/>
```

### Option B — Dynamic loading from gallery API

Best for: many tenants or frequently-changing brand configs.

The `useGalleryTemplates()` hook (in `panel.vtcdn.net/my/src/hooks/useGalleryTemplates.js`) fetches gallery items and registers everything automatically after mount:

```js
// In any component that renders <EmailBuilder> for an email channel:
useGalleryTemplates({ enabled: effectiveChannel === 'email' })
```

The hook (scope=all) fetches both system and account gallery items and for each:
1. Registers a `TemplateDefinition` (in "Browse templates" modal)
2. Calls `registerTheme()` (appears in Themes panel)
3. Deserializes `params.custom_modules` and calls `registerModule()` for each (appears in Custom tab)

### Combining both approaches

Pass static tenant modules via `modules` prop AND let the hook add dynamic ones from the gallery:

```tsx
// In TenantEmailBuilder.tsx:
const config = TENANT_CONFIGS[tenantId];   // { themes, modules, starterTemplate }

<EmailBuilder
  themes={config.themes}
  modules={config.modules}               // static custom blocks (sync, available at mount)
  initialDocument={config.starterTemplate.build()}
/>
```

Gallery-loaded custom blocks register asynchronously after mount via `registerModule()`. Both static and dynamic blocks appear together in the Custom tab.

### `useGalleryTemplates` hook API

```js
import { useGalleryTemplates } from '@/hooks/useGalleryTemplates'

// All gallery items (scope=all), always enabled:
useGalleryTemplates()

// Only for email channel (skip for text/push/html):
useGalleryTemplates({ enabled: effectiveChannel === 'email' })
```

**What it registers:**

| `params` field | Action | Where it appears |
|---|---|---|
| `params.builder` | `templateRegistry.register(def)` | Browse Templates modal |
| `params.theme` | `registerTheme(theme)` | Themes panel |
| `params.custom_modules[*]` | `registerModule(def)` | Custom tab in sidebar |

---

## 8. Gallery item structure

A `gallery_content` document that provides full tenant branding must include:

```json
{
  "_id": 9001,
  "type": "email",
  "title": "Brand — Starter",
  "shop": 1,
  "gatt": "sys_top",
  "deleted": false,
  "description": "One-line description for the gallery card.",
  "tags": ["brand-id", "ecommerce", "starter", "tenant"],
  "params": {
    "builder": {
      "version": "1.0",
      "meta": { "name": "...", "previewText": "..." },
      "theme": { "id": "...", "name": "...", "tokens": { ... } },
      "settings": {
        "width": 600,
        "backgroundColor": "{colors.background}",
        "contentBackgroundColor": "{colors.surface}"
      },
      "modules": [ ...EmailModule[] ... ]
    },
    "theme": {
      "id": "brand-id",
      "name": "Brand Name",
      "tokens": { "colors": {...}, "fonts": {...}, "spacing": {...}, "radius": {...} }
    },
    "custom_modules": [
      {
        "type": "brand.category.blockName",
        "name": "Block Name",
        "description": "What this block does.",
        "tags": ["brand-id", "tag1", "custom"],
        "style": { "backgroundColor": "#FFFFFF", "paddingTop": 0, "paddingBottom": 0 },
        "html": "<!-- email-safe HTML table markup -->"
      }
    ]
  }
}
```

**Note:** `params.theme` is optional but recommended. It lets the frontend extract just the theme for the Themes panel without reading the full 30–50 kB `params.builder` document. If omitted, `params.builder.theme` is used as a fallback.

---

## 9. End-to-end data flow

### At editor open (panel.vtcdn.net/my)

```
1. content-edit.jsx mounts → <EmailBuilder> renders
   - `modules` prop: empty (no static modules for generic accounts)
   - `themes` prop: not passed → defaults to 5 built-in themes

2. useGalleryTemplates hook fires (async):
   GET /gallery-content?type=email&scope=all&limit=100

3. Response includes system items (9001 Hamangiu, 9002 Feroshop)
   and account's own saved gallery items.

4. For each item, the hook calls:
   a. templateRegistry.register(...)   → appears in Browse Templates modal
   b. registerTheme(theme)             → theme appears in Themes panel
   c. registerModule(...) per custom_module → custom blocks appear in Custom tab

5. LeftSidebar detects customModulesRevision increment → re-renders → shows
   purple "Custom" tab with all registered blocks
```

### Template loading flow

```
User clicks "Browse templates" → picks "Hamangiu — Starter"
→ templateRegistry.build() called → returns EmailDocument with hamangiuTheme
→ useEmailStore.loadTemplate() called → document replaced
→ Editor re-renders with Hamangiu brand colors, fonts, layout
```

### Theme switching flow

```
User opens Themes panel → sees "Hamangiu" + 5 built-in themes
→ clicks "Hamangiu" → applyTheme(hamangiuTheme) called
→ all token references ({colors.primary} etc.) resolve to Hamangiu colors
→ canvas re-renders with new brand colors; content unchanged
```

---

## 10. Complete reference examples

### Built-in tenant configs (this repository)

| File | Tenant | Theme | Custom blocks | Template |
|---|---|---|---|---|
| `hamangiu-theme.ts` | Hamangiu (books) | Steel-blue bg, orange CTAs | `hamangiu-blocks.ts` | Product recommendation email |
| `feroshop-theme.ts` | Feroshop (hardware B2B) | Light-gray bg, orange CTAs, dark accents | `feroshop-blocks.ts` | B2B campaign email |

### Hamangiu brand summary

```ts
// Theme tokens
background:       "#D6E4EF"   // steel blue
surface:          "#FFFFFF"
primary:          "#F07638"   // warm orange
text:             "#1A1A2E"
muted:            "#6B7280"
buttonBackground: "#F07638"
buttonText:       "#FFFFFF"
radius:           { sm: 2, md: 4, lg: 8 }  // low = editorial feel

// Custom blocks
hamangiu.nav.categories      — horizontal tab bar (Noutati · In curs · Recomandam · Comunitate)
hamangiu.content.book_feature — 2-col: book cover + title/author/price/CTA
hamangiu.promo.badge          — full-width orange promo strip
```

### Feroshop brand summary

```ts
// Theme tokens
background:       "#F4F5F6"   // very light gray
surface:          "#FFFFFF"
primary:          "#E05020"   // Feroshop orange (darker, more red-orange)
text:             "#111827"
muted:            "#6B7280"
buttonBackground: "#E05020"
buttonText:       "#FFFFFF"
radius:           { sm: 4, md: 8, lg: 12 }  // slightly rounder

// Custom blocks
feroshop.header.promo_strip  — dark (#1C1C1C) promo banner: "Comanzi 250. Platesti 225."
feroshop.promo.deal_badge    — 7+1 GRATIS split block (orange badge + CTA)
feroshop.content.b2b_features — 3-col trust icons (Produse verificate · Livrare rapida · Suport tehnic)
```

---

## 11. AI agent checklists

### Adding a new tenant theme

- [ ] Identify the brand's primary color, background, and surface colors from the website
- [ ] Map the website's CTA button color to `buttonBackground` / `primary`
- [ ] Choose radius style (low: professional; high: casual)
- [ ] Set `id` to a kebab-case slug matching the tenant name
- [ ] Create `examples/tenant-themes/{tenantId}-theme.ts`
- [ ] Export `const {tenantId}Theme: Theme = { ... }`
- [ ] Add a starter `TemplateDefinition` as the default export
- [ ] Call `templateRegistry.register(def)` at module level in the file
- [ ] Add tenant to `TENANT_CONFIGS` in `TenantEmailBuilder.tsx`
- [ ] Add system gallery item to `_BUILTIN_SYSTEM_ITEMS` in `gallery.py` (ID in 9000-range)

### Adding custom blocks for a tenant

- [ ] Create `examples/tenant-themes/{tenantId}-blocks.ts`
- [ ] Use `category: "custom"` for every block
- [ ] Name blocks with dot-notation: `{tenantId}.{category}.{blockName}`
- [ ] Use `htmlOverride` for complex table-based HTML layouts
- [ ] Verify HTML follows email-safe rules (section 5)
- [ ] Call `uid("module")` in `create()` for fresh module IDs
- [ ] Export a `{tenantId}Blocks: ModuleDefinition[]` array
- [ ] Import and pass `modules` in `TenantEmailBuilder.tsx`
- [ ] Add `custom_modules` to the system gallery item in `gallery.py`

### Creating the serialized `custom_modules` Python entry

For each custom block, add a dict with these keys:
- `"type"`: match the TypeScript `type` exactly
- `"name"`: match the TypeScript `name` exactly
- `"description"`: human-readable one-liner
- `"tags"`: list of search keywords
- `"style"`: container style dict (background, padding, mobile)
- `"html"`: complete email-safe HTML as a single-line string with escaped double-quotes

Escape double-quotes in `html` value: `\"` → `\\"`  
Escape backslashes: `\` → `\\`  
Use HTML entities for special characters instead of raw Unicode in Python strings.

### AI agent prompt template

```
Add a new tenant theme to the email-builder project at:
/Users/.../email-builder/examples/tenant-themes/

Tenant: [TENANT_NAME]
Website: [URL]
Primary color: [HEX]
Background: [HEX or description]
Font: [font name or "Arial (default)"]

Steps:
1. Create [tenantId]-theme.ts following the pattern in hamangiu-theme.ts
2. Create [tenantId]-blocks.ts with 2–3 custom blocks using htmlOverride
3. Update TenantEmailBuilder.tsx to include the new tenant
4. Add a system gallery item to gallery.py with:
   - params.theme: the Theme object
   - params.builder: an EmailDocument
   - params.custom_modules: the serialized blocks
5. Bump the email-builder minor version in package.json
6. Run npm run build and rsync dist to the panel node_modules
7. Verify npm test passes (22 tests)

Reference: examples/tenant-themes/TENANT_THEMING_GUIDE.md (this file)
```

---

## Appendix: exported API reference

All from `@one-million-lines/email-builder`:

### Runtime registration

| Export | Signature | Description |
|---|---|---|
| `registerTheme` | `(theme: Theme) → void` | Add theme to Themes panel. No-op if already registered (by `id`). |
| `registerModule` | `(def: ModuleDefinition) → void` | Add module. If `category="custom"`, increments `customModulesRevision` to show Custom tab. |
| `templateRegistry.register` | `(def: TemplateDefinition) → void` | Add template to Browse Templates modal. |
| `clearEmailBuilderDocument` | `() → void` | Wipe localStorage draft. Call before mounting for a new session. |

### Theme utilities

| Export | Type | Description |
|---|---|---|
| `defaultThemes` | `Theme[]` | All 5 built-in theme presets |
| `minimalSaaS` | `Theme` | Blue SaaS preset |
| `ecommercePromo` | `Theme` | Orange ecommerce preset |
| `luxuryBlack` | `Theme` | Dark luxury preset |
| `greenEco` | `Theme` | Green eco preset |
| `newsletterEditorial` | `Theme` | Serif newsletter preset |

### Document building helpers

| Export | Returns | Description |
|---|---|---|
| `uid(prefix?)` | `string` | Unique ID generator. Use `uid("module")` and `uid("el")`. |
| `mod(type, name, children, style?)` | `EmailModule` | Create a section/row |
| `text(content, opts?)` | `EmailElement` | Generic text element |
| `heading(content, opts?)` | `EmailElement` | Bold heading (uses `{fonts.heading}`) |
| `eyebrow(content, opts?)` | `EmailElement` | Small uppercase label in `{colors.primary}` |
| `muted(content, opts?)` | `EmailElement` | Secondary text in `{colors.muted}` |
| `image(src, alt, opts?)` | `EmailElement` | Image element |
| `button(label, link, opts?)` | `EmailElement` | CTA button |
| `spacer(height?)` | `EmailElement` | Vertical spacer |
| `divider(opts?)` | `EmailElement` | Horizontal rule |
| `product(partial)` | `Product` | Product entry for a grid |
| `productGrid(products, opts?)` | `EmailElement` | 1–3 column product grid |
| `footerLinks(links, opts?)` | `EmailElement` | Footer link row with VT special link types |
| `logoImage(src, opts?)` | `EmailElement` | Logo image (VT-marked as `vtw-logo`) |
| `shopInfoText(placeholder, opts?)` | `EmailElement` | Shop address text (VT-marked as `vtw-info`) |
| `PLACEHOLDER(w, h, label?)` | `string` | `placehold.co` URL for mock images |
