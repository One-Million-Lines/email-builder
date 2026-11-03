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
