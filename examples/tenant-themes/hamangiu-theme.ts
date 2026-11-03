/**
 * Hamangiu brand theme — example of a custom per-tenant theme and starter template.
 *
 * Visual design reference:
 *  • Steel-blue outer background
 *  • White content panels (surface)
 *  • Warm orange CTAs and prices
 *  • Dark near-black body text
 *  • Arial sans-serif throughout
 *  • Low border-radius (professional, editorial feel)
 *
 * Usage in your host app:
 *
 *   import { hamangiuTheme } from "./hamangiu-theme";
 *   import hamangiuStarterDef from "./hamangiu-theme";
 *   import { defaultThemes, templateRegistry } from "@one-million-lines/email-builder";
 *
 *   templateRegistry.register(hamangiuStarterDef);
 *
 *   <EmailBuilder
 *     themes={[hamangiuTheme, ...defaultThemes]}
 *     initialDocument={hamangiuStarterDef.build()}
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
 * Hamangiu brand theme.
 *
 * Token reference:
 *  background       — steel-blue outer wrapper shown between content panels
 *  surface          — white content panels
 *  primary          — warm orange (links, price labels, eyebrow text)
 *  text             — near-black body text
 *  muted            — gray secondary / caption text
 *  buttonBackground — orange CTA button
 *  buttonText       — white button label
 */
