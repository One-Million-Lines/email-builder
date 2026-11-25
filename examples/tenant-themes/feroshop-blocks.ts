/**
 * Feroshop custom email blocks.
 *
 * Three tenant-specific modules for the Feroshop B2B hardware brand:
 *
 *  1. feroshopPromoStrip  — Dark ({colors.primary}) promotional banner with the
 *                           "Comanzi 250. Platesti 225." style headline in
 *                           white + orange, plus an outlined CTA button.
 *
 *  2. feroshopDealBadge   — "7+1 GRATIS" block: orange badge panel (left) +
 *                           deal description + CTA (right). Styled for
 *                           Feroshop's promotional campaign emails.
 *
 *  3. feroshopB2BFeatures — Three-column icon+title+description row for
 *                           B2B selling points (Produse verificate · Livrare
 *                           rapida · Suport tehnic).
 *
 * All three use `htmlOverride` for full rendering fidelity.
 *
 * Usage (host app):
 *
 *   import { feroshopBlocks } from "./feroshop-blocks";
 *   import { feroshopTheme } from "./feroshop-theme";
 *
 *   <EmailBuilder
 *     modules={feroshopBlocks}
 *     themes={[feroshopTheme, ...defaultThemes]}
 *   />
 */

import type { ModuleDefinition } from "@one-million-lines/email-builder";
import { uid } from "@one-million-lines/email-builder";

// ─── HTML templates ───────────────────────────────────────────────────────────

const FERO_PROMO_STRIP_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{colors.primary};">
  <tr>
    <td style="padding:20px 24px 16px;">
      <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#9CA3AF;letter-spacing:2px;text-transform:uppercase;">CAMPANIE · OFERTA LIMITATA</p>
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:{colors.surface};line-height:1.2;">Comanzi 250. <span style="color:{colors.buttonBackground};">Platesti 225.</span></p>
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9CA3AF;line-height:1.5;">Balamale CLIP top BLUMOTION 110&deg; &middot; economie 10%</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border:2px solid {colors.surface};border-radius:6px;">
            <a href="#" style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:{colors.surface};text-decoration:none;white-space:nowrap;">Alege pachetul &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const FERO_DEAL_BADGE_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{colors.background};">
  <tr>
    <td style="padding:16px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="28%" align="center" bgcolor="{colors.buttonBackground}" style="border-radius:8px 0 0 8px;padding:20px 12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:38px;font-weight:bold;color:{colors.surface};line-height:1;">7+1</p>
            <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:{colors.surface};letter-spacing:1px;">GRATIS</p>
          </td>
          <td width="72%" bgcolor="{colors.surface}" style="border-radius:0 8px 8px 0;padding:16px 20px;vertical-align:middle;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:{colors.text};">Platesti doar 7, primesti 8!</p>
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{colors.muted};line-height:1.5;">Adaugi 8 pachete eligibile in cos si unul este gratuit. Oferta valabila pana la epuizarea stocurilor.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="{colors.buttonBackground}" style="border-radius:6px;">
                  <a href="#" style="display:inline-block;padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:{colors.surface};text-decoration:none;">Comanda acum</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

const FERO_B2B_FEATURES_HTML = `\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{colors.surface};">
  <tr>
    <td align="center" style="padding:24px 24px 4px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:{colors.muted};letter-spacing:2px;text-transform:uppercase;">DE CE FEROSHOP?</p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 16px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">&nbsp;&#x1F527;&nbsp;</p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:{colors.text};">Produse verificate</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{colors.muted};line-height:1.5;">Calitate garantata de la producatori de top.</p>
          </td>
          <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
            <p style="margin:0 0 8px;font-size:28px;">&nbsp;&#x1F680;&nbsp;</p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:{colors.text};">Livrare rapida</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{colors.muted};line-height:1.5;">Expediere in 24&ndash;48h din stoc propriu.</p>
          </td>
          <td width="33%" style="padding:12px 8px;vertical-align:top;text-align:center;">
            <p style="margin:0 0 8px;font-size:28px;">&nbsp;&#x1F4DE;&nbsp;</p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:{colors.text};">Suport tehnic</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{colors.muted};line-height:1.5;">Echipa de specialisti la dispozitia ta.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

// ─── Module definitions ───────────────────────────────────────────────────────

export const feroshopPromoStrip: ModuleDefinition = {
  type: "feroshop.header.promo_strip",
  category: "custom",
  name: "Promo Strip",
  description:
    "Dark ({colors.primary}) promotional banner with discount headline in white + Feroshop orange, outlined CTA button. Matches site's black campaign banner style.",
  tags: ["feroshop", "promo", "announcement", "dark", "campaign", "custom"],
  create: () => ({
    id: uid("module"),
    type: "feroshop.header.promo_strip",
    name: "Promo Strip",
    style: {
      backgroundColor: "{colors.primary}",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: FERO_PROMO_STRIP_HTML,
  }),
};

export const feroshopDealBadge: ModuleDefinition = {
  type: "feroshop.promo.deal_badge",
  category: "custom",
  name: "Deal Badge",
  description:
    "7+1 GRATIS promotional block: large orange badge (left) + deal title, description and CTA (right). Used for bundle/campaign promotions.",
  tags: ["feroshop", "deal", "badge", "7+1", "gratis", "promo", "custom"],
  create: () => ({
    id: uid("module"),
    type: "feroshop.promo.deal_badge",
    name: "Deal Badge",
    style: {
      backgroundColor: "{colors.background}",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: FERO_DEAL_BADGE_HTML,
  }),
};

export const feroshopB2BFeatures: ModuleDefinition = {
  type: "feroshop.content.b2b_features",
  category: "custom",
  name: "B2B Features",
  description:
    "Three-column trust block: Produse verificate · Livrare rapida · Suport tehnic. Used in B2B campaign emails to reinforce buying confidence.",
  tags: ["feroshop", "b2b", "features", "trust", "three-column", "custom"],
  create: () => ({
    id: uid("module"),
    type: "feroshop.content.b2b_features",
    name: "B2B Features",
    style: {
      backgroundColor: "{colors.surface}",
      paddingTop:    0,
      paddingBottom: 0,
      mobile: { paddingLeft: 0, paddingRight: 0 },
    },
    children: [],
    htmlOverride: FERO_B2B_FEATURES_HTML,
  }),
};

/** All Feroshop custom blocks as an array — pass directly to the `modules` prop. */
export const feroshopBlocks: ModuleDefinition[] = [
  feroshopPromoStrip,
  feroshopDealBadge,
  feroshopB2BFeatures,
];
