/**
 * Campmor custom email blocks — full HTML fidelity + editableSlots.
 *
 * Structural / layout blocks (nav bars, masthead, gear grid) use htmlOverride
 * to preserve design fidelity. The important content blocks expose editable
 * slots so the user can change text, images and links without touching HTML.
 */
import { uid, type ModuleDefinition } from "@one-million-lines/email-builder";

const home = "https://www.campmor.com";
const ink = "#222222", yellow = "#FFD238", white = "#FFFFFF", paper = "#F6F5F1";
const font = "font-family:Arial,Helvetica,sans-serif;";
const table = (rows: string, color: string) =>
  `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${color}" style="width:100%;background-color:${color};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">${rows}</table>`;
const row = (content: string, padding: string, style = "") =>
  `<tr><td style="${font}padding:${padding};color:${ink};${style}">${content}</td></tr>`;
const link = (label: string, href: string, style: string) =>
  `<a href="${href}" style="${font}${style}">${label}</a>`;
const label11 = "font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;";

// ── Structural blocks (htmlOverride, minimal slots) ───────────────────────────

const SHIPPING_HTML = table(
  row(link("Shipping information", `${home}/pages/shipping-information`, "color:#FFFFFF;") +
    " &nbsp;&middot;&nbsp; " +
    link("Coupons &amp; offers", `${home}/pages/coupons-offers-and-rebates`, "color:#FFFFFF;"),
    "9px 12px", "text-align:center;font-size:12px;line-height:18px;color:#FFFFFF;"), ink);

const TRAILMAIL_HTML = table(
  row(table(`<tr><td style="${font}font-size:34px;line-height:38px;font-weight:900;letter-spacing:-2px;"><a data-slot="logo_link" href="${home}/" style="color:${ink};text-decoration:none;">Campmor</a></td><td align="right" style="${font}${label11}">TRAILMAIL<br><span style="font-weight:normal;letter-spacing:0;color:#555555;">Outdoor gear</span></td></tr>`, white), "18px 24px"), white);

const departments = [["Camp &amp; Hike", `${home}/collections/camp-hike`], ["Footwear", `${home}/collections/footwear`], ["Deals", `${home}/pages/campmor-deals`]];
const NAV_HTML = table(
  "<tr>" + departments.map(([n, p]) => `<td align="center" width="33%" style="padding:12px 3px;">${link(n, p, "color:#FFFFFF;font-size:14px;font-weight:bold;text-decoration:none;")}</td>`).join("") + "</tr>", ink);

const aisles: [string, string][] = [
  ["Backpacks", `${home}/collections/backpacks`],
  ["Tents", `${home}/collections/tents`],
  ["Sleeping gear", `${home}/collections/sleeping-bags-gear`],
  ["Footwear", `${home}/collections/footwear`],
];
const aisle = ([name, path]: [string, string], no: number) =>
  `<td width="50%" style="padding:15px 8px;border-top:1px solid #BDBBB2;">${link(`<span style="color:#66645B;font-size:11px;">0${no}</span>&nbsp; ${name}`, path, `color:${ink};font-size:15px;font-weight:bold;text-decoration:none;`)}</td>`;
const GEAR_HTML = table(
  row('<h2 style="margin:0;font-size:23px;line-height:28px;">Shop by category</h2>', "20px 24px 12px") +
  row(table("<tr>" + aisle(aisles[0], 1) + aisle(aisles[1], 2) + "</tr><tr>" + aisle(aisles[2], 3) + aisle(aisles[3], 4) + "</tr>", paper), "0 16px 8px"), paper);

// ── Content blocks (editable slots + original HTML design) ────────────────────

