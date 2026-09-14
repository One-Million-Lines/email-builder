# Email Template Structure — Complete Authoring Guide

This email builder stores templates as structured TypeScript factories that return an `EmailDocument` JSON object. The renderer turns that JSON into table-based HTML suitable for email clients, while also injecting special VT markers that the Python backend can recognize and transform at send time.

## 1. Quick Start — How templates are built

Templates use a factory pattern:

- each file exports a `TemplateDefinition`
- the `build()` function returns a fresh `EmailDocument`
- helper functions generate unique ids automatically via `uid()`
- importing the template file self-registers it in `templateRegistry`

Minimal pattern:

```ts
import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { mod, heading, text, footerLinks, shopInfoText } from "../modules/helpers";
import { minimalSaaS } from "../themes/defaultThemes";

export const example: TemplateDefinition = {
  id: "example-template",
  name: "Example Template",
  category: "newsletter",
  description: "Small example template.",
  tags: ["example"],
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Example Template",
      previewText: "Short inbox preview.",
    },
    theme: minimalSaaS,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.text", "Hero", [heading("Hello"), text("Welcome to the template.")]),
      mod("footer.simple", "Footer", [
        shopInfoText(),
        footerLinks([{ label: "Unsubscribe", type: "unsubscribe" }]),
      ]),
    ],
  }),
};

templateRegistry.register(example);
export default example;
```

Self-registration matters: after creating a template file, add an import in `src/templates/index.ts` so it becomes available.

## 2. The EmailDocument JSON Model

Core shape from `src/core/types.ts`:

```ts
export interface BaseStyle {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  backgroundColor?: string;
  align?: "left" | "center" | "right";
  borderRadius?: number;
  border?: string;
  hideOn?: "mobile" | "desktop";
  mobile?: Record<string, unknown>;
}

export type SpecialLinkType =
  | "unsubscribe"
  | "view_in_browser"
  | "manage_preferences"
  | "user_profile"
  | "shop_url"
  | "policy_page"
  | "terms_page";

export interface TextElement {
  id: string;
  type: "text";
  role?: "headline" | "subheadline" | "body" | "caption" | "voucherCode";
  content: string;
  vtMarker?: string;
  style?: BaseStyle & {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    fontWeight?: number | string;
    color?: string;
    link?: string;
    linkType?: SpecialLinkType;
  };
}

export interface ImageElement {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  link?: string;
  linkType?: SpecialLinkType;
  vtMarker?: string;
  style?: BaseStyle & { width?: number; height?: number };
}

export interface ButtonElement {
  id: string;
  type: "button";
  label: string;
  link: string;
  linkType?: SpecialLinkType;
  style?: BaseStyle & {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
  };
}

export interface SpacerElement {
  id: string;
  type: "spacer";
  height: number;
}

export interface DividerElement {
  id: string;
  type: "divider";
  style?: { color?: string; thickness?: number; paddingTop?: number; paddingBottom?: number };
}

export interface Product {
  id: string;
  image: string;
  imageAlt?: string;
  name: string;
  oldPrice?: string;
  finalPrice: string;
  description?: string;
  link?: string;
  buttonLabel?: string;
  stars?: number;
}

export interface ProductGridElement {
  id: string;
  type: "productGrid";
  products: Product[];
  columns: 1 | 2 | 3;
  showOldPrice: boolean;
  showButton: boolean;
  showDescription: boolean;
  showStars?: boolean;
  buttonLabel?: string;
  style?: BaseStyle & {
    nameColor?: string;
    finalPriceColor?: string;
    oldPriceColor?: string;
    buttonBackgroundColor?: string;
    buttonColor?: string;
    gap?: number;
    cardBackgroundColor?: string;
    borderRadius?: number;
    align?: "left" | "center" | "right";
  };
}

export type EmailElement =
  | TextElement
  | ImageElement
  | ButtonElement
  | SpacerElement
  | DividerElement
  | ProductGridElement;

export interface EmailModule {
  id: string;
  type: string;
  name: string;
  style?: BaseStyle;
  children: EmailElement[];
  data?: Record<string, unknown>;
}

export interface ThemeTokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
}

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeTokens;
}

export interface EmailSettings {
  width: number;
  backgroundColor: string;
  contentBackgroundColor: string;
}

export interface EmailMeta {
  name: string;
  previewText: string;
}

export interface EmailDocument {
  version: string;
  meta: EmailMeta;
  theme: Theme;
  settings: EmailSettings;
  modules: EmailModule[];
}
```

