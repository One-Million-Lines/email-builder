/**
 * Hamangiu custom email blocks.
 *
 * Three tenant-specific modules that only make sense for the Hamangiu brand:
 *
 *  1. hamangiuCategoryNav    — Horizontal tab bar (Noutati · In curs de aparitie ·
 *                              Recomandam · Comunitate) on a steel-blue background.
 *  2. hamangiuBookFeature    — Two-column featured book: cover image | title, author,
 *                              price, CTA. Matches the Hamangiu product detail style.
 *  3. hamangiuPromoBadge     — Full-width orange badge strip with a promotional
 *                              discount announcement.
 *
 * All three use `htmlOverride` so they render in the editor preview and export
 * exactly the same email-safe table HTML without going through the element system.
 *
 * Usage (host app):
 *
 *   import { hamangiuBlocks } from "./hamangiu-blocks";
 *   import { hamangiuTheme } from "./hamangiu-theme";
 *
 *   <EmailBuilder
 *     modules={hamangiuBlocks}
 *     themes={[hamangiuTheme, ...defaultThemes]}
 *   />
 *
 * A "Custom" tab (purple accent, puzzle icon) appears automatically in the left
 * sidebar once modules with category "custom" are registered.
 */

import type { ModuleDefinition } from "@one-million-lines/email-builder";
import { uid } from "@one-million-lines/email-builder";

// ─── HTML templates ───────────────────────────────────────────────────────────
// All HTML is email-safe (table-based, inline styles, no gradients).

const HAM_CAT_NAV_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#D6E4EF;">
  <tr>
    <td align="center" style="padding:10px 16px 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:4px 10px;border-bottom:2px solid #F07638;">
            <a href="#" style="color:#F07638;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;">Noutati</a>
          </td>
          <td style="padding:4px 4px;color:#9CA3AF;font-family:Arial,sans-serif;font-size:13px;">|</td>
          <td style="padding:4px 10px;">
            <a href="#" style="color:#1A1A2E;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;">In curs de aparitie</a>
          </td>
          <td style="padding:4px 4px;color:#9CA3AF;font-family:Arial,sans-serif;font-size:13px;">|</td>
          <td style="padding:4px 10px;">
            <a href="#" style="color:#1A1A2E;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Recomandam</a>
          </td>
          <td style="padding:4px 4px;color:#9CA3AF;font-family:Arial,sans-serif;font-size:13px;">|</td>
          <td style="padding:4px 10px;">
            <a href="#" style="color:#1A1A2E;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Comunitate</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const HAM_BOOK_FEATURE_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
  <tr>
    <td width="40%" style="padding:20px 12px 20px 24px;vertical-align:top;">
      <img src="https://placehold.co/180x250/D6E4EF/1A1A2E?text=Coperta"
           alt="Coperta" width="160"
           style="display:block;max-width:100%;border:1px solid #E5E7EB;" />
    </td>
    <td width="60%" style="padding:20px 24px 20px 12px;vertical-align:top;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#F07638;letter-spacing:2px;text-transform:uppercase;">DREPT CIVIL · EDITIA A II-A</p>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#1A1A2E;line-height:1.3;">Titlul cartii si<br/>subtitlul sau</p>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B7280;line-height:1.5;">Autor: Prenume Nume<br/>560 pag. · ISBN 978-xxx-xxx</p>
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1A2E;line-height:1.5;">Lucrare fundamentala pentru practicieni si studenti in domeniu.</p>
      <p style="margin:0 0 16px;">
        <s style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9CA3AF;">99,00 lei</s>
        <strong style="font-family:Arial,Helvetica,sans-serif;font-size:22px;color:#F07638;margin-left:8px;">79,00 lei</strong>
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#F07638" style="border-radius:4px;">
            <a href="#" style="display:inline-block;padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Vezi detalii</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const HAM_PROMO_BADGE_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F07638;">
  <tr>
    <td align="center" style="padding:14px 24px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#FFFFFF;line-height:1.4;">
        🎁 DISCOUNT SPECIAL &nbsp;·&nbsp;
        <s style="opacity:0.75;">99,00</s> &nbsp;→&nbsp;
        <strong style="font-size:18px;">79,00 lei</strong>
        &nbsp;·&nbsp; Oferta limitata
      </p>
    </td>
  </tr>