export const hamangiuTheme: Theme = {
  id: "hamangiu",
  name: "Hamangiu",
  tokens: {
    colors: {
      background:       "#D6E4EF",   // steel-blue outer wrap
      surface:          "#FFFFFF",   // white content panels
      primary:          "#F07638",   // warm orange
      text:             "#1A1A2E",   // near-black body
      muted:            "#6B7280",   // gray secondary text
      buttonBackground: "#F07638",   // orange CTA
      buttonText:       "#FFFFFF",
    },
    fonts: {
      heading: "Arial, Helvetica, sans-serif",
      body:    "Arial, Helvetica, sans-serif",
      button:  "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    // Low radius — clean, editorial, professional.
    radius: { sm: 2, md: 4, lg: 8 },
  },
};

// ─── 2. Starter template ─────────────────────────────────────────────────────

/**
 * Hamangiu starter — a pre-built email in the Hamangiu brand.
 *
 * Structure:
 *  1. White logo header
 *  2. Steel-blue "Astazi, noi va recomandam" eyebrow strip
 *  3. Hero product image (white panel)
 *  4. Product headline + description (white panel)
 *  5. Price + orange CTA (white panel)
 *  6. Divider / spacer in steel-blue
 *  7. 3-column product grid (steel-blue panel)
 *  8. White legal footer with VT-aware links
 *
 * The template registers itself with templateRegistry so it appears in the
 * "Templates" modal under the Ecommerce category.
 */
const hamangiuStarterDef: TemplateDefinition = {
  id: "hamangiu-starter",
  name: "Hamangiu — Starter",
  category: "ecommerce",
  description:
    "Starter template for the Hamangiu brand: steel-blue background, white content panels, orange CTAs, and a 3-column product grid.",
  tags: ["hamangiu", "ecommerce", "product", "books", "tenant", "custom-brand"],
  thumbnail: `https://placehold.co/300x400/D6E4EF/F07638?text=Hamangiu`,

  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Hamangiu — Recomandari",
      previewText: "Astazi, noi va recomandam",
    },
    theme: hamangiuTheme,
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
          logoImage(PLACEHOLDER(150, 40, "LOGO"), {
            width:         150,
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

      // 2. "We recommend today" eyebrow strip ───────────────────────────────────
      mod(
        "header.eyebrow",
        "Eyebrow",
        [
          eyebrow("Astazi, noi va recomandam", {
            align:         "center",
            paddingTop:    12,
            paddingBottom: 12,
          }),
        ],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),

      // 3. Hero product image ───────────────────────────────────────────────────
      mod(
        "content.hero_image",
        "Hero Image",
        [
          image(PLACEHOLDER(560, 300, "PRODUCT IMAGE"), "Product", {
            width:         560,
            align:         "center",
            paddingTop:    8,
            paddingBottom: 8,
          }),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    8,
          paddingBottom: 0,
          paddingLeft:   16,
          paddingRight:  16,
        }
      ),

      // 4. Product headline + description ────────────────────────────────────────
      mod(
        "content.product_headline",
        "Product Info",
        [
          heading("Titlul Cartii / Produsului", {
            align:         "left",
            level:         2,
            paddingTop:    16,
            paddingBottom: 8,
          }),
          text(
            "Visitati <a href=\"#\" style=\"color:{colors.primary}\">site-ul nostru</a> pentru a descoperi cele mai <a href=\"#\" style=\"color:{colors.primary}\">noi produse</a>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae venenatis nulla. Proin bibendum lacus at dapibus viverra.",
            { align: "left", fontSize: 14, paddingTop: 4, paddingBottom: 8 }
          ),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    0,
          paddingBottom: 4,
        }
      ),

      // 5. Price + CTA ─────────────────────────────────────────────────────────
      mod(
        "cta.price",
        "Price & CTA",
        [
          text(
            "<s style=\"color:#9CA3AF;font-size:14px\">99,00</s>&nbsp;&nbsp;<strong>79,00</strong>",
            {
              color:         "{colors.primary}",
              fontSize:      18,
              align:         "left",
              paddingTop:    4,
              paddingBottom: 8,
            }
          ),
          button("Vezi detalii", "#", {
            align:        "left",
            borderRadius: 4,
          }),
          spacer(16),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),

      // 6. Spacer strip ──────────────────────────────────────────────────────────
      mod(
        "layout.spacer",
        "Section Spacer",
        [spacer(8)],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),

      // 7. "Also recommended" product grid ───────────────────────────────────────
      mod(
        "content.grid_header",
        "Grid Eyebrow",
        [
          eyebrow("De asemenea recomandam", {
            align:         "center",
            paddingTop:    16,
            paddingBottom: 4,
          }),
        ],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    0,
          paddingBottom: 0,
        }
      ),
      mod(
        "ecommerce.product_grid",
        "Product Grid",
        [
          productGrid(
            [
              product({
                name:       "Denumire produs",
                finalPrice: "49,00",
                oldPrice:   "65,00",
                image:      PLACEHOLDER(300, 300, "Produs 1"),
                buttonLabel: "Vezi detalii",
              }),
              product({
                name:       "Denumire produs",
                finalPrice: "39,00",
                oldPrice:   "55,00",
                image:      PLACEHOLDER(300, 300, "Produs 2"),
                buttonLabel: "Vezi detalii",
              }),
              product({
                name:       "Denumire produs",
                finalPrice: "59,00",
                oldPrice:   "70,00",
                image:      PLACEHOLDER(300, 300, "Produs 3"),
                buttonLabel: "Vezi detalii",
              }),
            ],
            {
              columns:      3,
              showOldPrice: true,
              showButton:   true,
              buttonLabel:  "Vezi detalii",
              borderRadius: 4,
            }
          ),
        ],
        {
          backgroundColor: "{colors.background}",
          paddingTop:    8,
          paddingBottom: 16,
        }
      ),

      // 8. Footer ─────────────────────────────────────────────────────────────
      mod(
        "footer.legal",
        "Footer",
        [
          divider({ paddingTop: 0, paddingBottom: 8 }),
          shopInfoText(
            "Editura Hamangiu · Str. Exemplu nr. 1 · București · România",
            { align: "center", fontSize: 12, paddingTop: 8 }
          ),
          footerLinks(
            [
              { label: "Dezaboneaza-te",        type: "unsubscribe" },
              { label: "Gestionare preferinte", type: "manage_preferences" },
              { label: "Vizualizeaza in browser", type: "view_in_browser" },
            ],
            { align: "center", fontSize: 12 }
          ),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop:    8,
          paddingBottom: 0,
        }
      ),
    ],
  }),
};

templateRegistry.register(hamangiuStarterDef);
export default hamangiuStarterDef;
