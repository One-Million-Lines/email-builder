// JSON-first document model for OpenPostcards AI Builder.
// All emails are stored as structured JSON; HTML is generated from JSON.

export type ElementType = "text" | "image" | "button" | "spacer" | "divider" | "productGrid";

/**
 * Marks a link as a well-known system link. Backend processors replace the
 * placeholder href (e.g. `{{unsubscribe_url}}`) with a real per-recipient URL.
 * The rendered HTML also carries a `data-link-type` attribute so backends that
 * parse HTML can find and replace these links without inspecting the JSON.
 */
export type SpecialLinkType = "unsubscribe" | "view_in_browser" | "manage_preferences" | "user_profile";

/** Placeholder href values automatically set when a SpecialLinkType is chosen. */
export const SPECIAL_LINK_PLACEHOLDERS: Record<SpecialLinkType, string> = {
  unsubscribe: "{{unsubscribe_url}}",
  view_in_browser: "{{view_in_browser_url}}",
  manage_preferences: "{{manage_preferences_url}}",
  user_profile: "{{user_profile_url}}",
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
  type: string; // e.g. "header.hero", "cta.simple"
  name: string;
  style?: BaseStyle;
  children: EmailElement[];
  /** Free-form per-module data used by plugins (e.g. `recommendations` logic). */
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

export type Selection =
  | { kind: "email" }
  | { kind: "module"; moduleId: string }
  | { kind: "element"; moduleId: string; elementId: string }
  | null;
