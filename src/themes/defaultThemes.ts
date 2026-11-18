import type { Theme } from "../core/types";

/**
 * Shared defaults for the new token groups. These match the previous hardcoded
 * behaviour so existing emails render identically after the upgrade.
 * Custom tenant themes should spread these and override what they need:
 *
 * ```ts
 * import { DEFAULT_BUTTON_TOKENS, DEFAULT_TEXT_TOKENS } from "./defaultThemes";
 * const myTheme: Theme = {
 *   tokens: {
 *     ...
 *     button: { ...DEFAULT_BUTTON_TOKENS, borderRadius: 0 },
 *     text:   { ...DEFAULT_TEXT_TOKENS },
 *     heading: { fontSize: 32, color: "{colors.primary}" },
 *   },
 * };
 * ```
 */
export const DEFAULT_BUTTON_TOKENS = { borderRadius: 6, borderColor: "transparent", borderWidth: 0 } as const;
export const DEFAULT_TEXT_TOKENS   = { linkUnderline: true } as const;
/**
 * Default heading token values. These are used when a heading element has no
 * explicit (concrete, non-token) fontSize / fontWeight / color set.
 * fontSize: 28 matches the previous hardcoded default for unlevel headings.
 */
export const DEFAULT_HEADING_TOKENS = { fontSize: 28, fontWeight: "bold" } as const;

export const minimalSaaS: Theme = {
  id: "minimal-saas",
  name: "Minimal SaaS",
  tokens: {
    colors: {
      background: "#F4F5F7",
      surface: "#FFFFFF",
      primary: "#2563EB",
      text: "#0F172A",
      muted: "#64748B",
      buttonBackground: "#2563EB",
      buttonText: "#FFFFFF",
    },
    fonts: {
      heading: "Helvetica, Arial, sans-serif",
      body: "Helvetica, Arial, sans-serif",
      button: "Helvetica, Arial, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 4, md: 8, lg: 16 },
    button:  { ...DEFAULT_BUTTON_TOKENS, borderRadius: 8 },
    text:    { ...DEFAULT_TEXT_TOKENS },
    heading: { ...DEFAULT_HEADING_TOKENS, fontSize: 28 },
  },
};

export const ecommercePromo: Theme = {
  id: "ecommerce-promo",
  name: "Ecommerce Promo",
  tokens: {
    colors: {
      background: "#FFF7ED",
      surface: "#FFFFFF",
      primary: "#EA580C",
      text: "#1C1917",
      muted: "#78716C",
      buttonBackground: "#EA580C",
      buttonText: "#FFFFFF",
    },
    fonts: {
      heading: "Georgia, serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 4, md: 8, lg: 24 },
    button:  { ...DEFAULT_BUTTON_TOKENS, borderRadius: 24 },
    text:    { ...DEFAULT_TEXT_TOKENS },
    heading: { ...DEFAULT_HEADING_TOKENS, fontSize: 32, color: "{colors.primary}" },
  },
};

export const luxuryBlack: Theme = {
  id: "luxury-black",
  name: "Luxury Black",
  tokens: {
    colors: {
      background: "#000000",
      surface: "#0A0A0A",
      primary: "#D4AF37",
      text: "#F5F5F5",
      muted: "#9CA3AF",
      buttonBackground: "#D4AF37",
      buttonText: "#000000",
    },
    fonts: {
      heading: "Georgia, serif",
      body: "Georgia, serif",
      button: "Helvetica, Arial, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },
    radius: { sm: 0, md: 0, lg: 0 },
    button:  { ...DEFAULT_BUTTON_TOKENS, borderRadius: 0, borderColor: "{colors.primary}", borderWidth: 1 },
    text:    { ...DEFAULT_TEXT_TOKENS },
    heading: { ...DEFAULT_HEADING_TOKENS, fontSize: 36, color: "{colors.primary}" },
  },
};

export const greenEco: Theme = {
  id: "green-eco",
  name: "Green Eco",
  tokens: {
    colors: {
      background: "#BEC0B6",
      surface: "#FFFFFF",
      primary: "#3A7D52",
      text: "#2C2928",
      muted: "#6B6B6B",
      buttonBackground: "#3A7D52",
      buttonText: "#FFFFFF",
    },
    fonts: {
      heading: "Georgia, serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 4, md: 8, lg: 16 },
    button:  { ...DEFAULT_BUTTON_TOKENS, borderRadius: 4 },
    text:    { ...DEFAULT_TEXT_TOKENS },
    heading: { ...DEFAULT_HEADING_TOKENS, fontSize: 26 },
  },
};

export const newsletterEditorial: Theme = {
  id: "newsletter-editorial",
  name: "Newsletter Editorial",
  tokens: {
    colors: {
      background: "#FAFAF9",
      surface: "#FFFFFF",
      primary: "#111827",
      text: "#111827",
      muted: "#6B7280",
      buttonBackground: "#111827",
      buttonText: "#FFFFFF",
    },
    fonts: {
      heading: "Georgia, 'Times New Roman', serif",
      body: "Georgia, 'Times New Roman', serif",
      button: "Helvetica, Arial, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 32, xl: 48 },
    radius: { sm: 2, md: 4, lg: 8 },
    button:  { ...DEFAULT_BUTTON_TOKENS, borderRadius: 2 },
    text:    { ...DEFAULT_TEXT_TOKENS, linkUnderline: false },
    heading: { fontSize: 22, fontWeight: "normal", color: "{colors.text}" },
  },
};

export const defaultThemes: Theme[] = [
  minimalSaaS,
  ecommercePromo,
  luxuryBlack,
  greenEco,
  newsletterEditorial,
];
