// JSON-first document model for OpenPostcards AI Builder.
// All emails are stored as structured JSON; HTML is generated from JSON.

export type ElementType = "text" | "image" | "button" | "spacer" | "divider" | "productGrid";

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
  role?: "headline" | "subheadline" | "body" | "caption";
  content: string; // may contain limited HTML (b, i, a)
  style?: BaseStyle & {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    fontWeight?: number | string;
    color?: string;
    link?: string;
  };
}

export interface ImageElement {
  id: string;
  type: "image";
  src: string;
  alt?: string;
  link?: string;
  style?: BaseStyle & { width?: number; height?: number };
}

export interface ButtonElement {
  id: string;
  type: "button";
  label: string;
  link: string;
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
}

export interface ProductGridElement {
  id: string;
  type: "productGrid";
  products: Product[];
  columns: 1 | 2 | 3;
  showOldPrice: boolean;
  showButton: boolean;
  showDescription: boolean;
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