Field guide:

- `version` — current schema version string.
- `meta.name` — internal template/document name.
- `meta.previewText` — inbox preheader text; the renderer also outputs `id="vt-preheader"` for backend replacement.
- `theme` — token source for colors, fonts, spacing, and radii.
- `settings.width` — desktop content width, usually `600`.
- `settings.backgroundColor` — outer email page background.
- `settings.contentBackgroundColor` — inner content column background.
- `modules` — ordered sections from top to bottom.
- `module.type` — semantic identifier such as `header.logo`, `hero.flash`, or `footer.legal`.
- `module.data` — plugin metadata such as recommendations config.
- `TextElement.vtMarker` / `ImageElement.vtMarker` — VT backend class markers like `vtw-logo` or `vtw-info`.

## 3. Themes and Design Tokens

Theme tokens are referenced with brace syntax:

```ts
{ color: "{colors.primary}", fontFamily: "{fonts.heading}" }
```

Standard tokens used throughout the builder:

| Token | Purpose |
|---|---|
| `{colors.background}` | Outer/background surfaces |
| `{colors.surface}` | Inner card/content surface |
| `{colors.primary}` | Brand accent, CTA, links |
| `{colors.text}` | Main text color |
| `{colors.muted}` | Secondary/footer text |
| `{colors.buttonBackground}` | Primary button fill |
| `{colors.buttonText}` | Primary button label |
| `{fonts.heading}` | Headings/display typography |
| `{fonts.body}` | Paragraph/body typography |
| `{fonts.button}` | Button typography |
| `{radius.sm}` / `{radius.md}` / `{radius.lg}` | Optional radius scale |
| `{spacing.xs}` / `{spacing.sm}` / `{spacing.md}` / `{spacing.lg}` / `{spacing.xl}` | Optional spacing scale |

Theme shape:

```ts
const theme: Theme = {
  id: "custom-theme",
  name: "Custom Theme",
  tokens: {
    colors: {
      background: "#F3F4F6",
      surface: "#FFFFFF",
      primary: "#2563EB",
      text: "#111827",
      muted: "#6B7280",
      buttonBackground: "#2563EB",
      buttonText: "#FFFFFF",
    },
    fonts: {
      heading: "Georgia, serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 4, md: 8, lg: 16 },
  },
};
```

Default built-in themes currently include:

- `minimalSaaS`
- `ecommercePromo`
- `luxuryBlack`
- `greenEco`
- `newsletterEditorial`

Rule of thumb: never hardcode a color in styles when an equivalent theme token exists.

## 4. Module Types (Sections)

Module `type` is free-form, but the project follows predictable prefixes.

### Header modules

| Type | Description |
|---|---|
| `header.logo` | Centered logo image |
| `header.logo_left_date_right` | Logo plus issue/date line |
| `header.publication` | Editorial masthead |
| `header.hero` | Headline + subtitle + image |
| `header.hero_text_only` | Text-only hero intro |
| `header.announcement` | Thin promo bar |
| `header.logo_with_view_browser` | Browser-preview link + logo |
| `header.welcome` | Welcome greeting header |
| `header.logo_with_tagline` | Logo and supporting tagline |
| `header.story_label` | Category label + headline |

### Hero naming conventions

There is no dedicated `src/modules/hero.ts`; templates commonly create custom hero module types directly. Recommended patterns include:

| Type | Meaning |
|---|---|
| `hero.text` | Text-focused hero |
| `hero.image` | Image-led hero |
| `hero.split` | Two-column/split hero |
| `hero.flash` | Flash-sale hero |
| `hero.welcome` | Onboarding hero |
| `hero.confirmation` | Transactional confirmation hero |

### Content modules

| Type | Description |
|---|---|
| `content.headline_body` | Headline plus paragraph |
| `content.lead_story` | Eyebrow, image, summary, link |
| `content.article_summary` | Compact article card |
| `content.image_text` | Image followed by text |
| `content.two_column_articles` | Two-story teaser block |
| `content.three_picks` | Numbered recommendations |
| `content.quote` | Pull quote |
| `content.author_byline` | Avatar/name/role |
| `content.editor_note` | Personal note block |
| `content.tip_box` | Highlighted tip/callout |
| `content.numbered_list` | Step list |
| `content.bullet_list` | Bullet summary |
| `content.qa` | Question/answer block |
| `content.stats_row` | Metrics row |
| `content.timeline` | Timeline/changelog block |
| `content.podcast_episode` | Podcast episode card |
| `content.video_thumbnail` | Video preview block |
| `content.event_card` | Event teaser |
| `content.code_block` | Monospaced code snippet |

