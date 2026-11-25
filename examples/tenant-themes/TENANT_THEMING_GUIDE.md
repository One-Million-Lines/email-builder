# Tenant Theming Guide

How to create a custom email theme that is both **visually faithful** to a brand's design **and fully editable** inside the email builder, so marketing users can change text, images and links without touching any HTML.

---

## Overview: two complementary systems

| System | Purpose |
|---|---|
| **Theme** (`registerTheme`) | Brand colours, fonts, spacing, radii — applied globally to all standard modules |
| **Custom blocks** (`registerModule`) | Brand-specific HTML layouts that exist nowhere else; they carry `htmlOverride` for design fidelity and `editableSlots` for content editing |

---

## 1. The `editableSlots` contract

Custom blocks keep their exact HTML design via `htmlOverride`. Editable content is **stored separately** in `editableSlots` and **substituted at render time** by the engine — the HTML template is never mutated.

### HTML side: mark editable nodes with `data-slot`

```html
<!-- text slot: replace element's plain text content -->
<p data-slot="eyebrow" style="…">Default eyebrow</p>

<!-- html slot: replace innerHTML (preserves inline markup like <span>) -->
<h1 data-slot="headline" style="…">Default <span style="color:#blue">headline</span></h1>

<!-- image slot: replace src and alt on an <img> element -->
<img data-slot="hero_image" src="default.jpg" alt="Default alt">

<!-- href slot: replace the href attribute on any element -->
<a data-slot="cta_link" href="https://default.example.com">…</a>
```

### Module side: declare slots in `create()`

```ts
create: () => ({
  id: uid("module"),
  type: "mybrand.hero",
  name: "Hero section",
  style: { backgroundColor: "#FAFAF7", paddingTop: 0, paddingBottom: 0 },
  children: [],
  htmlOverride: HERO_HTML,          // ← the full HTML template
  editableSlots: {
    eyebrow:   { type: "text",  value: "DEFAULT EYEBROW",        label: "Eyebrow label" },
    headline:  { type: "html",  value: "Default <span>headline</span>", label: "Headline (HTML)" },
    hero_image:{ type: "image", value: "https://…/default.jpg", alt: "Alt text", label: "Hero image" },
    cta_label: { type: "text",  value: "Learn more →",          label: "CTA button label" },
    cta_link:  { type: "href",  value: "https://…/page",        label: "CTA link URL" },
  },
})
```

### Slot types

| Type | Targets | Behaviour |
|---|---|---|
| `"text"` | Any element | Replaces `textContent` (safe, strips markup) |
| `"html"` | Any element | Replaces `innerHTML` (preserves `<span>`, `<br>` etc.) |
| `"image"` | `<img>` | Updates `src`; `alt` is stored alongside `value` and also updated |
| `"href"` | Any element | Updates the `href` attribute |

### What the user sees

When a custom block is selected in the canvas:
- The **right sidebar** shows a "Content" panel listing every slot
- Each slot has an appropriate input (text input, textarea for `html`, image upload + URL for `image`, URL input for `href`)
- Changes are reflected **live in the canvas preview** and in the **exported HTML**

---

## 2. Deciding which elements to annotate

Annotate **content**, not **layout**:

| ✅ Annotate | ❌ Don't annotate |
|---|---|
| Eyebrow / section label text | Table cell padding values |
| Headline and body copy | Inline border colours |
| CTA button label and link | Multi-column structural scaffolding |
| Hero or feature images | Structural spacer divs |
| Contact info (phone, email) | Navigation link labels (edit HTML) |
| Article title and excerpt | — |

---

## 3. When to use `htmlOverride` vs standard children

| Use `htmlOverride + editableSlots` | Use standard `children` |
|---|---|
| Multi-column table layouts (nav bars, 2-col feature grids) | Single-column text + image + button sequences |
| Complex structural elements where every pixel matters | Reusable generic content blocks |
| Brand-specific decorative elements (badges, strips, tabs) | Blocks that need full rich-text editing per element |
| Blocks designed by a visual designer in an email client | AI-generated or programmatic content |

