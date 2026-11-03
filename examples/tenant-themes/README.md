# Tenant themes — integration guide

This example shows how to integrate **custom per-tenant brand themes and starter templates** into `@one-million-lines/email-builder` from any external React application.

## Files

| File | Purpose |
|---|---|
| `hamangiu-theme.ts` | Hamangiu brand `Theme` + starter `TemplateDefinition` |
| `TenantEmailBuilder.tsx` | Host React component — wires tenantId → theme + template |
| This `README.md` | Step-by-step guide |

---

## How themes work

Every email is stored as a JSON document with a `theme` object containing **design tokens**. Elements reference those tokens with `{colors.primary}` syntax. Switching the active theme re-styles the whole email visually without touching any content.

```ts
import type { Theme } from "@one-million-lines/email-builder";

export const myBrandTheme: Theme = {
  id:   "my-brand",      // unique — used to identify the theme in the store
  name: "My Brand",      // label shown in the Themes panel
  tokens: {
    colors: {
      background:       "#D6E4EF",  // outer wrapper (shows between content panels)
      surface:          "#FFFFFF",  // white content panels
      primary:          "#F07638",  // links, eyebrow labels, price text
      text:             "#1A1A2E",  // body text
      muted:            "#6B7280",  // secondary / caption text
      buttonBackground: "#F07638",  // CTA button fill
      buttonText:       "#FFFFFF",  // CTA button label
    },
    fonts: {
      heading: "Arial, Helvetica, sans-serif",
      body:    "Arial, Helvetica, sans-serif",
      button:  "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius:  { sm: 2, md: 4, lg: 8 },  // low = professional, high = casual
  },
};
```

---

## Combine tenant theme with generic presets

The `themes` prop **replaces** the builder's default list. Spread `defaultThemes` to keep the five built-in presets available as a fallback:

```tsx
import { EmailBuilder, defaultThemes } from "@one-million-lines/email-builder";
import { myBrandTheme } from "./my-brand-theme";

<EmailBuilder
  themes={[myBrandTheme, ...defaultThemes]}   // tenant brand first = pre-selected
  initialDocument={starterDoc}
/>
```

The first entry in the array is the active theme when the editor opens.

---

## Create a starter template for a tenant

A `TemplateDefinition` produces a fresh `EmailDocument` each time its `build()` is called.  
Register it so it appears in the **Templates** modal (top bar → "Browse templates").

```ts
import type { EmailDocument } from "@one-million-lines/email-builder";
import {
  templateRegistry, type TemplateDefinition,
  mod, heading, text, image, button, spacer,
  footerLinks, shopInfoText, PLACEHOLDER,
} from "@one-million-lines/email-builder";

import { myBrandTheme } from "./my-brand-theme";

const myStarterDef: TemplateDefinition = {
  id:          "my-brand-starter",
  name:        "My Brand — Starter",
  category:    "ecommerce",
  description: "Brand starter with orange CTA and product hero.",
  tags:        ["my-brand", "ecommerce", "tenant"],

  build: (): EmailDocument => ({
    version: "1.0",
    meta:    { name: "My Brand Email", previewText: "" },
    theme:   myBrandTheme,
    settings: {
      width:                  600,
      backgroundColor:        "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Header", [
        image(PLACEHOLDER(150, 40, "LOGO"), "Logo", { width: 150, align: "left" }),
      ], { backgroundColor: "#FFFFFF" }),

      mod("content.hero", "Hero", [
        image(PLACEHOLDER(560, 300, "PRODUCT IMAGE"), "Product"),
        heading("Product Headline"),
        text("Short product description."),
        button("Learn more", "#"),
        spacer(16),
      ]),

      mod("footer.legal", "Footer", [
        shopInfoText("My Company · 1 Main St · City"),
        footerLinks([
          { label: "Unsubscribe",         type: "unsubscribe" },
          { label: "View in browser",     type: "view_in_browser" },
        ]),
      ], { backgroundColor: "{colors.surface}" }),
    ],
  }),
};

templateRegistry.register(myStarterDef);
export default myStarterDef;
```

Register it in your host app before mounting the builder:

```ts
// In your app's entry point or before rendering the editor page:
import "./my-brand-theme";   // side-effect: calls templateRegistry.register()
```

---

## Start the editor with a specific document

