// JSON-first document model for OpenEmailBuilder AI Builder.
// All emails are stored as structured JSON; HTML is generated from JSON.

export type ElementType = "text" | "image" | "button" | "spacer" | "divider" | "productGrid";

/**
 * Marks a link as a well-known system link. Backend processors replace the
 * placeholder href (e.g. `{{unsubscribe_url}}`) with a real per-recipient URL.
 * The rendered HTML also carries a `data-link-type` attribute so backends that
 * parse HTML can find and replace these links without inspecting the JSON.
 */
export type SpecialLinkType =
  | "unsubscribe"
  | "view_in_browser"
  | "manage_preferences"
  | "user_profile"
  | "shop_url"
  | "policy_page"
  | "terms_page";

/** Placeholder href values automatically set when a SpecialLinkType is chosen. */
export const SPECIAL_LINK_PLACEHOLDERS: Record<SpecialLinkType, string> = {
  unsubscribe: "{{unsubscribe_url}}",
  view_in_browser: "{{view_in_browser_url}}",
  manage_preferences: "{{manage_preferences_url}}",
  user_profile: "{{user_profile_url}}",
  shop_url: "{{shop_url}}",
  policy_page: "{{policy_page_url}}",
  terms_page: "{{terms_page_url}}",
};

/**
 * A merge tag / personalisation token. Configured via the `mergeTags` prop on
 * `<EmailBuilder>` or via `builder.registerMergeTags(tags)`.
 * When the user picks a tag, `{attribute}` is inserted into the text content.
 */
export interface MergeTag {
  /** Dot-notation path used as the placeholder, e.g. `"user.firstname"`. */
  attribute: string;
  /** Human-readable label shown in the sidebar dropdown, e.g. `"First name"`. */
  title: string;
}

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
  /**
   * Per-breakpoint overrides applied via @media (max-width:600px).
   * Any field accepted by the owning element's style can be placed here.
   */
  mobile?: Record<string, unknown>;
}

export interface TextElement {
  id: string;
  type: "text";
  role?: "headline" | "subheadline" | "body" | "caption" | "voucherCode";
  content: string; // may contain limited HTML (b, i, a)
  /** Optional VT backend marker class applied by the renderer. */
  vtMarker?: string;
  style?: BaseStyle & {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    fontWeight?: number | string;
    color?: string;
    link?: string;
    /** Marks the element link as a well-known system link (e.g. unsubscribe). */
    linkType?: SpecialLinkType;
  };
}

export interface ImageElement {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  link?: string;
  /** Marks the image link as a well-known system link. */
  linkType?: SpecialLinkType;
  /** Optional VT backend marker class applied by the renderer. */
  vtMarker?: string;
  style?: BaseStyle & { width?: number; height?: number };
}

export interface ButtonElement {
  id: string;
  type: "button";
  label: string;
  link: string;
  /** Marks the button link as a well-known system link. */
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
  /** Optional 0–5 rating. Rendered as star glyphs when the grid shows stars. */
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
  /** Show the star rating on each product card. Optional for back-compat. */
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
    /** Fixed height in px for the product image area. Images are cropped with object-fit:cover. */
    imageHeight?: number;
  };
}

export type EmailElement =
  | TextElement
  | ImageElement
  | ButtonElement
  | SpacerElement
  | DividerElement
  | ProductGridElement;

/**
 * Type of an editable slot within an htmlOverride block.
 *
 *   "text"  — replace the text content of the target element (safe, no markup)
 *   "html"  — replace the innerHTML of the target element (preserves inline tags)
 *   "image" — replace the `src` (and optionally `alt`) of an `<img>` element
 *   "href"  — replace the `href` attribute of a link element
 */
export type SlotType = "text" | "html" | "image" | "href";

/**
 * A single editable slot inside an htmlOverride block.
 *
 * The HTML template marks the target element with `data-slot="key"`:
 *
 *   <p data-slot="eyebrow" style="…">Default eyebrow label</p>
 *   <h1 data-slot="headline" style="…">Default headline text</h1>
 *   <img data-slot="hero_image" src="…" alt="…">
 *   <a data-slot="cta_link" href="https://…">…</a>
 *
 * Storing the editable value here (not inside the HTML) means the HTML
 * template's design is never mutated — only the value is swapped at
 * render time (both in the canvas preview and in the exported HTML).
 */
export interface EditableSlot {
  type: SlotType;
  /** Current value: text string, HTML string, image URL, or href URL. */
  value: string;
  /** For "image" slots: the alt text. */
  alt?: string;
  /** Human-readable label shown in the right sidebar editing panel. */
  label: string;
}

export interface EmailModule {
  id: string;
  type: string; // e.g. "header.hero", "cta.simple"
  name: string;
  style?: BaseStyle;
  children: EmailElement[];
  /** Free-form per-module data used by plugins (e.g. `recommendations` logic). */
  data?: Record<string, unknown>;
  /**
   * When set, replaces the rendered children HTML for this block.
   * The outer module wrapper (background, padding) is still applied from `style`.
   * Use the HTML editor in the canvas toolbar to set/clear this override.
   */
  htmlOverride?: string;
  /**
   * Editable content slots for `htmlOverride` blocks.
   *
   * Keys match the `data-slot="key"` attributes in the `htmlOverride` HTML.
   * Values hold the current content and are substituted into the HTML at render
   * time — the template HTML itself is never mutated.
   *
   * When present, the block becomes selectable in the canvas and the right
   * sidebar shows a "Content" panel with editable fields for each slot.
   *
   * Example:
   *   htmlOverride: '<p data-slot="headline" style="…">Default</p>',
   *   editableSlots: {
   *     headline: { type: "text", value: "My headline", label: "Headline" }
   *   }
   */
  editableSlots?: Record<string, EditableSlot>;
}

export interface ThemeTokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
  /**
   * Theme-level button defaults. These apply when the individual button element
   * does not have its own explicit (concrete, non-token) value for the same property.
   * Override order: element-explicit > theme.button.* > built-in fallback.
   */
  button?: {
    /** Corner radius in px. Default: 6. */
    borderRadius?: number;
    /** Border color (hex or token ref like "{colors.primary}"). Default: "transparent". */
    borderColor?: string;
    /** Border width in px. Set > 0 to show a button border. Default: 0. */
    borderWidth?: number;
  };
  /**
   * Theme-level text behaviour. Applied during HTML rendering.
   */
  text?: {
    /** Whether links within text elements are underlined. Default: true. */
    linkUnderline?: boolean;
  };
  /**
   * Theme-level heading/title defaults. Applied to TextElement nodes with
   * `role === "headline"` when the element has no explicit (non-token) value
   * for the same property.
   * Accepts concrete values (e.g. "#FF0000") or token refs (e.g. "{colors.primary}").
   */
  heading?: {
    /** Heading font size in px. */
    fontSize?: number;
    /** Heading text color — hex or token reference. */
    color?: string;
    /** Heading font weight ("bold", "normal", "600", …). */
    fontWeight?: string;
  };
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

export type Selection =
  | { kind: "email" }
  | { kind: "module"; moduleId: string }
  | { kind: "element"; moduleId: string; elementId: string }
  | null;
