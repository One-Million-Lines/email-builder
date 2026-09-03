# Email Builder — Template & Block Authoring Guide

> **AI Agent Instructions:** Use this document as the authoritative reference when creating new email templates or blocks. Every template must conform to the `EmailDocument` JSON schema. All element `id` values must be unique within the document — always generate them with the `uid()` helper. All style values that reference design tokens must use the `{token.path}` syntax (e.g., `{colors.primary}`). Never hardcode hex values when an equivalent theme token exists.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [The EmailDocument model](#2-the-emaildocument-model)
3. [Theme & design tokens](#3-theme--design-tokens)
4. [Elements (blocks)](#4-elements-blocks)
5. [Modules (sections)](#5-modules-sections)
6. [Helper functions](#6-helper-functions)
7. [Special link types](#7-special-link-types)
8. [Merge tags (personalisation tokens)](#8-merge-tags-personalisation-tokens)
9. [Creating a new template](#9-creating-a-new-template)
10. [Creating a new module definition](#10-creating-a-new-module-definition)
11. [Template categories](#11-template-categories)
12. [Complete template example](#12-complete-template-example)
13. [Checklist before committing](#13-checklist-before-committing)

---

## 1. Architecture overview

```
EmailDocument
└── modules[]          ← EmailModule (a visual "section" / "row")
    └── children[]     ← EmailElement (text | image | button | spacer | divider | productGrid)
```

- **EmailDocument** — the root. Contains metadata, a theme, global settings, and an ordered list of modules.
- **EmailModule** — a full-width section (header, hero, product grid, footer, etc.). Has its own background colour, padding, and an array of child elements.
- **EmailElement** — the atomic content unit. One of six types.

The document is stored as plain JSON and rendered to table-based HTML by `src/core/renderer.ts`. The editor operates directly on the JSON; there is no virtual DOM layer between the JSON and the rendered preview.

---

## 2. The EmailDocument model

```ts
interface EmailDocument {
  version: "1.0";

  meta: {
    name: string;          // Internal label, used in the editor title bar
    previewText: string;   // Shown in inbox preview (hidden text in HTML head)
  };

  theme: Theme;            // Design tokens — see §3

  settings: {
    width: number;                  // Pixel width of the email body (usually 600)
    backgroundColor: string;        // Outer wrapper background (use token)
    contentBackgroundColor: string; // Inner content column background (use token)
  };

  modules: EmailModule[];  // Ordered list of sections
}
```

### Valid settings example

```ts
settings: {
  width: 600,
  backgroundColor: "{colors.background}",
  contentBackgroundColor: "{colors.surface}",
}
```

---

## 3. Theme & design tokens

Every theme has an `id`, a `name`, and a `tokens` object with four sub-objects.

```ts
interface ThemeTokens {
  colors: Record<string, string>;   // Named hex values
  fonts:  Record<string, string>;   // Named font-stack strings
  spacing: Record<string, number>;  // Named pixel values (rarely used in elements directly)
  radius:  Record<string, number>;  // Named border-radius px values
}
```

### Standard token names

| Token | Typical value | Used for |
|---|---|---|
| `{colors.primary}` | brand colour | Buttons, links, accents |
| `{colors.background}` | page background | Email outer wrapper |
| `{colors.surface}` | white / near-white | Content column background |
| `{colors.text}` | near-black | Body text |
| `{colors.muted}` | medium grey | Captions, footer text |
| `{colors.buttonBackground}` | CTA colour | Button background |
| `{colors.buttonText}` | white | Button label |
| `{fonts.body}` | system/Google font | Body text |
| `{fonts.heading}` | serif / display font | Headlines |
| `{fonts.button}` | system font | Button labels |

### Token reference syntax

To reference a token in any style field, write the exact path in braces:

```ts
{ color: "{colors.primary}", fontFamily: "{fonts.heading}" }
```

The renderer resolves these at render time. **Always prefer tokens over hardcoded hex values.**

### Available themes (from `src/themes/defaultThemes.ts`)

Import by name:
```ts
import { minimalSaaS, ecommercePromo, publisherClassic, warmCreator, boldBrand } from "../themes/defaultThemes";
```

Pick the theme that best fits the template category:
- `minimalSaaS` — clean blue/white, good for onboarding, transactional
- `ecommercePromo` — orange accent, good for sales/promotions
- `publisherClassic` — serif heading, muted palette, good for newsletters
- `warmCreator` — warm off-white, personal tone, good for creator newsletters
- `boldBrand` — strong contrast, large typography, good for launches

---

## 4. Elements (blocks)

All elements have a mandatory `id` string (always generated via `uid("el")`). Every element is typed by `type`.

### 4.1 Text element

```ts
interface TextElement {
  id: string;
  type: "text";
  role?: "headline" | "subheadline" | "body" | "caption" | "voucherCode";
  content: string;   // Plain text OR limited HTML: <b>, <i>, <a href="...">
  style?: {
    fontFamily?: string;      // Font-stack or token
    fontSize?: number;        // px
    lineHeight?: number;      // unitless multiplier, e.g. 1.5
    letterSpacing?: number;   // px
    fontWeight?: number | string; // 400 | 700 | "bold" | etc.
    color?: string;           // Hex or token
    align?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    link?: string;            // Makes entire element a hyperlink
    linkType?: SpecialLinkType; // see §7
    backgroundColor?: string;
    borderRadius?: number;
    hideOn?: "mobile" | "desktop";
    mobile?: Record<string, unknown>; // Overrides applied at ≤600 px breakpoint
  };
}
```

**Content HTML rules:**
- Only `<b>`, `<i>`, `<a>` tags are safe in all email clients.
- `<br/>` produces a line break. Use `\n` in templates (the editor converts them).
- For multiple inline links on one line (e.g., footer), put the full `<a>` tags in `content` with `data-link-type` attributes — see §7.

### 4.2 Image element

```ts
interface ImageElement {
  id: string;
  type: "image";
  src: string;          // Absolute URL — use PLACEHOLDER() helper in templates
  alt?: string;
  link?: string;        // Optional click-through URL
  linkType?: SpecialLinkType; // see §7
  style?: {
    width?: number;     // px (display width, not intrinsic)
    height?: number;    // optional fixed height
    align?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
    borderRadius?: number;
    hideOn?: "mobile" | "desktop";
    mobile?: Record<string, unknown>;
  };
}
```

**Mobile images:** If `width > 343`, the renderer automatically adds a mobile rule capping the image to 343 px. Set `mobile.width` explicitly to override this.

### 4.3 Button element

```ts
interface ButtonElement {
  id: string;
  type: "button";
  label: string;        // Button text
  link: string;         // href
  linkType?: SpecialLinkType; // see §7
  style?: {
    backgroundColor?: string; // Token or hex
    color?: string;           // Token or hex
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
    borderRadius?: number;    // px
    align?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
    mobile?: Record<string, unknown>;
  };
}
```

The renderer outputs VML/Outlook-compatible button HTML automatically.

### 4.4 Spacer element

```ts
interface SpacerElement {
  id: string;
  type: "spacer";
  height: number; // px
}
```

Use spacers to add vertical white space between elements.

### 4.5 Divider element

```ts
interface DividerElement {
  id: string;
  type: "divider";
  style?: {
    color?: string;       // Line colour, default "#E5E7EB"
    thickness?: number;   // px, default 1
    paddingTop?: number;
    paddingBottom?: number;
  };
}
```

### 4.6 ProductGrid element

```ts
interface ProductGridElement {
  id: string;
  type: "productGrid";
  products: Product[];
  columns: 1 | 2 | 3;   // Desktop columns; always stacks to 1 on mobile
  showOldPrice: boolean;
  showButton: boolean;
  showDescription: boolean;
  showStars?: boolean;
  buttonLabel?: string;  // Default button label for all cards
  style?: {
    nameColor?: string;
    finalPriceColor?: string;
    oldPriceColor?: string;
    buttonBackgroundColor?: string;
    buttonColor?: string;
    gap?: number;
    cardBackgroundColor?: string;
    borderRadius?: number;
    align?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
}

interface Product {
  id: string;
  image: string;
  imageAlt?: string;
  name: string;
  oldPrice?: string;   // e.g. "$59" — displayed with strikethrough
  finalPrice: string;  // e.g. "$29"
  description?: string;
  link?: string;
  buttonLabel?: string; // Overrides productGrid.buttonLabel for this card
  stars?: number;       // 0–5
}
```

### 4.7 Mobile overrides

Every element style (except spacer and divider) can include a `mobile` sub-object. Any key placed there overrides the corresponding desktop value at the `@media (max-width:600px)` breakpoint.

```ts
style: {
  fontSize: 32,
  mobile: { fontSize: 22 }   // Use 22px on mobile
}
```

---

## 5. Modules (sections)

```ts
interface EmailModule {
  id: string;      // Generated with uid("module")
  type: string;    // Semantic identifier, e.g. "header.logo", "cta.simple"
  name: string;    // Human label shown in the Layers panel
  style?: {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    borderRadius?: number;
    hideOn?: "mobile" | "desktop";
    mobile?: Record<string, unknown>;
  };
  children: EmailElement[];
  data?: Record<string, unknown>; // Plugin-specific data (e.g. recommendations config)
}
```

### Module type naming convention

```
{category}.{descriptor}
```

Examples: `header.logo`, `hero.simple`, `content.checklist`, `cta.double`, `footer.legal`, `ecom.product_grid`.

### Module categories (used in the sidebar)

| Category key | Sidebar label |
|---|---|
| `basic` | Basic |
| `menu` | Menu |
| `header` | Header |
| `content` | Content |
| `feature` | Feature |
| `call_to_action` | CTA |
| `ecommerce` | Ecommerce |
| `transactional` | Transactional |
| `social` | Social |
| `footer` | Footer |

### Default module style

When creating a module with the `mod()` helper with no explicit style, this default is applied:

```ts
{
  backgroundColor: "{colors.surface}",
  paddingTop: 16,
  paddingBottom: 16,
  mobile: { paddingLeft: 0, paddingRight: 0 },
}
```

Footer modules typically override this with the background colour:

```ts
{
  backgroundColor: "{colors.background}",
  paddingTop: 0,
  paddingBottom: 0,
}
```

---

## 6. Helper functions

All helpers are in `src/modules/helpers.ts`. Import them in templates:

```ts
import {
  mod, text, image, button, spacer, divider,
  heading, eyebrow, muted, voucherCode, footerLinks,
  product, productGrid, PLACEHOLDER,
} from "../modules/helpers";
```

### `text(content, opts?)` → TextElement

Creates a text element with sensible mobile defaults.

| Option | Default | Description |
|---|---|---|
| `role` | — | Semantic role (headline, caption, voucherCode, …) |
| `fontSize` | 16 | px |
| `fontFamily` | `{fonts.body}` | |
| `fontWeight` | — | 400/700/"bold" |
| `color` | `{colors.text}` | |
| `align` | `"left"` | |
| `paddingTop/Bottom/Left/Right` | 8/8/24/24 | px |
| `lineHeight` | 1.5 | |
| `link` | — | Makes element clickable |
| `linkType` | — | Special link role (see §7) |

**Auto mobile:** `paddingLeft/Right` → 16 px; `fontSize ≥ 28` is scaled down ~22%.

### `heading(content, opts?)` → TextElement

Shortcut for a bold headline with heading font.

| Option | Default |
|---|---|
| `level` | 2 |
| `align` | — |
| `fontSize` | `{1:32, 2:24, 3:18}` |

### `eyebrow(content, opts?)` → TextElement

All-caps small label in brand colour. Used above headlines.

### `muted(content, opts?)` → TextElement

Small grey text. Use for captions, subtitles, footer text.

| Option | Default |
|---|---|
| `fontSize` | 14 |
| `color` | `{colors.muted}` |

### `image(src, alt, opts?)` → ImageElement

| Option | Default |
|---|---|
| `width` | 552 |
| `align` | `"center"` |

### `button(label, link?, opts?)` → ButtonElement

| Option | Default |
|---|---|
| `backgroundColor` | `{colors.buttonBackground}` |
| `color` | `{colors.buttonText}` |
| `fontSize` | 16 |
| `borderRadius` | 8 |
| `align` | `"center"` |
| `linkType` | — |

### `spacer(height?)` → SpacerElement

Default height: 16 px.

### `divider(opts?)` → DividerElement

| Option | Default |
|---|---|
| `color` | `"#E5E7EB"` |
| `thickness` | 1 |

### `voucherCode(code, opts?)` → TextElement

Big, centred, bold text marked with `role: "voucherCode"`. The voucher-select plugin uses this role to locate and populate voucher blocks.

### `footerLinks(links, opts?)` → TextElement

Creates a text element with multiple inline `<a>` links, each carrying a `data-link-type` attribute. **Use this in footers instead of a plain text element when you have multiple special links on the same line.**

```ts
footerLinks([
  { label: "Unsubscribe",         type: "unsubscribe" },
  { label: "View in browser",     type: "view_in_browser" },
  { label: "Manage preferences",  type: "manage_preferences" },
], { align: "center", fontSize: 12, paddingBottom: 24 })
```

| Option | Default |
|---|---|
| `align` | `"center"` |
| `fontSize` | 12 |
| `color` | `{colors.muted}` |
| `separator` | `" · "` |

### `product(props)` → Product

```ts
product({ name: "Tote Bag", finalPrice: "$29", oldPrice: "$59" })
```

If `image` is omitted, a placeholder is generated automatically.

### `productGrid(products, opts?)` → ProductGridElement

| Option | Default |
|---|---|
| `columns` | 3 if ≥3 products, else 2 |
| `showOldPrice` | `true` if any product has `oldPrice` |
| `showButton` | `true` |
| `showDescription` | `false` |

### `PLACEHOLDER(width, height, label?)` → string

Returns a `https://placehold.co/WxH?text=...` URL. Use for demo images in templates.

### `mod(type, name, children, style?)` → EmailModule

Generates a module with a fresh `uid("module")` id.

---

## 7. Special link types

Certain links in emails (unsubscribe, view in browser, etc.) need to be replaced at send time with real, per-recipient URLs. Mark these links with a `linkType` so backend processors can find them reliably.

### Supported types

| `linkType` | Placeholder href | Purpose |
|---|---|---|
| `"unsubscribe"` | `{{unsubscribe_url}}` | One-click unsubscribe |
| `"view_in_browser"` | `{{view_in_browser_url}}` | Open email as web page |
| `"manage_preferences"` | `{{manage_preferences_url}}` | Subscription centre |
| `"user_profile"` | `{{user_profile_url}}` | User account page |

### How to apply on a single-link element

```ts
// Text element
text("Unsubscribe", {
  link: "{{unsubscribe_url}}",
  linkType: "unsubscribe",
  color: "{colors.muted}",
  fontSize: 12,
  align: "center",
})

// Button element
button("Manage my preferences", "{{manage_preferences_url}}", {
  linkType: "manage_preferences",
})
```

### How to apply on a multi-link footer line

Use `footerLinks()` — it generates the full `<a>` tags with `data-link-type` attributes in the HTML content:

```ts
footerLinks([
  { label: "Unsubscribe",   type: "unsubscribe" },
  { label: "View in browser", type: "view_in_browser" },
])
```

### How the backend identifies them

The rendered HTML carries two markers that processors can use independently:

1. **`data-link-type` attribute** on the `<a>` tag:
   ```html
   <a href="{{unsubscribe_url}}" data-link-type="unsubscribe">Unsubscribe</a>
   ```

2. **Placeholder href pattern** `{{..._url}}` — simple string matching in the raw HTML.

Backends should replace the `href` value with the actual per-recipient URL before delivery.

### In the editor sidebar

When editing a **Text**, **Image**, or **Button** element:
1. Fill in the Link URL field.
2. Use the **Link role** dropdown to select the semantic purpose.
3. The placeholder URL is auto-populated when a role is selected.

---

## 8. Merge tags (personalisation tokens)

Merge tags allow personalised content like `{user.firstname}` to be embedded in email text. They are replaced by backend processors before delivery.

### Syntax

```
{attribute.path}
```

Examples: `{user.firstname}`, `{user.email}`, `{order.id}`, `{company.name}`

### Configuring merge tags in the editor

Pass a `mergeTags` prop to `<EmailBuilder>`:

```tsx
<EmailBuilder
  mergeTags={[
    { attribute: "user.firstname",  title: "First name" },
    { attribute: "user.lastname",   title: "Last name" },
    { attribute: "user.email",      title: "Email address" },
    { attribute: "company.name",    title: "Company name" },
    { attribute: "order.id",        title: "Order ID" },
  ]}
/>
```

Or register via the plugin API:

```ts
import { builder } from "@one-million-lines/email-builder";
builder.registerMergeTags([
  { attribute: "user.firstname", title: "First name" },
]);
```

### Using merge tags in templates

Embed the placeholder directly in the text `content`:

```ts
text("Hi {user.firstname}, welcome to Acme!")
text("Your order {order.id} has shipped.")
```

In the editor, the **Insert merge tag** dropdown (visible when `mergeTags` are configured) appends the selected `{attribute}` to the current text content.

---

## 9. Creating a new template

### File location

```
src/templates/myTemplateName.ts
```

### Registration

Every template file must:
1. Export a `TemplateDefinition` object as `def`.
2. Call `templateRegistry.register(def)` at module level.
3. Import the file in `src/templates/index.ts`.

### Template definition shape

```ts
const def: TemplateDefinition = {
  id: "my-template",          // Unique kebab-case string
  name: "My Template Name",   // Human label
  category: "newsletter",     // See §11
  description: "...",         // One-line description (also used by AI)
  tags: ["tag1", "tag2"],     // Free-form search tags
  thumbnail: "https://...",   // Optional preview image (PLACEHOLDER() is fine)
  build: (): EmailDocument => ({
    version: "1.0",
    meta: { name: "...", previewText: "..." },
    theme: minimalSaaS,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [...],
  }),
};

templateRegistry.register(def);
export default def;
```

### Recommended module order

```
1. header.logo       (logo or brand name)
2. hero.*            (main visual / headline)
3. content.*         (body copy, checklist, features, …)
4. [ecom.* / cta.*] (optional product grid or call to action)
5. footer.*          (legal text, unsubscribe links)
```

### Id generation

Use `uid("el")` for elements and `uid("module")` for modules. Never hardcode ids — the `build()` function is called fresh each time a template is loaded, so every call must produce new unique ids to avoid collisions if the template is loaded multiple times.

---

## 10. Creating a new module definition

Module definitions live in `src/modules/`. The category files (`header.ts`, `footer.ts`, `cta.ts`, etc.) export an array of `ModuleDefinition` objects that are registered in `defaultModules.ts`.

### ModuleDefinition shape

```ts
interface ModuleDefinition {
  type: string;           // Unique dot-separated type key, e.g. "cta.double_button"
  category: ModuleCategory;
  name: string;           // Human label shown in the sidebar
  description: string;    // Shown on hover; also used by AI for block selection
  tags?: string[];        // Free-form search/AI tags
  create: () => EmailModule; // Factory — called when user drags/clicks to add
}
```

### Example

```ts
import { mod, heading, text, button, spacer } from "./helpers";
import type { ModuleDefinition } from "./registry";

const def: ModuleDefinition = {
  type: "cta.countdown",
  category: "call_to_action",
  name: "Countdown CTA",
  description: "Urgency-focused CTA with a bold headline and large button.",
  tags: ["cta", "urgency", "countdown", "sale"],
  create: () =>
    mod("cta.countdown", "Countdown CTA", [
      heading("Offer ends tonight", { align: "center", fontSize: 28 }),
      text("Don't miss your chance.", { align: "center", paddingBottom: 8 }),
      button("Shop now →", "#"),
      spacer(16),
    ]),
};
```

Register it in `src/modules/defaultModules.ts` by adding it to the appropriate category array.

---

## 11. Template categories

| Category | When to use |
|---|---|
| `"newsletter"` | Recurring editorial / curated content emails |
| `"ecommerce"` | Product promotions, sales, shop updates |
| `"abandoned_cart"` | Re-engagement for abandoned shopping carts |
| `"product_launch"` | New product announcements |
| `"onboarding"` | Welcome, activation, getting-started sequences |
| `"event"` | Invitations, confirmations, reminders |
| `"transactional"` | Order confirmations, receipts, alerts |
| `"publishing"` | Blog digests, media newsletters |

---

## 12. Complete template example

```ts
// src/templates/summerSale.ts
import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { ecommercePromo } from "../themes/defaultThemes";
import {
  mod, text, heading, button, spacer, muted,
  productGrid, product, footerLinks, PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "summer-sale",
  name: "Summer Sale",
  category: "ecommerce",
  description: "Seasonal sale promotion with hero banner, product grid, and urgency CTA.",
  tags: ["ecommerce", "sale", "summer", "discount", "seasonal"],
  thumbnail: PLACEHOLDER(600, 400, "Summer+Sale"),

  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Summer Sale — Up to 40% Off",
      previewText: "Our biggest summer sale starts now. Shop before it's gone.",
    },
    theme: ecommercePromo,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      // ── Logo header ─────────────────────────────────────────────
      mod("header.logo", "Logo", [
        mod_image_placeholder(),   // see note below
      ]),

      // ── Hero banner ──────────────────────────────────────────────
      mod(
        "hero.sale_banner",
        "Hero",
        [
          text("☀️ SUMMER SALE", {
            align: "center",
            color: "{colors.buttonText}",
            fontWeight: "bold",
            letterSpacing: 3,
            paddingTop: 32,
          }),
          heading("Up to 40% off everything", {
            align: "center",
            fontSize: 36,
            paddingBottom: 8,
          }),
          button("Shop the sale", "#"),
          spacer(24),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),

      // ── Featured products ────────────────────────────────────────
      mod("ecom.featured", "Products", [
        heading("Today's top picks", { align: "center", fontSize: 22, paddingTop: 24 }),
        productGrid(
          [
            product({ name: "Linen Shirt",    finalPrice: "$45",  oldPrice: "$75",  stars: 4.5 }),
            product({ name: "Woven Tote",     finalPrice: "$29",  oldPrice: "$49" }),
            product({ name: "Straw Hat",      finalPrice: "$35",  oldPrice: "$55",  stars: 5 }),
          ],
          { columns: 3, showOldPrice: true, showStars: true, buttonLabel: "Add to bag" }
        ),
      ]),

      // ── Final CTA ────────────────────────────────────────────────
      mod("cta.final", "Final CTA", [
        text("Sale ends Sunday at midnight.", {
          align: "center",
          fontWeight: "bold",
          paddingTop: 24,
          paddingBottom: 8,
        }),
        button("View all deals", "#"),
        spacer(24),
      ]),

      // ── Footer ───────────────────────────────────────────────────
      mod(
        "footer.simple",
        "Footer",
        [
          muted("© 2026 Acme Co · 100 Market St · San Francisco, CA", {
            align: "center",
            paddingTop: 24,
          }),
          footerLinks([
            { label: "Unsubscribe",        type: "unsubscribe" },
            { label: "Manage preferences", type: "manage_preferences" },
            { label: "View in browser",    type: "view_in_browser" },
          ]),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

templateRegistry.register(def);
export default def;
```

> **Note on nested `mod()` calls:** `mod()` returns an `EmailModule`, not an `EmailElement`. Do not nest a `mod()` call inside another `mod()`'s children array. Build flat module arrays and put content directly in `children`.

---

## 13. Checklist before committing

- [ ] Template has a unique `id` (kebab-case, no spaces)
- [ ] All element `id` values are generated with `uid("el")` (not hardcoded)
- [ ] All module `id` values are generated with `uid("module")`
- [ ] Style values use theme tokens (`{colors.*}`, `{fonts.*}`) where equivalent tokens exist
- [ ] The document includes a footer module
- [ ] The footer uses `footerLinks()` or `linkType` to mark unsubscribe/special links
- [ ] The `build()` function is a pure factory — no shared mutable state
- [ ] The template file is imported in `src/templates/index.ts`
- [ ] `templateRegistry.register(def)` is called at module level (not inside `build()`)
- [ ] `previewText` is non-empty and compelling (shown in inbox preview)
- [ ] Images use `PLACEHOLDER()` or absolute HTTPS URLs (no relative paths)

---

## AI Agent prompt template

Use the following prompt structure when asking an AI coding agent to create a new template:

```
Create a new email template for the email-builder project.

Template requirements:
- Purpose: [DESCRIBE THE USE CASE]
- Category: [newsletter | ecommerce | abandoned_cart | product_launch | onboarding | event | transactional | publishing]
- Theme: [minimalSaaS | ecommercePromo | publisherClassic | warmCreator | boldBrand]
- Tone: [formal | friendly | urgent | personal | editorial]
- Key sections: [LIST REQUIRED SECTIONS, e.g. "hero with headline, 3-product grid, CTA, footer"]
- Special requirements: [ANY SPECIFIC CONTENT OR LAYOUT NOTES]

Follow TEMPLATE_GUIDE.md exactly:
1. File: src/templates/[kebab-case-name].ts
2. Import helpers from ../modules/helpers
3. Import theme from ../themes/defaultThemes
4. Use uid("el") for all element ids, uid("module") for all module ids
5. Use {colors.*} and {fonts.*} tokens — no hardcoded hex values
6. Include a footer with footerLinks() marking unsubscribe and manage_preferences
7. Register with templateRegistry.register(def) at module level
8. Add the import to src/templates/index.ts
```
