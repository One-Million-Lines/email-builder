# Gallery Module

A **gallery** is a named collection of extra, ready-to-drop modules ("styles" or
new elements) that sit **on top of** the built-in modules in the left sidebar.
Freshly loaded gallery elements always appear first in their category, so new
content is the first thing a user sees.

Galleries are:

- **Modular** — each gallery is a self-contained pack, registered independently.
- **Reactive** — register galleries at runtime (e.g. after a fetch) and the
  sidebar updates immediately, no reload.
- **Categorized** — every item declares a `ModuleCategory` (`header`, `content`,
  `menu`, `ecommerce`, …) and is merged into that category panel.

---

## Concepts

```ts
interface GalleryDefinition {
  id: string;                 // unique gallery id
  name: string;               // shown in the Gallery tab
  description?: string;
  items: ModuleDefinition[];  // the extra blocks (any category)
  badge?: string;             // badge on every item (default "New")
}
```

A `GalleryItem` is just a `ModuleDefinition` (identical to a built-in module)
tagged with the `galleryId` it came from. Because it *is* a module definition,
a gallery item drops into the canvas exactly like any built-in block.

---

## Usage

### Via the React component

```tsx
import { EmailBuilder, sampleGallery } from "@one-million-lines/email-builder";

<EmailBuilder galleries={[sampleGallery]} />
```

### Via a plugin

```ts
import { registerPlugin, galleryPlugin, sampleGallery } from "@one-million-lines/email-builder";

registerPlugin(galleryPlugin(sampleGallery /*, moreGalleries */));
```

### Directly on the registry (dynamic / runtime loading)

```ts
import { galleryRegistry } from "@one-million-lines/email-builder";

const remote = await fetch("/api/galleries").then((r) => r.json());
galleryRegistry.registerGallery(remote);   // sidebar updates live

// later:
galleryRegistry.removeGallery(remote.id);
```

---

## Authoring a gallery

Use the same element helpers the built-in modules use. Each item needs a unique
`type`, a `category`, an AI-friendly `description`, and a `create()` that returns
fresh module JSON.

```ts
import type { GalleryDefinition } from "@one-million-lines/email-builder";
// In-repo, import helpers from src/modules/helpers.
import { mod, heading, text, button } from "../modules/helpers";

export const promoGallery: GalleryDefinition = {
  id: "promo-gallery",
  name: "Promo Gallery",
  badge: "New",
  items: [
    {
      type: "promo.countdown_cta",
      category: "call_to_action",
      name: "Countdown CTA",
      description: "Urgency banner with a deadline line and a primary button.",
      tags: ["urgency", "countdown", "cta"],
      create: () =>
        mod("promo.countdown_cta", "Countdown CTA", [
          heading("Ends at midnight", { align: "center" }),
          text("Don't miss out — the offer disappears soon.", { align: "center" }),
          button("Shop the sale", "#", { align: "center" }),
        ]),
    },
  ],
};
```

> **Naming:** prefix gallery `type`s (e.g. `gallery.*`, `promo.*`) so they never
> collide with built-in module types. Duplicate types across galleries are shown
> once per gallery in the **Gallery** tab and de-duplicated in category panels
> (gallery items win over a same-typed built-in).

---

## Where items appear

- **Category panels** (Header, Content, …): gallery items for that category are
  listed first, badged, above the built-ins.
- **Gallery tab**: a dedicated rail tab (visible only when at least one gallery
  is registered) lists every item grouped by gallery.

---

## AI integration

Gallery items are included in the catalog sent to the AI backend (see
[`../ai/README.md`](../ai/README.md)), and are listed **first**, so the assistant
prefers freshly added styles when assembling emails.

---

## Files

| File               | Purpose                                             |
|--------------------|-----------------------------------------------------|
| `registry.ts`      | `galleryRegistry`, `GalleryDefinition`, reactivity. |
| `sampleGallery.ts` | An example gallery across several categories.        |
| `index.ts`         | Public exports + `galleryPlugin()`.                 |