### Ecommerce modules

| Type | Description |
|---|---|
| `ecom.product_single` | Single product card |
| `ecom.product_grid_2` | Two-up product grid |
| `ecom.product_grid_3` | Three-up product grid |
| `ecom.collection_banner` | Collection hero/banner |
| `ecom.discount` | Discount code block |
| `ecom.voucher` | Personalized voucher block |
| `ecom.flash_sale` | Urgency sale banner |
| `ecom.abandoned_cart` | Cart reminder |
| `ecom.review_request` | Rating request |
| `ecom.gift_guide` | Editorial product feature |
| `ecom.bestseller_list` | Bestseller grid |

### CTA modules

| Type | Description |
|---|---|
| `cta.simple` | Headline + body + button |
| `cta.banner` | Colored CTA band |
| `cta.button_only` | Standalone button |
| `cta.dual_button` | Primary + secondary actions |
| `cta.image_overlay` | Image-led CTA |
| `cta.subscribe` | Subscribe/forward block |
| `cta.referral` | Referral CTA |
| `cta.upgrade` | Paid plan upgrade block |
| `cta.feedback` | Reply-for-feedback prompt |

### Footer modules

| Type | Description |
|---|---|
| `footer.simple` | Minimal legal footer |
| `footer.social` | Social links + legal |
| `footer.legal` | Long-form compliance footer |
| `footer.publisher` | Magazine/publisher sign-off |
| `footer.app_links` | App badge footer |
| `footer.address_only` | Postal address + unsubscribe |
| `footer.preferences` | Preference-management footer |
| `footer.signature` | Personal sign-off footer |

### Social modules

| Type | Description |
|---|---|
| `social.icons` | Social links row |
| `social.share` | Share bar |
| `social.featured_post` | Embedded-style social post |
| `social.instagram_grid` | Social thumbnail gallery |
| `social.community_stats` | Follower-count summary |

### Menu modules

| Type | Description |
|---|---|
| `menu.horizontal` | Horizontal nav |
| `menu.sections` | Section tabs |
| `menu.in_this_issue` | Table of contents |
| `menu.cta_strip` | Inline actions strip |

### Feature modules

| Type | Description |
|---|---|
| `feature.list` | Benefit/checkmark list |
| `feature.icon_three` | Three icon-led features |
| `feature.before_after` | Before/after comparison |
| `feature.benefit_pair` | Image plus benefit text |
| `feature.testimonial` | Testimonial block |
| `feature.logo_strip` | Customer logo strip |
| `feature.gradient_hero` | Big feature hero CTA |
| `feature.pull_quote` | Highlight quote |
| `feature.stat_row` | Metric row |
| `feature.single_product_spotlight` | Product spotlight |
| `feature.pill_nav` | Compact link/navigation block |

## 5. Element Types (Blocks)

### Text

```ts
interface TextElement {
  id: string;
  type: "text";
  role?: "headline" | "subheadline" | "body" | "caption" | "voucherCode";
  content: string;
  vtMarker?: string;
  style?: BaseStyle & {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    fontWeight?: number | string;
    color?: string;
    link?: string;
    linkType?: SpecialLinkType;
  };
}
```

Example:

```ts
text("View in browser", {
  align: "right",
  color: "{colors.muted}",
  link: SPECIAL_LINK_PLACEHOLDERS.view_in_browser,
  linkType: "view_in_browser",
});
```

Notes:

- text can include limited inline HTML
- the renderer wraps linked text in `<a>`
- `role: "voucherCode"` also adds the `vtw-voucher` class in rendered HTML
- mobile overrides are applied automatically through generated CSS classes

### Image

```ts
interface ImageElement {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  link?: string;
  linkType?: SpecialLinkType;
  vtMarker?: string;
  style?: BaseStyle & { width?: number; height?: number };
}
```

Example:

```ts
image(PLACEHOLDER(560, 280, "Hero"), "Hero", { width: 560, borderRadius: 16 });
logoImage(PLACEHOLDER(180, 56, "LOGO"), { width: 180 });
```

Notes:

- images wider than 343 px automatically receive mobile width rules
- `vtMarker` on images becomes a class on the `<img>` itself

### Button

```ts
interface ButtonElement {
  id: string;
  type: "button";
  label: string;
  link: string;
  linkType?: SpecialLinkType;
  style?: BaseStyle & {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number | string;
  };
}
```