</table>`;

// ─── Module definitions ───────────────────────────────────────────────────────

export const hamangiuCategoryNav: ModuleDefinition = {
  type: "hamangiu.nav.categories",
  category: "custom",
  name: "Category Navigation",
  description:
    "Horizontal tab bar on a steel-blue background: Noutati · In curs de aparitie · Recomandam · Comunitate. Active tab highlighted in orange.",
  tags: ["hamangiu", "navigation", "tabs", "categories", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.nav.categories",
    name: "Category Navigation",
    style: {
      backgroundColor: "#D6E4EF",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_CAT_NAV_HTML,
  }),
};

export const hamangiuBookFeature: ModuleDefinition = {
  type: "hamangiu.content.book_feature",
  category: "custom",
  name: "Book Feature",
  description:
    "Two-column featured book block: cover image (left) + title, author, price and CTA button (right). Styled for the Hamangiu editorial brand.",
  tags: ["hamangiu", "book", "product", "feature", "two-column", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.content.book_feature",
    name: "Book Feature",
    style: {
      backgroundColor: "#FFFFFF",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_BOOK_FEATURE_HTML,
  }),
};

export const hamangiuPromoBadge: ModuleDefinition = {
  type: "hamangiu.promo.badge",
  category: "custom",
  name: "Promo Badge",
  description:
    "Full-width orange badge strip with promotional discount announcement. Hamangiu brand orange (#F07638) background.",
  tags: ["hamangiu", "promo", "badge", "discount", "announcement", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.promo.badge",
    name: "Promo Badge",
    style: {
      backgroundColor: "#F07638",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_PROMO_BADGE_HTML,
  }),
};

/** All Hamangiu custom blocks as an array — pass directly to the `modules` prop. */
export const hamangiuBlocks: ModuleDefinition[] = [
  hamangiuCategoryNav,
  hamangiuBookFeature,
  hamangiuPromoBadge,
];

// ─────────────────────────────────────────────────────────────────────────────
// New blocks based on actual Hamangiu email designs
// ─────────────────────────────────────────────────────────────────────────────

// ── HTML templates ────────────────────────────────────────────────────────────

/**
 * Block 1 — Logo + "Vezi in browser" bar.
 * Steel-blue (#D6E4EF) background, full-width.
 * VT markers: vtw-logo on logo image, vtw-url on logo link, vtpreview on "view in browser".
 */
const HAM_LOGO_BROWSER_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#D6E4EF;">
  <tr>
    <td style="padding:15px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <a href="#" class="vtw-url" style="text-decoration:none;display:inline-table;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:9px;">
                    <img src="https://placehold.co/22x30/1A1A2E/D6E4EF?text=%E2%9C%A6" alt="" height="30" class="vtw-logo" style="display:block;border:none; max-height:30px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#1A1A2E;letter-spacing:0.2px;">Editura Hamangiu</span>
                  </td>
                </tr>
              </table>
            </a>
          </td>
          <td align="right" style="vertical-align:middle;white-space:nowrap;padding-left:16px;">
            <a class="vtpreview" href="{{view_in_browser_url}}" data-link-type="view_in_browser"
               style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#2471A3;text-decoration:underline;">
              Vezi in browser
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/**
 * Block 2 — Single product hero.
 * White (#FFFFFF) background.
 * Layout: eyebrow label → large product image → bold title → description with links
 *         → body paragraph → old/new price → wide rounded CTA button.
 *
 * VT backend product classes used:
 *   item-url        — on <a> wrapping product image and CTA button
 *   item-title      — on product title element
 *   item-old_price old_price  — on old/crossed-out price span
 *   item-final_price final_price — on final price span
 *
 * NOTE: item-image is NOT used here (not in the standard renderer). The product
 * image is nested inside <a class="item-url"> which is sufficient for VT backend.
 *
 * For full VT recommendation system support, set data: { vtproduct: "pos01" }
 * on the module instance (via create() or the gallery item).
 */
const HAM_PRODUCT_SINGLE_HERO_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
  <tr>
    <td align="center" style="padding:18px 0 0;">
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9CA3AF;text-align:center;letter-spacing:0.2px;">Astazi, noi va recomandam</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 16px;">
      <a href="#" class="item-url" style="display:block;text-decoration:none;">
        <img src="https://placehold.co/560x400/D0D0D0/888888?text=PRODUCT+IMAGE" alt="Product" width="560"
             style="display:block;max-width:100%;height:auto;border:none;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 0;">
      <p class="item-title" style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:bold;color:#1A1A2E;text-align:center;line-height:1.2;">Titlul cartii / Produsului</p>
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A1A2E;text-align:center;line-height:1.65;">
        Vizitati <a href="#" style="color:#F07638;text-decoration:underline;">site-ul hamangiu.ro</a> pentru a descoperi cele mai <a href="#" style="color:#F07638;text-decoration:underline;">noi aparitii</a> dar si ultimele oferte special gandite pentru cititorii nostrii.
      </p>
      <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A1A2E;text-align:justify;line-height:1.75;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae venenatis nulla. Proin bibendum lacus at dapibus viverra. Pellentesque iaculis arcu vitae ipsum pellentesque placerat. Vivamus quis sollicitudin ligula, ac egestas erat.</p>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 32px 28px;">
      <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9CA3AF;text-align:center;"><s class="item-old_price old_price" style="text-decoration:line-through;">530,00</s></p>
      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#1A1A2E;text-align:center;"><span class="item-final_price final_price">450,00</span></p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td bgcolor="#F07638" style="border-radius:22px;">
            <a href="#" class="item-url"
               style="display:inline-block;padding:14px 56px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;white-space:nowrap;border-radius:22px;">
              Vezi detalii
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/**
 * Block 3 — News header.
 * White (#FFFFFF) background.
 * Layout: centered book+envelope illustration → "Avem noutati" heading → description.
 * Standalone section that introduces a news/updates segment of the email.
 */
const HAM_NEWS_HEADER_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
  <tr>
    <td align="center" style="padding:32px 24px 8px;">
      <img src="https://placehold.co/200x195/F9DFA5/C8854A?text=Newsletter" alt="Avem Noutati" width="200"
           style="display:block;margin:0 auto;max-width:100%;height:auto;border:none;" />
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:8px 40px 28px;">
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:38px;font-weight:bold;color:#1A1A2E;text-align:center;line-height:1.2;">Avem noutati</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A1A2E;text-align:center;line-height:1.65;">
        Vizitati <a href="#" style="color:#F07638;text-decoration:underline;">site-ul hamangiu.ro</a> pentru a descoperi cele mai <a href="#" style="color:#F07638;text-decoration:underline;">noi aparitii</a> dar si ultimele oferte special gandite pentru cititorii nostrii.
      </p>
    </td>
  </tr>
</table>`;