---

## 4. AI agent instructions for creating custom themes

When an AI agent is asked to create a custom email theme:

### Step 1 — Theme tokens

Create a `{brand}-theme.ts` file with:
```ts
export const mybrandTheme = {
  id: "mybrand",
  name: "MyBrand",
  tokens: {
    colors: {
      background: "#…",
      surface: "#…",
      primary: "#…",
      text: "#…",
      muted: "#…",
      buttonBackground: "#…",
      buttonText: "#…",
    },
    fonts: {
      heading: "Arial, Helvetica, sans-serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 4, md: 8, lg: 12 },
  },
};
```

### Step 2 — Custom blocks

Create a `{brand}-blocks.ts` file. For each block:
1. Write the HTML template as a template literal.
2. Add `data-slot="key"` to every editable node.
3. Create a `ModuleDefinition` with `htmlOverride` + `editableSlots`.

```ts
const MY_HERO_HTML = `
<table …>
  <tr><td style="padding:32px 24px;">
    <p data-slot="eyebrow" style="font-size:11px;font-weight:bold;color:#primary;">EYEBROW TEXT</p>
    <h1 data-slot="headline" style="font-size:34px;">Default Headline</h1>
    <p data-slot="body" style="font-size:16px;">Default body copy.</p>
    <a data-slot="cta_link" href="#" style="…"><span data-slot="cta_label">CTA</span></a>
  </td></tr>
</table>`;

export const myBrandHero: ModuleDefinition = {
  type: "mybrand.hero",
  name: "Hero",
  category: "custom",
  description: "Full-width hero with eyebrow, headline, body and CTA. All text and links editable.",
  tags: ["mybrand", "hero"],
  create: () => ({
    id: uid("module"),
    type: "mybrand.hero",
    name: "Hero",
    style: { backgroundColor: "#FAFAF7", paddingTop: 0, paddingBottom: 0 },
    children: [],
    htmlOverride: MY_HERO_HTML,
    editableSlots: {
      eyebrow:   { type: "text",  value: "EYEBROW TEXT",   label: "Eyebrow label" },
      headline:  { type: "text",  value: "Default Headline", label: "Headline" },
      body:      { type: "text",  value: "Default body copy.", label: "Body text" },
      cta_label: { type: "text",  value: "CTA",            label: "CTA button label" },
      cta_link:  { type: "href",  value: "https://…",      label: "CTA link URL" },
    },
  }),
};
```

### Step 3 — Register

Pass the blocks to the host application or the gallery:
```ts
<EmailBuilder
  modules={[...defaultModules, ...myBrandHero, ...myBrandBlocks]}
  themes={[mybrandTheme, ...defaultThemes]}
/>
// Or via gallery.py params.custom_modules (see gallery.py documentation)
```

---

## 5. `data-slot` naming conventions

- Use `snake_case` keys: `hero_image`, `cta_link`, `body_text`
- Keep keys descriptive and stable — changing a key means existing saved documents lose the slot value
- For multi-instance slots in the same module, suffix with a number: `feature_title_1`, `feature_title_2`
- Prefix with the section name to avoid collisions: `studio_eyebrow`, `tasks_headline`

---

## 6. Existing tenant-theme examples

| File | Blocks | Key editable slots |
|---|---|---|
| `actordo-blocks.ts` | 7 blocks | Eyebrow, headline, body, CTA text + link, demo quotes |
| `campmor-blocks.ts` | 7 blocks | Hero image, eyebrow, headline, body, editorial excerpt, contact info |
| `feroshop-blocks.ts` | 3 blocks | Complex layouts — intentionally static |
| `hamangiu-blocks.ts` | 3+ blocks | Complex layouts — intentionally static |