Use `initialDocument` to pre-load either:
- A **saved email** retrieved from your backend (resume editing).
- The **tenant's starter template** (new email).

```tsx
<EmailBuilder
  key={`${tenantId}:${emailId}`}
  themes={[myBrandTheme, ...defaultThemes]}
  initialDocument={existingDoc ?? myStarterDef.build()}
/>
```

---

## Prevent cross-tenant draft bleed

The editor autosaves to a single `localStorage` key. If the user switches to a different tenant (or opens a new email) without clearing it, the old draft reappears.

**Pattern:** call `clearEmailBuilderDocument()` synchronously when context changes, then remount via `key`.

```tsx
import { clearEmailBuilderDocument } from "@one-million-lines/email-builder";
import { useRef, useState } from "react";

function Editor({ tenantId, emailId, ...props }) {
  const [resetKey, setResetKey] = useState(0);

  // Runs during render (synchronous) so localStorage is clear before mount.
  const prevRef = useRef(`${tenantId}:${emailId}`);
  const ctx = `${tenantId}:${emailId}`;
  if (prevRef.current !== ctx) {
    prevRef.current = ctx;
    clearEmailBuilderDocument();
  }

  return (
    <EmailBuilder
      key={`${ctx}:${resetKey}`}
      themes={...}
      initialDocument={...}
    />
  );
}
```

---

## "Reset & start fresh" button

Provide a host-level reset button when the user wants to discard their work and restart from the tenant's starter:

```tsx
const [resetKey, setResetKey] = useState(0);

function handleReset() {
  if (!window.confirm("Reset? Unsaved changes will be lost.")) return;
  clearEmailBuilderDocument(); // clears localStorage synchronously
  setResetKey(k => k + 1);    // remount → localStorage empty → initialDocument loads
}

<button onClick={handleReset}>Reset & start fresh</button>

<EmailBuilder
  key={`${tenantId}:${emailId}:${resetKey}`}
  themes={[myBrandTheme, ...defaultThemes]}
  initialDocument={myStarterDef.build()}
/>
```

---

## Reference: exported builder utilities

All of these are importable from `@one-million-lines/email-builder`:

### Theme / document utilities

| Export | Type | Description |
|---|---|---|
| `defaultThemes` | `Theme[]` | All five built-in theme presets |
| `minimalSaaS` | `Theme` | Blue SaaS preset |
| `ecommercePromo` | `Theme` | Orange ecommerce preset |
| `luxuryBlack` | `Theme` | Dark luxury preset |
| `greenEco` | `Theme` | Green eco preset |
| `newsletterEditorial` | `Theme` | Serif newsletter preset |
| `templateRegistry` | singleton | Register / list templates |
| `clearEmailBuilderDocument()` | function | Wipe localStorage draft |
| `uid(prefix?)` | function | Generate unique element / module IDs |

### Element helpers (for building templates)

| Export | Returns | Usage |
|---|---|---|
| `mod(type, name, children, style?)` | `EmailModule` | Create a section/row |
| `text(content, opts?)` | `EmailElement` | Generic text element |
| `heading(content, opts?)` | `EmailElement` | Bold heading text |
| `eyebrow(content, opts?)` | `EmailElement` | Small uppercase label |
| `muted(content, opts?)` | `EmailElement` | Gray secondary text |
| `image(src, alt, opts?)` | `EmailElement` | Image element |
| `button(label, link, opts?)` | `EmailElement` | CTA button |
| `spacer(height?)` | `EmailElement` | Vertical spacer |
| `divider(opts?)` | `EmailElement` | Horizontal rule |
| `product(partial)` | `Product` | Create a product entry |
| `productGrid(products, opts?)` | `EmailElement` | Product grid (1–3 columns) |
| `footerLinks(links, opts?)` | `EmailElement` | Footer link row with VT link types |
| `logoImage(src, opts?)` | `EmailElement` | Logo image (VT-marked) |
| `shopInfoText(placeholder, opts?)` | `EmailElement` | Shop address (VT-marked) |
| `shopDomainText(placeholder, opts?)` | `EmailElement` | Shop domain (VT-marked) |
| `PLACEHOLDER(w, h, label?)` | `string` | `placehold.co` URL for mock images |

> **VT-marked** elements carry a `vtMarker` attribute recognized by the Vibetrace backend, which replaces them with live shop data at send time.