/**
 * Block 4 — News with article items.
 * White (#FFFFFF) background.
 * Layout: centered book+envelope illustration → bold left-aligned heading → body paragraph
 *         → repeating news rows (thumbnail 70×70 | title + description + "Vezi detalii" link).
 * Add/remove rows by duplicating the news-item table block.
 */
const HAM_NEWS_ITEMS_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;">
  <tr>
    <td align="center" style="padding:28px 24px 0;">
      <img src="https://placehold.co/185x175/F9DFA5/C8854A?text=Newsletter" alt="Noutati" width="185"
           style="display:block;margin:0 auto;max-width:100%;height:auto;border:none;" />
    </td>
  </tr>
  <tr>
    <td style="padding:20px 24px 4px;">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:bold;color:#1A1A2E;text-align:left;line-height:1.25;">Avem noutati care te-ar putea interesa</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1A1A2E;text-align:left;line-height:1.75;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultrices cursus facilisis. In hac habitasse platea dictumst. Sed lacinia ante velit, quis condimentum nibh ultrices ac. Pellentesque facilisis sollicitudin sem eu auctor. In non pulvinar ante. Vestibulum placerat est efficitur libero porttitor aliquet. Donec tristique euismod quam id porttitor.</p>
    </td>
  </tr>
  <!-- News item 1 -->
  <tr>
    <td style="padding:20px 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="70" style="vertical-align:top;">
            <img src="https://placehold.co/70x70/D8D8D8/888888?text=img" alt="Thumbnail" width="70" height="70"
                 style="display:block;border:none;" />
          </td>
          <td style="vertical-align:top;padding-left:16px;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1A1A2E;line-height:1.3;">Noi evenimente</p>
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1A2E;line-height:1.65;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultrices cursus facilisis. In hac habitasse platea dictumst. Sed lacinia ante velit, quis condimentum nibh ultrices ac. Pellentesque facilisis sollicitudin sem eu auctor. In non pulvinar ante.</p>
            <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#F07638;text-decoration:underline;">
              Vezi detalii
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- News item 2 -->
  <tr>
    <td style="padding:18px 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="70" style="vertical-align:top;">
            <img src="https://placehold.co/70x70/D8D8D8/888888?text=img" alt="Thumbnail" width="70" height="70"
                 style="display:block;border:none;" />
          </td>
          <td style="vertical-align:top;padding-left:16px;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1A1A2E;line-height:1.3;">Noi evenimente</p>
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1A2E;line-height:1.65;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis ultrices cursus facilisis. In hac habitasse platea dictumst. Sed lacinia ante velit, quis condimentum nibh ultrices ac. Pellentesque facilisis sollicitudin sem eu auctor. In non pulvinar ante.</p>
            <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#F07638;text-decoration:underline;">
              Vezi detalii
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="height:24px;">&nbsp;</td>
  </tr>
