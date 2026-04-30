// Shared element builders for module definitions.
// Keeps individual module files terse and consistent.
import type { EmailElement, EmailModule, Product, ProductGridElement } from "../core/types";
import { uid } from "../core/utils";

export const text = (
  content: string,
  opts: Partial<{
    role: "headline" | "subheadline" | "body" | "caption";
    fontSize: number;
    fontFamily: string;
    fontWeight: number | string;
    color: string;
    align: "left" | "center" | "right";
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    lineHeight: number;
    letterSpacing: number;
    link: string;
    mobile: Record<string, unknown>;
  }> = {}
): EmailElement => {
  // Sensible mobile defaults: tighter side padding, slightly smaller large headings.
  const baseFontSize = opts.fontSize ?? 16;
  const mobileDefaults: Record<string, unknown> = {
    paddingLeft: 16,
    paddingRight: 16,
  };
  if (baseFontSize >= 28) mobileDefaults.fontSize = Math.max(22, Math.round(baseFontSize * 0.78));
  else if (baseFontSize >= 22) mobileDefaults.fontSize = Math.max(20, Math.round(baseFontSize * 0.85));
  return {
    id: uid("el"),
    type: "text",
    role: opts.role,
    content,
    style: {
      fontFamily: opts.fontFamily ?? "{fonts.body}",
      fontSize: baseFontSize,
      fontWeight: opts.fontWeight,
      color: opts.color ?? "{colors.text}",
      align: opts.align ?? "left",
      paddingTop: opts.paddingTop ?? 8,
      paddingBottom: opts.paddingBottom ?? 8,
      paddingLeft: opts.paddingLeft ?? 24,
      paddingRight: opts.paddingRight ?? 24,
      lineHeight: opts.lineHeight ?? 1.5,
      letterSpacing: opts.letterSpacing,
      link: opts.link,
      mobile: { ...mobileDefaults, ...(opts.mobile ?? {}) },
    },
  };
};

export const image = (
  src: string,
  alt: string,
  opts: Partial<{
    width: number;
    height: number;
    align: "left" | "center" | "right";
    link: string;
    paddingTop: number;
    paddingBottom: number;
    borderRadius: number;
    mobile: Record<string, unknown>;
  }> = {}
): EmailElement => {
  const w = opts.width ?? 552;
  // Mobile: cap to viewport width (account for outer 16px padding).
  const mobileDefaults: Record<string, unknown> = w > 343 ? { width: 343, align: "center" } : {};
  return {
    id: uid("el"),
    type: "image",
    src,
    alt,
    link: opts.link,
    style: {
      width: w,
      height: opts.height,
      align: opts.align ?? "center",
      paddingTop: opts.paddingTop ?? 8,
      paddingBottom: opts.paddingBottom ?? 8,
      borderRadius: opts.borderRadius,
      mobile: { ...mobileDefaults, ...(opts.mobile ?? {}) },
    },
  };
};

export const button = (
  label: string,
  link = "#",
  opts: Partial<{
    align: "left" | "center" | "right";
    backgroundColor: string;
    color: string;
    fontSize: number;
    borderRadius: number;
    paddingTop: number;
    paddingBottom: number;
    mobile: Record<string, unknown>;
  }> = {}
): EmailElement => ({
  id: uid("el"),
  type: "button",
  label,
  link,
  style: {
    backgroundColor: opts.backgroundColor ?? "{colors.buttonBackground}",
    color: opts.color ?? "{colors.buttonText}",
    fontFamily: "{fonts.button}",
    fontSize: opts.fontSize ?? 16,
    borderRadius: opts.borderRadius ?? 8,
    align: opts.align ?? "center",
    paddingTop: opts.paddingTop ?? 16,
    paddingBottom: opts.paddingBottom ?? 16,
    // On mobile, full-width touch-friendly button.
    mobile: { align: "center", ...(opts.mobile ?? {}) },
  },
});

export const spacer = (height = 16): EmailElement => ({
  id: uid("el"),
  type: "spacer",
  height,
});

export const divider = (
  opts: Partial<{ color: string; thickness: number; paddingTop: number; paddingBottom: number }> = {}
): EmailElement => ({
  id: uid("el"),
  type: "divider",
  style: {
    color: opts.color ?? "#E5E7EB",
    thickness: opts.thickness ?? 1,
    paddingTop: opts.paddingTop ?? 8,
    paddingBottom: opts.paddingBottom ?? 8,
  },
});