// Gift guide — hero image, eyebrow, headline, body, CTA link/label
const GIFT_GUIDE_IMG_DEFAULT = `${home}/cdn/shop/files/a_wide_cinematic_winter_landscape_banner_hero_sce_600x600%402x.png?v=1791480014`;
const GIFT_HTML = `\
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${white}" style="width:100%;background-color:${white};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  ${row(`<a data-slot="gift_cta_link" href="${home}/pages/gift-guide" style="${font}text-decoration:none;"><img data-slot="gift_image" src="${GIFT_GUIDE_IMG_DEFAULT}" width="600" alt="Snowy mountain cabin at sunset — Campmor holiday gift guide" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a>`, "0", "line-height:0;")}
  ${row('<span data-slot="gift_eyebrow" style="">THE CAMPMOR GIFT GUIDE</span>', "20px 24px 5px", label11)}
  ${row('<h1 style="margin:0;font-size:32px;line-height:37px;"><span data-slot="gift_headline">For the next adventure</span></h1>', "0 24px")}
  ${row('<span data-slot="gift_body">For the camper who packs the coffee first and the hiker who always takes the long way home.</span>', "8px 24px 16px", "font-size:16px;line-height:24px;")}
  ${row(`<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${yellow}" style="padding:13px 20px;"><a data-slot="gift_cta_link" href="${home}/pages/gift-guide" style="${font}color:${ink};font-weight:bold;font-size:15px;text-decoration:none;"><span data-slot="gift_cta_label">Explore the gift guide</span></a></td></tr></table>`, "0 24px 24px")}
</table>`;

// Editorial — editable eyebrow, headline, body, link/href
const INSIDER_HTML = `\
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${white}" style="width:100%;background-color:${white};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  ${row('<span data-slot="insider_eyebrow">FROM THE CAMPMOR INSIDER</span>', "24px 24px 7px", label11)}
  ${row('<h2 style="margin:0;font-size:25px;line-height:30px;"><span data-slot="insider_headline">A better-fitting backpack</span></h2>', "0 24px")}
  ${row('<span data-slot="insider_body">A pack should carry its share. See what happens at a Campmor fitting before you load up for your next trip.</span>', "8px 24px 12px", "font-size:16px;line-height:24px;")}
  ${row(`<a data-slot="insider_link" href="${home}/blogs/campmor-insider/get-the-right-fit-backpack-fittings-at-campmor" style="${font}color:${ink};font-weight:bold;font-size:15px;"><span data-slot="insider_link_label">Read the fitting guide &rarr;</span></a>`, "0 24px 24px")}
</table>`;

// Footer band — editable section label + contact info
const OUTFITTER_HTML = `\
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${ink}" style="width:100%;background-color:${ink};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  ${row('<span data-slot="outfitter_label">CAMPMOR &nbsp;/&nbsp; CUSTOMER SERVICE</span>', "18px 24px 6px", `${label11}color:${yellow};`)}
  ${row('<a href="tel:+18002267667" style="color:#FFFFFF;" data-slot="outfitter_phone">1-800-226-7667</a><br><a data-slot="outfitter_email" href="mailto:customerservice@campmor.com" style="color:#FFFFFF;">customerservice@campmor.com</a>', "0 24px 18px", "font-size:15px;line-height:24px;color:#FFFFFF;")}