</table>`;

// ── Module definitions ─────────────────────────────────────────────────────────

export const hamangiuLogoBrowser: ModuleDefinition = {
  type: "hamangiu.header.logo_browser",
  category: "custom",
  name: "Logo + View in Browser",
  description:
    "Steel-blue header bar with the Hamangiu logo (vtw-logo) on the left and a 'Vezi in browser' link (vtpreview) on the right. Always the first block in a Hamangiu email.",
  tags: ["hamangiu", "header", "logo", "view-in-browser", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.header.logo_browser",
    name: "Logo + View in Browser",
    style: {
      backgroundColor: "#D6E4EF",
      paddingTop: 0, paddingBottom: 0,
      paddingLeft: 0, paddingRight: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_LOGO_BROWSER_HTML,
  }),
};

export const hamangiuProductSingleHero: ModuleDefinition = {
  type: "hamangiu.product.single_hero",
  category: "custom",
  name: "Product Single Hero",
  description:
    "Full product spotlight: eyebrow label 'Astazi, noi va recomandam' → large product image → bold title → description with links → body text → old/new price → wide rounded orange CTA button. Uses VT product classes (item-url, item-title, item-old_price, item-final_price).",
  tags: ["hamangiu", "product", "hero", "single", "price", "cta", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.product.single_hero",
    name: "Product Single Hero",
    style: {
      backgroundColor: "#FFFFFF",
      paddingTop: 0, paddingBottom: 0,
      paddingLeft: 0, paddingRight: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    /**
     * For full VT recommendation system integration, set this on the module
     * instance after create():
     *   module.data = { vtproduct: "pos01" }
     */
    htmlOverride: HAM_PRODUCT_SINGLE_HERO_HTML,
  }),
};

export const hamangiuNewsHeader: ModuleDefinition = {
  type: "hamangiu.header.news_header",
  category: "custom",
  name: "News Header",
  description:
    "Section header for newsletter content: centered book+envelope illustration, 'Avem noutati' bold heading, centered description with orange links. Pair with hamangiu.content.news_items below.",
  tags: ["hamangiu", "news", "noutati", "header", "newsletter", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.header.news_header",
    name: "News Header",
    style: {
      backgroundColor: "#FFFFFF",
      paddingTop: 0, paddingBottom: 0,
      paddingLeft: 0, paddingRight: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_NEWS_HEADER_HTML,
  }),
};

export const hamangiuNewsItems: ModuleDefinition = {
  type: "hamangiu.content.news_items",
  category: "custom",
  name: "News with Items",
  description:
    "Full news section: book+envelope illustration → left-aligned bold heading → body paragraph → 2 news item rows (70×70 thumbnail + title + description + orange 'Vezi detalii' link). Can replace items with real article data.",
  tags: ["hamangiu", "news", "noutati", "items", "events", "newsletter", "custom"],
  create: () => ({
    id: uid("module"),
    type: "hamangiu.content.news_items",
    name: "News with Items",
    style: {
      backgroundColor: "#FFFFFF",
      paddingTop: 0, paddingBottom: 0,
      paddingLeft: 0, paddingRight: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: HAM_NEWS_ITEMS_HTML,
  }),
};

/**
 * All Hamangiu custom blocks — original examples + brand-design blocks.
 * Pass directly to the `modules` prop on <EmailBuilder>.
 *
 * Original examples (generic patterns):
 *   hamangiuCategoryNav, hamangiuBookFeature, hamangiuPromoBadge
 *
 * Brand-design blocks (based on actual Hamangiu email screenshots):
 *   hamangiuLogoBrowser, hamangiuProductSingleHero,
 *   hamangiuNewsHeader, hamangiuNewsItems
 */
export const hamangiuBlocks: ModuleDefinition[] = [
  // Brand-design blocks first (appear at top of Custom tab)
  hamangiuLogoBrowser,
  hamangiuProductSingleHero,
  hamangiuNewsHeader,
  hamangiuNewsItems,
  // Generic example blocks
  hamangiuCategoryNav,
  hamangiuBookFeature,
  hamangiuPromoBadge,
];