export const mod = (
  type: string,
  name: string,
  children: EmailElement[],
  style?: EmailModule["style"]
): EmailModule => ({
  id: uid("module"),
  type,
  name,
  style: style ?? {
    backgroundColor: "{colors.surface}",
    paddingTop: 16,
    paddingBottom: 16,
    mobile: { paddingLeft: 0, paddingRight: 0 },
  },
  children,
});

// Heading shortcut for newsletter article titles.
export const heading = (
  content: string,
  opts: {
    level?: 1 | 2 | 3;
    align?: "left" | "center" | "right";
    paddingTop?: number;
    paddingBottom?: number;
    fontSize?: number;
  } = {}
) => {
  const sizes = { 1: 32, 2: 24, 3: 18 } as const;
  return text(content, {
    role: "headline",
    fontFamily: "{fonts.heading}",
    fontSize: opts.fontSize ?? sizes[opts.level ?? 2],
    fontWeight: "bold",
    align: opts.align,
    paddingTop: opts.paddingTop ?? 16,
    paddingBottom: opts.paddingBottom ?? 8,
    lineHeight: 1.25,
  });
};

export const eyebrow = (
  content: string,
  opts: { align?: "left" | "center" | "right"; paddingTop?: number; paddingBottom?: number } = {}
) =>
  text(content.toUpperCase(), {
    fontSize: 12,
    fontWeight: "bold",
    color: "{colors.primary}",
    letterSpacing: 2,
    align: opts.align,
    paddingTop: opts.paddingTop ?? 16,
    paddingBottom: opts.paddingBottom ?? 4,
  });

export const muted = (
  content: string,
  opts: {
    align?: "left" | "center" | "right";
    fontSize?: number;
    paddingTop?: number;
    paddingBottom?: number;
    lineHeight?: number;
    link?: string;
    letterSpacing?: number;
  } = {}
) =>
  text(content, {
    color: "{colors.muted}",
    align: opts.align,
    fontSize: opts.fontSize ?? 14,
    paddingTop: opts.paddingTop,
    paddingBottom: opts.paddingBottom,
    lineHeight: opts.lineHeight,
    link: opts.link,
    letterSpacing: opts.letterSpacing,
  });

export const PLACEHOLDER = (w: number, h: number, label = "Image") =>
  `https://placehold.co/${w}x${h}?text=${encodeURIComponent(label)}`;

let productSeed = 0;
export const product = (p: Partial<Product> & { name: string; finalPrice: string }): Product => {
  productSeed += 1;
  return {
    id: uid("prod"),
    image: p.image ?? PLACEHOLDER(400, 400, p.name),
    imageAlt: p.imageAlt ?? p.name,
    name: p.name,
    finalPrice: p.finalPrice,
    oldPrice: p.oldPrice,
    description: p.description,
    link: p.link ?? "#",
    buttonLabel: p.buttonLabel,
  };
};

export const productGrid = (
  products: Product[],
  opts: Partial<{
    columns: 1 | 2 | 3;
    showOldPrice: boolean;
    showButton: boolean;
    showDescription: boolean;
    buttonLabel: string;
    cardBackgroundColor: string;
    nameColor: string;
    finalPriceColor: string;
    oldPriceColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    borderRadius: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  }> = {}
): ProductGridElement => ({
  id: uid("el"),
  type: "productGrid",
  products,
  columns: opts.columns ?? (products.length >= 3 ? 3 : 2),
  showOldPrice: opts.showOldPrice ?? products.some((p) => !!p.oldPrice),
  showButton: opts.showButton ?? true,
  showDescription: opts.showDescription ?? false,
  buttonLabel: opts.buttonLabel ?? "Shop now",
  style: {
    cardBackgroundColor: opts.cardBackgroundColor ?? "{colors.surface}",
    nameColor: opts.nameColor ?? "{colors.text}",
    finalPriceColor: opts.finalPriceColor ?? "{colors.primary}",
    oldPriceColor: opts.oldPriceColor ?? "#9CA3AF",
    buttonBackgroundColor: opts.buttonBackgroundColor ?? "{colors.buttonBackground}",
    buttonColor: opts.buttonColor ?? "{colors.buttonText}",
    borderRadius: opts.borderRadius ?? 8,
    paddingTop: opts.paddingTop ?? 8,
    paddingBottom: opts.paddingBottom ?? 8,
    paddingLeft: opts.paddingLeft ?? 16,
    paddingRight: opts.paddingRight ?? 16,
  },
});
