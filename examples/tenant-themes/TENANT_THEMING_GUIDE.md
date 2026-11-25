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

---

## 7. Theme token resolution in `htmlOverride` HTML

Since **v0.18.0**, `htmlOverride` HTML strings support the same `{group.key}` token
syntax used by standard module `style` objects. The `applyThemeTokens(html, theme)`
utility substitutes them at render time — both in the canvas preview and in the
exported HTML.

### Use token refs instead of hardcoded hex values

```html
<!-- ✓ Correct — responds to theme changes -->
<p style="color:{colors.primary};font-family:{fonts.body};">EYEBROW</p>
<h1 style="color:{colors.text};">Headline</h1>
<td bgcolor="{colors.buttonBackground}">...</td>

<!-- ✗ Avoid hardcoded hex for theme-driven colors -->
<p style="color:#3024F4;">EYEBROW</p>
```

### Which colors should use tokens vs hardcoded

| Use token ref | Keep hardcoded |
|---|---|
| Brand primary, text, muted, background, surface | Design-specific accent colors (lime, lavender, etc.) |
| Button backgrounds and text | Structural borders (`#DDE1EA`) |
| Font families | Specific spacing values |

### Theme token definitions must use actual values (never self-references)

```typescript
// ✓ Correct — theme tokens hold actual values
tokens: {
  colors: { background: "#FAFAF7", primary: "#3024F4", text: "#192235" },
  fonts:  { body: "Arial, Helvetica, sans-serif" }
}

// ✗ Wrong — circular reference, token won't resolve
tokens: {
  colors: { background: "{colors.background}" }  // ← NEVER DO THIS
}
```

---

## 8. Background color — per-block vs theme token

The module's **Background color** field in the right sidebar changes `style.backgroundColor`.
For standard modules, this applies directly. For `htmlOverride` blocks, there is a subtlety:

- If the HTML has `bgcolor="{colors.background}"` on its outer table, the per-block color
  picker will not visually override it because the HTML table's bgcolor covers the
  outer module container.
- **Solution**: Remove `bgcolor` from the outer table element. The module's
  `style.backgroundColor` (editable from the sidebar) then provides the background.
  Inner sections that need a specific design color keep their own `bgcolor`.

```html
<!-- ✓ Correct: outer table has no bgcolor — sidebar controls it -->
<table role="presentation" width="100%" style="width:100%;border-collapse:collapse;">
  <tr><td style="padding:32px 24px;">
    <!-- inner sections with specific design colors keep their bgcolor -->
    <td bgcolor="{colors.buttonBackground}" style="…">CTA</td>
  </td></tr>
</table>

<!-- ✗ Wrong: outer table bgcolor overrides the sidebar background color picker -->
<table ... bgcolor="{colors.background}" style="background-color:{colors.background};">
```

---

## 9. Generating static HTML previews

After building your tenant theme, generate a static `.html` file for each email
so you can preview it in a browser without running the builder. This is also how
AI agents can verify their work.

### Script pattern

```javascript
// generate-preview.mjs
import { renderEmailHtml } from '@one-million-lines/email-builder'
import { writeFileSync } from 'fs'

const myTheme = {
  id: "mybrand", name: "MyBrand",
  tokens: {
    colors: { background: "#FAFAF7", surface: "#FFFFFF", primary: "#3024F4",
               text: "#192235", muted: "#606C80", buttonBackground: "#3024F4", buttonText: "#FFFFFF" },
    fonts:  { body: "Arial, Helvetica, sans-serif", heading: "Arial, Helvetica, sans-serif",
               button: "Arial, Helvetica, sans-serif" },
    spacing: { xs:4, sm:8, md:16, lg:24, xl:40 },
    radius:  { sm:4, md:8, lg:12 },
  }
}

const doc = {
  version: "1.0",
  meta: { name: "MyBrand Preview", previewText: "Preview subject line" },
  theme: myTheme,
  settings: { width: 600, backgroundColor: "{colors.background}", contentBackgroundColor: "{colors.surface}" },
  modules: [
    // Add your block module instances here (see actordo-blocks.ts create() return values)
    {
      id: "hero", type: "mybrand.hero", name: "Hero",
      style: { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 },
      children: [],
      htmlOverride: "... your html with {colors.X} tokens ...",
      editableSlots: { headline: { type: "text", value: "My headline", label: "Headline" } }
    },
    // Always end with footer.legal for unsubscribe links
    {
      id: "legal", type: "footer.legal", name: "Footer",
      style: { backgroundColor: "{colors.surface}", paddingTop: 16, paddingBottom: 16 },
      children: [
        { id: "addr", type: "text", content: "Company · Address",
          style: { fontSize: 12, color: "{colors.muted}", align: "center", paddingTop: 8, paddingBottom: 8 } },
        { id: "unsub", type: "text", content: '<a class="vtunsubscribe" href="{{unsubscribe_url}}" style="color:inherit">Unsubscribe</a>',
          style: { fontSize: 11, color: "{colors.muted}", align: "center", paddingTop: 4, paddingBottom: 16 } },
      ]
    }
  ]
}

writeFileSync('mybrand-preview.html', renderEmailHtml(doc))
console.log('Preview written to mybrand-preview.html')
```

Run with: `node --input-type=module generate-preview.mjs`

### Rules for AI agents generating previews

1. The `theme.tokens` values must be **actual hex/string values**, never `{token.ref}`.
2. Use `{colors.X}` and `{fonts.X}` refs only inside `htmlOverride` HTML strings and
   `style` objects — not in the theme token definitions themselves.
3. Remove `bgcolor` from the outermost `<table>` of each `htmlOverride` block so the
   module's `style.backgroundColor` can be changed from the sidebar.
4. Keep `bgcolor` on inner elements with design-specific colors (buttons, accent strips).
5. Always end the email with a `footer.legal` module containing unsubscribe + address.
6. Verify the output HTML renders correctly in a browser before committing.