</table>`;

// ── Exports ───────────────────────────────────────────────────────────────────

export const campmorBlocks: ModuleDefinition[] = [
  {
    type: "campmor.header.shipping", name: "Shipping and offers", category: "custom",
    description: "Storefront service strip. Static layout — links in source HTML.",
    tags: ["campmor", "header"],
    create: () => ({ id: uid("module"), type: "campmor.header.shipping", name: "Shipping and offers",
      style: { backgroundColor: ink, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: SHIPPING_HTML }),
  },
  {
    type: "campmor.header.trailmail", name: "TrailMail masthead", category: "custom",
    description: "Campmor wordmark + edition label. Logo link is editable.",
    tags: ["campmor", "header"],
    create: () => ({ id: uid("module"), type: "campmor.header.trailmail", name: "TrailMail masthead",
      style: { backgroundColor: white, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: TRAILMAIL_HTML,
      editableSlots: {
        logo_link: { type: "href", value: `${home}/`, label: "Logo link URL" },
      },
    }),
  },
  {
    type: "campmor.nav.departments", name: "Department bar", category: "custom",
    description: "Three-column dark nav bar. Static — edit links in source HTML.",
    tags: ["campmor", "nav"],
    create: () => ({ id: uid("module"), type: "campmor.nav.departments", name: "Department bar",
      style: { backgroundColor: ink, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: NAV_HTML }),
  },
  {
    type: "campmor.promo.gift_guide", name: "Gift guide spotlight", category: "custom",
    description: "Hero image + eyebrow + headline + body + CTA. All text, image and links are editable.",
    tags: ["campmor", "promo"],
    create: () => ({ id: uid("module"), type: "campmor.promo.gift_guide", name: "Gift guide spotlight",
      style: { backgroundColor: white, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: GIFT_HTML,
      editableSlots: {
        gift_image:     { type: "image", value: GIFT_GUIDE_IMG_DEFAULT, alt: "Campmor holiday gift guide", label: "Hero image" },
        gift_eyebrow:   { type: "text", value: "THE CAMPMOR GIFT GUIDE", label: "Eyebrow label" },
        gift_headline:  { type: "text", value: "For the next adventure", label: "Headline" },
        gift_body:      { type: "text", value: "For the camper who packs the coffee first and the hiker who always takes the long way home.", label: "Body text" },
        gift_cta_label: { type: "text", value: "Explore the gift guide", label: "CTA label" },
        gift_cta_link:  { type: "href", value: `${home}/pages/gift-guide`, label: "CTA link URL" },
      },
    }),
  },
  {
    type: "campmor.nav.gear_index", name: "Gear department index", category: "custom",
    description: "Numbered two-column department directory. Static — edit links in source HTML.",
    tags: ["campmor", "nav"],
    create: () => ({ id: uid("module"), type: "campmor.nav.gear_index", name: "Gear department index",
      style: { backgroundColor: paper, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: GEAR_HTML }),
  },
  {
    type: "campmor.editorial.insider", name: "Campmor Insider", category: "custom",
    description: "Editorial story block. Eyebrow, headline, body, link label and link URL are all editable.",
    tags: ["campmor", "editorial"],
    create: () => ({ id: uid("module"), type: "campmor.editorial.insider", name: "Campmor Insider",
      style: { backgroundColor: white, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: INSIDER_HTML,
      editableSlots: {
        insider_eyebrow:    { type: "text", value: "FROM THE CAMPMOR INSIDER", label: "Eyebrow" },
        insider_headline:   { type: "text", value: "A better-fitting backpack", label: "Headline" },
        insider_body:       { type: "text", value: "A pack should carry its share. See what happens at a Campmor fitting before you load up for your next trip.", label: "Body text" },
        insider_link_label: { type: "text", value: "Read the fitting guide \u2192", label: "Link label" },
        insider_link:       { type: "href", value: `${home}/blogs/campmor-insider/get-the-right-fit-backpack-fittings-at-campmor`, label: "Article link URL" },
      },
    }),
  },
  {
    type: "campmor.footer.outfitter", name: "Outfitter contact band", category: "custom",
    description: "Dark customer service footer. Section label, phone and email are all editable.",
    tags: ["campmor", "footer"],
    create: () => ({ id: uid("module"), type: "campmor.footer.outfitter", name: "Outfitter contact band",
      style: { backgroundColor: ink, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, mobile: { paddingLeft: 0, paddingRight: 0 } },
      children: [], htmlOverride: OUTFITTER_HTML,
      editableSlots: {
        outfitter_label: { type: "text", value: "CAMPMOR \u00a0/\u00a0 CUSTOMER SERVICE", label: "Section label" },
        outfitter_phone: { type: "href", value: "tel:+18002267667", label: "Phone href (tel:…)" },
        outfitter_email: { type: "href", value: "mailto:customerservice@campmor.com", label: "Email href (mailto:…)" },
      },
    }),
  },
];