Example:

```ts
button("Shop now", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
  linkType: "shop_url",
  borderRadius: 24,
});
```

Notes:

- buttons render both VML and normal HTML for Outlook compatibility
- `linkType` adds the VT class to the rendered `<a>` element

### Spacer

```ts
interface SpacerElement {
  id: string;
  type: "spacer";
  height: number;
}
```

Example:

```ts
spacer(24);
```

Notes:

- spacers are purely vertical rhythm helpers
- on mobile they remain fixed-height divs

### Divider

```ts
interface DividerElement {
  id: string;
  type: "divider";
  style?: { color?: string; thickness?: number; paddingTop?: number; paddingBottom?: number };
}
```

Example:

```ts
divider({ color: "#E5E7EB", paddingTop: 8, paddingBottom: 8 });
```

Notes:

- use to separate sections without creating extra modules

### ProductGrid

```ts
interface ProductGridElement {
  id: string;
  type: "productGrid";
  products: Product[];
  columns: 1 | 2 | 3;
  showOldPrice: boolean;
  showButton: boolean;
  showDescription: boolean;
  showStars?: boolean;
  buttonLabel?: string;
  style?: BaseStyle & {
    nameColor?: string;
    finalPriceColor?: string;
    oldPriceColor?: string;
    buttonBackgroundColor?: string;
    buttonColor?: string;
    gap?: number;
    cardBackgroundColor?: string;
    borderRadius?: number;
    align?: "left" | "center" | "right";
  };
}
```

Example:

```ts
productGrid(
  [
    product({ name: "Bag", oldPrice: "$59", finalPrice: "$39" }),
    product({ name: "Mug", finalPrice: "$24" }),
  ],
  { columns: 2, showOldPrice: true, showDescription: false }
);
```

Notes:

- desktop uses 1–3 columns; mobile stacks cards vertically
- renderer auto-injects VT product/item classes for backend processing

## 6. Helper Functions Reference

| Helper | Purpose | Example |
|---|---|---|
| `text()` | Generic text block | `text("Hello")` |
| `heading()` | Large heading preset | `heading("Big idea")` |
| `muted()` | Secondary text preset | `muted("Small print")` |
| `eyebrow()` | Small uppercase label | `eyebrow("New")` |
| `image()` | Generic image block | `image(PLACEHOLDER(560, 280), "Hero")` |
| `logoImage()` | Image marked with `vtw-logo` | `logoImage(PLACEHOLDER(180, 56, "LOGO"), { width: 180 })` |
| `button()` | CTA button | `button("Buy now", "#")` |
| `spacer()` | Vertical spacing | `spacer(16)` |
| `divider()` | Horizontal rule | `divider()` |
| `mod()` | Creates an `EmailModule` | `mod("hero.text", "Hero", [...])` |
| `product()` | Creates one `Product` object | `product({ name: "Bag", finalPrice: "$39" })` |
| `productGrid()` | Creates a product grid element | `productGrid(products, { columns: 3 })` |
| `voucherCode()` | Large voucher block text | `voucherCode("SAVE20")` |
| `footerLinks()` | Inline legal/system links with placeholders and VT classes | `footerLinks([{ label: "Unsubscribe", type: "unsubscribe" }])` |
| `shopInfoText()` | Text marked with `vtw-info` | `shopInfoText()` |
| `shopDomainText()` | Text marked with `vtw-domain` | `shopDomainText()` |
| `PLACEHOLDER()` | Generates placeholder image URL | `PLACEHOLDER(560, 320, "Hero")` |

## 7. VT Backend Markers — Integration Guide

The Python HTMLTemplater reads the rendered HTML, not the editor JSON. That means correct classes, attributes, and placeholders in the HTML output are critical.

### 7.1 Product Item Markers (`item-*` classes)

The renderer now adds these automatically inside product grids:

| Marker | Applied to | Backend behavior |
|---|---|---|
| `item-image` | Product `<img>` | Maps image field from current product |
| `item-title` | Product title `<td>` | Replaces text with product title |
| `item-desc` | Description `<div>` | Replaces text with product description |
| `item-url` | Product image/button `<a>` | Replaces `href` with current product URL |
| `item-final_price` | Final price `<span>` | Replaces text with final price |
| `item-old_price` | Old price `<span>` | Replaces text with old price |

Related generic item markers supported by the backend:

| Marker | Effect |
|---|---|
| `item-title` | Product title text |
| `item-desc`, `item-description` | Product description text |
| `item-discount` | Discount integer |
| `item-price`, `item-discountPrice`, `item-final_price`, `item-old_price` | Product prices |
| `item-url` on `<a>` | Product URL and `target="_blank"` |
| `item-{field}` on `<img>` | `src` becomes that field |
| other `item-{field}` | Replaces contents with that field |

Example rendered HTML fragment:

```html
<div vtproduct>
  <table role="presentation">
    <tr>
      <td class="stack" reccs-item>
        <img class="item-image" src="..." alt="..." />
        <td class="item-title">Product name</td>
        <span class="item-old_price old_price">$59</span>
        <span class="item-final_price final_price">$39</span>
        <div class="item-desc">Product description</div>
        <a class="item-url" href="#">Shop now</a>
      </td>
    </tr>
  </table>
</div>
```

### 7.2 Link VT Classes

| `linkType` | VT class | Backend behavior |
|---|---|---|
| `unsubscribe` | `vtunsubscribe` | Replaces `href` with unsubscribe URL |
| `view_in_browser` | `vtpreview` | Replaces `href` with browser-preview URL |
| `manage_preferences` | `vtsubconfirm` | Replaces `href` with subscription-confirmation URL |
| `user_profile` | `vtprofile` | Replaces `href` with profile-management URL |
| `shop_url` | `vtw-url` | Replaces `href` with shop URL |
| `policy_page` | `vtw-policy_page` | Replaces `href` with policy-page URL |
| `terms_page` | `vtw-terms_page` | Replaces `href` with terms-page URL |

The renderer also keeps `data-link-type="..."` on the same anchor for easier downstream parsing.

### 7.3 Content Replacement Markers

| Marker | Applied to | Effect |
|---|---|---|
| `vtw-logo` | `<img>` | Backend replaces `src` with configured shop logo |
| `vtw-info` | text wrapper element | Backend replaces contents with shop address/info |
| `vtw-domain` | text wrapper element | Backend replaces contents with shop domain |
| `vtw-voucher` | voucher wrapper element | Backend replaces contents with generated voucher code |

Use helper functions whenever possible:

- `logoImage()` → `vtw-logo`
- `shopInfoText()` → `vtw-info`
- `shopDomainText()` → `vtw-domain`
- `voucherCode()` or `role: "voucherCode"` → `vtw-voucher`

### 7.4 Structural Markers

| Marker | Meaning |
|---|---|
| `id="vt-preheader"` | Hidden preheader element inserted by the renderer |
| `vtproduct` | Marks a product-grid container for backend loop processing |
| `reccs-item` | Marks individual recommendation/product slots |
| `vtw-preheader` | Visual preheader row that backend deletes |
| `vtw-powered` | Powered-by element backend deletes |
| `vt-remove` | Delete the entire element |
| `vt-ignore` | Skip automatic `item-*` replacement on that element |

### 7.5 Loop Display Classes

| Class | Effect |
|---|---|
| `vt-loop-display-odd` | Only show on odd loop iterations |
| `vt-loop-display-even` | Only show on even loop iterations |
| `vt-loop-display-first` | Only show on first iteration |
| `vt-loop-display-last` | Only show on last iteration |

### 7.6 Currency Classes

| Class | Effect |
|---|---|
| `currency_before` | Replaces contents with currency prefix |
| `currency_after` | Replaces contents with currency suffix |

## 8. SpecialLinkType Reference

| SpecialLinkType | Placeholder href | VT class | Backend behavior |
|---|---|---|---|
| `unsubscribe` | `{{unsubscribe_url}}` | `vtunsubscribe` | Unsubscribe URL replacement |
| `view_in_browser` | `{{view_in_browser_url}}` | `vtpreview` | Browser-preview URL replacement |
| `manage_preferences` | `{{manage_preferences_url}}` | `vtsubconfirm` | Subscription-confirmation/preferences URL replacement |
| `user_profile` | `{{user_profile_url}}` | `vtprofile` | Profile-management URL replacement |
| `shop_url` | `{{shop_url}}` | `vtw-url` | Shop home URL replacement |
| `policy_page` | `{{policy_page_url}}` | `vtw-policy_page` | Policy-page URL replacement |
| `terms_page` | `{{terms_page_url}}` | `vtw-terms_page` | Terms-page URL replacement |

## 9. Creating a New Template — Step by Step

