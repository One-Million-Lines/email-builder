/**
 * Feroshop brand theme — example of a custom per-tenant theme and starter template.
 *
 * Visual design reference (feroshop.ro):
 *  • Black top-bar / logo area
 *  • White surface with very light-gray outer background
 *  • Warm orange (#E05020) for CTAs, accent text and "OFERTE" badge
 *  • Near-black bold headings
 *  • Bold, impact-forward typography (Arial/Helvetica — email-safe)
 *  • Rounded corners on promo elements (~8–12 px)
 *  • Dark announcement strip for promo messages (like the site's black header bar)
 *
 * Usage in your host app:
 *
 *   import { feroshopTheme } from "./feroshop-theme";
 *   import feroshopStarterDef from "./feroshop-theme";
 *   import { defaultThemes, templateRegistry, registerTheme } from "@one-million-lines/email-builder";
 *
 *   templateRegistry.register(feroshopStarterDef);
 *   registerTheme(feroshopTheme);
 *
 *   <EmailBuilder
 *     themes={[feroshopTheme, ...defaultThemes]}
 *     initialDocument={feroshopStarterDef.build()}
 *   />
 */

import type { Theme, EmailDocument } from "@one-million-lines/email-builder";
import {
  templateRegistry,
  type TemplateDefinition,
  mod,
  text,
  heading,
  eyebrow,
  muted,
  image,
  button,
  spacer,
  divider,
  product,
  productGrid,
  footerLinks,
  logoImage,
  shopInfoText,
  PLACEHOLDER,
} from "@one-million-lines/email-builder";

// ─── 1. Brand theme ──────────────────────────────────────────────────────────

/**
 * Feroshop brand theme.
 *
 * Inspired by feroshop.ro — B2B hardware / ironmongery e-commerce.
 *  background  — very light gray neutral outer wrap (matches site's body bg)
 *  surface     — white content panels
 *  primary     — Feroshop orange (logo roof, CTA buttons, accent text)
 *  text        — near-black body text (bold where needed)
 *  muted       — gray secondary text
 *  button*     — orange filled CTA, white label
 *  radius.sm   — 4 px; radius.lg — 12 px (promo banners have visible rounding)
 */