1. Choose a theme from `../themes/defaultThemes` or define an inline `Theme`.
2. Create `src/templates/<name>.ts`.
3. Define metadata: `id`, `name`, `category`, `description`, `tags`, `thumbnail`.
4. Build the `modules` array with `mod()` and element helpers.
5. Export the definition and self-register with `templateRegistry.register(def)`.
6. Add `import "./<name>";` to `src/templates/index.ts`.
7. Checklist:
   - all ids come from helpers / `uid()`
   - theme styles use token syntax
   - footer includes at least `footerLinks([{ label: "Unsubscribe", type: "unsubscribe" }])`
   - logos/addresses/domains/vouchers use the correct VT helpers or markers
   - product grids use `productGrid()` so item classes are auto-rendered

## 10. Template Categories

From `src/templates/registry.ts`:

| Category | Label | Typical use case |
|---|---|---|
| `newsletter` | Newsletter | Editorial digests, recurring sends |
| `ecommerce` | Ecommerce | Sales, product promos, seasonal campaigns |
| `abandoned_cart` | Abandoned Cart | Recovery flows |
| `product_launch` | Product Launch | Announcements and launches |
| `onboarding` | Onboarding | Welcome and activation |
| `event` | Event | Invitations and event reminders |
| `transactional` | Transactional | Receipts, confirmations, password resets |
| `publishing` | Publishing | Magazine/publisher-style emails |

## 11. Complete Template Example

```ts
import type { EmailDocument } from "../core/types";
import { SPECIAL_LINK_PLACEHOLDERS } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { greenEco } from "../themes/defaultThemes";
import {
  mod,
  heading,
  muted,
  logoImage,
  button,
  shopInfoText,
  footerLinks,
} from "../modules/helpers";

export const completeExample: TemplateDefinition = {
  id: "complete-example",
  name: "Complete Example",
  category: "ecommerce",
  description: "Annotated example.",
  tags: ["example"],
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Complete Example",
      previewText: "Short preview line.",
    },
    theme: greenEco,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Logo", [
        logoImage("https://placehold.co/180x56?text=LOGO", { width: 180 }),
      ]),
      mod("hero.sale", "Sale hero", [
        heading("Weekend sale", { align: "center" }),
        muted("Fresh picks for the season.", { align: "center" }),
        button("Shop now", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
          linkType: "shop_url",
        }),
      ]),
      mod("footer.simple", "Footer", [
        shopInfoText(),
        footerLinks([
          { label: "Privacy Policy", type: "policy_page" },
          { label: "Unsubscribe", type: "unsubscribe" },
        ]),
      ]),
    ],
  }),
};

templateRegistry.register(completeExample);
```

Best practices shown above:

- theme tokens instead of hardcoded style colors
- `logoImage()` instead of plain `image()` for replaceable logos
- special links wired through `SPECIAL_LINK_PLACEHOLDERS`
- footer includes compliant VT-aware links

## 12. Creating New Modules

To add a reusable module definition:

1. open the correct file in `src/modules/` such as `header.ts`, `content.ts`, or `footer.ts`
2. append a new `ModuleDefinition` object to that category array
3. give it a unique `type`, `name`, `description`, and optional `tags`
4. implement `create()` with `mod()` plus child helpers
5. ensure the module renders correctly via `buildCatalog()` and `renderEmailHtml()`

Example skeleton:

```ts
{
  type: "content.custom_block",
  category: "content",
  name: "Custom Block",
  description: "Reusable custom section.",
  tags: ["custom"],
  create: () =>
    mod("content.custom_block", "Custom Block", [
      heading("Custom heading"),
      muted("Supporting copy."),
    ]),
}
```

Because `src/modules/defaultModules.ts` aggregates each module pack, anything added to an existing pack becomes available automatically once that file is imported.

## 13. Checklist Before Committing

- template file exports and self-registers correctly
- new template is imported from `src/templates/index.ts`
- styles use theme tokens wherever possible
- footer contains at least one unsubscribe `footerLinks()` entry
- logos use `logoImage()` when the backend should replace them
- address/info text uses `shopInfoText()` when backend-managed
- domain text uses `shopDomainText()` when backend-managed
- voucher blocks use `voucherCode()` or `role: "voucherCode"`
- product sections use `productGrid()` so `vtproduct` and `item-*` markers are rendered
- special links use `SPECIAL_LINK_PLACEHOLDERS` and, when applicable, `linkType`
- `npm run build` completes successfully
- rendered HTML contains expected preheader/link/VT markers