export const feroshopTheme: Theme = {
  id: "feroshop",
  name: "Feroshop",
  tokens: {
    colors: {
      background:       "#F4F5F6",   // very light neutral outer wrap
      surface:          "#FFFFFF",   // white content panels
      primary:          "#E05020",   // Feroshop orange
      text:             "#111827",   // near-black
      muted:            "#6B7280",   // gray secondary text
      buttonBackground: "#E05020",   // orange CTA fill
      buttonText:       "#FFFFFF",
    },
    fonts: {
      // Bold sans-serif for headings (impact-forward, like the site)
      heading: "Arial, Helvetica, sans-serif",
      body:    "Arial, Helvetica, sans-serif",
      button:  "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius:  { sm: 4, md: 8, lg: 12 },
  },
};

// ─── 2. Starter template ─────────────────────────────────────────────────────

/**
 * Feroshop starter — pre-built campaign email in the Feroshop brand.
 *
 * Structure:
 *  1. White logo header
 *  2. Dark (#1C1C1C) announcement strip — promo label in orange
 *  3. Bold hero section — campaign headline + sub-copy + CTA (white bg)
 *  4. Full-width hero image (borderless)
 *  5. "Products" section label (light-gray strip)
 *  6. 3-column product grid (light-gray bg, white cards)
 *  7. Dark footer with address and legal links
 */
const feroshopStarterDef: TemplateDefinition = {
  id: "feroshop-starter",
  name: "Feroshop — Starter",
  category: "ecommerce",
  description:
    "Starter template for Feroshop: B2B hardware commerce with bold orange CTAs, dark announcement strip, product grid and dark footer.",
  tags: ["feroshop", "hardware", "ecommerce", "b2b", "tenant", "custom-brand"],
  thumbnail: `https://placehold.co/300x400/F4F5F6/E05020?text=Feroshop`,

  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Feroshop — Campanie",
      previewText: "Oferte speciale pentru profesionisti · Feronerie & Scule",
    },
    theme: feroshopTheme,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      // 1. Logo header ─────────────────────────────────────────────────────────
      mod(
        "header.logo",
        "Header",
        [
          logoImage(PLACEHOLDER(160, 40, "FEROSHOP"), {
            width:         160,
            align:         "left",
            paddingTop:    16,
            paddingBottom: 16,
          }),
        ],
        {
          backgroundColor: "#FFFFFF",
          paddingTop:    0,
          paddingBottom: 0,
          paddingLeft:   24,
          paddingRight:  24,
        }
      ),

      // 2. Dark announcement strip ─────────────────────────────────────────────
      mod(
        "header.announcement",
        "Announcement",
        [
          text("🎁 OFERTA LIMITATA · Platesti 7, primesti 1 GRATUIT", {
            color:         "#FFFFFF",
            fontSize:      13,
            fontWeight:    "bold",
            align:         "center",
            paddingTop:    12,
            paddingBottom: 12,
          }),
        ],
        {
          backgroundColor: "#1C1C1C",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),

      // 3. Bold hero — campaign headline ────────────────────────────────────────
      mod(
        "hero.promo",
        "Hero Promo",
        [
          eyebrow("CAMPANIE", { align: "left", paddingTop: 24, paddingBottom: 4 }),
          heading("Produse premium\npentru profesionisti", {
            align:         "left",
            level:         1,
            paddingTop:    0,
            paddingBottom: 8,
          }),
          muted(
            "Descopera noua colectie de feronerie si scule profesionale. Calitate garantata, livrare rapida.",
            {
              align:         "left",
              fontSize:      15,
              paddingTop:    0,
              paddingBottom: 16,
              lineHeight:    1.6,
            }
          ),
          button("Alege pachetul →", "#", {
            align:        "left",
            borderRadius: 8,
          }),
          spacer(16),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    0,
          paddingBottom: 0,
          paddingLeft:   24,
          paddingRight:  24,
        }
      ),

      // 4. Full-width hero image ────────────────────────────────────────────────
      mod(
        "content.hero_image",
        "Hero Image",
        [
          image(PLACEHOLDER(600, 280, "PRODUCT IMAGE"), "Product", {
            width:         600,
            align:         "center",
            paddingTop:    0,
            paddingBottom: 0,
          }),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    0,
          paddingBottom: 0,
          paddingLeft:   0,
          paddingRight:  0,
        }
      ),

      // 5. Section label ────────────────────────────────────────────────────────
      mod(
        "content.section_label",
        "Products Label",
        [
          eyebrow("PRODUSE RECOMANDATE", {
            align:         "center",
            paddingTop:    20,
            paddingBottom: 4,
          }),
        ],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),

      // 6. Product grid ─────────────────────────────────────────────────────────
      mod(
        "ecommerce.product_grid",
        "Product Grid",
        [
          productGrid(
            [
              product({
                name:        "Denumire produs",
                finalPrice:  "149,00",
                oldPrice:    "189,00",
                image:       PLACEHOLDER(300, 300, "Produs 1"),
                buttonLabel: "Adauga in cos",
              }),
              product({
                name:        "Denumire produs",
                finalPrice:  "89,00",
                oldPrice:    "120,00",
                image:       PLACEHOLDER(300, 300, "Produs 2"),
                buttonLabel: "Adauga in cos",
              }),
              product({
                name:        "Denumire produs",
                finalPrice:  "219,00",
                oldPrice:    "260,00",
                image:       PLACEHOLDER(300, 300, "Produs 3"),
                buttonLabel: "Adauga in cos",
              }),
            ],
            {
              columns:      3,
              showOldPrice: true,
              showButton:   true,
              buttonLabel:  "Adauga in cos",
              borderRadius: 8,
            }
          ),
        ],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    8,
          paddingBottom: 16,
        }
      ),

      // 7. Dark footer ─────────────────────────────────────────────────────────
      mod(
        "footer.legal",
        "Footer",
        [
          divider({ color: "#374151", paddingTop: 0, paddingBottom: 16 }),
          shopInfoText(
            "Feroshop · Bd. Iuliu Maniu, nr. 7 · București, România",
            { align: "center", fontSize: 12, paddingTop: 0 }
          ),
          footerLinks(
            [
              { label: "Dezaboneaza-te",        type: "unsubscribe" },
              { label: "Vizualizeaza in browser", type: "view_in_browser" },
            ],
            { align: "center", fontSize: 12, color: "#9CA3AF" }
          ),
        ],
        {
          backgroundColor: "#1C1C1C",
          paddingTop:    24,
          paddingBottom: 0,
        }
      ),
    ],
  }),
};

templateRegistry.register(feroshopStarterDef);
export default feroshopStarterDef;
