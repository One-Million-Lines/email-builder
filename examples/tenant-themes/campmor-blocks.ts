import { uid, type ModuleDefinition } from "@one-million-lines/email-builder";

const home = "https://www.campmor.com";
const ink = "#222222", yellow = "#FFD238", white = "#FFFFFF", paper = "#F6F5F1";
const font = "font-family:Arial,Helvetica,sans-serif;";
const table = (rows: string, color: string) =>
  `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="${color}" style="width:100%;background-color:${color};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">${rows}</table>`;
const row = (content: string, padding: string, style = "") =>
  `<tr><td style="${font}padding:${padding};color:${ink};${style}">${content}</td></tr>`;
const link = (label: string, path: string, style: string) =>
  `<a href="${home}${path}" style="${font}${style}">${label}</a>`;
const label = "font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;";
const cta = (title: string, path: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${yellow}" style="padding:13px 20px;">${link(title,path,`color:${ink};font-weight:bold;font-size:15px;text-decoration:none;`)}</td></tr></table>`;
const guide = "/pages/gift-guide";
const hero = "/cdn/shop/files/a_wide_cinematic_winter_landscape_banner_hero_sce_600x600%402x.png?v=1791480014";

function block(type: string, name: string, description: string, color: string, rows: string): ModuleDefinition {
  const key = "campmor." + type;
  return { type: key, name, description, category: "custom", tags: ["campmor", type.split(".")[0]],
    create: () => ({ id: uid("module"), type: key, name, children: [],
      style: { backgroundColor: color, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
        mobile: { paddingLeft: 0, paddingRight: 0 } }, htmlOverride: table(rows, color) }) };
}

const departments = [["Camp &amp; Hike","/collections/camp-hike"],["Footwear","/collections/footwear"],["Deals","/pages/campmor-deals"]];
const aisles = [["Backpacks","/collections/backpacks"],["Tents","/collections/tents"],["Sleeping gear","/collections/sleeping-bags-gear"],["Footwear","/collections/footwear"]];
const aisle = ([name,path]: string[], no: number) =>
  `<td width="50%" style="padding:15px 8px;border-top:1px solid #BDBBB2;">${link(`<span style="color:#66645B;font-size:11px;">0${no}</span>&nbsp; ${name}`,path,`color:${ink};font-size:15px;line-height:21px;font-weight:bold;text-decoration:none;`)}</td>`;

export const campmorBlocks: ModuleDefinition[] = [
  block("header.shipping","Shipping and offers","Storefront service strip with shipping terms and coupons.",ink,
    row(link("Shipping information","/pages/shipping-information","color:#FFFFFF;") + " &nbsp;&middot;&nbsp; " + link("Coupons &amp; offers","/pages/coupons-offers-and-rebates","color:#FFFFFF;"),"9px 12px","text-align:center;font-size:12px;line-height:18px;color:#FFFFFF;")),
  block("header.trailmail","TrailMail masthead","Campmor signature with the TrailMail edition label.",white,
    row(table(`<tr><td>${link("Campmor","/","font-size:34px;line-height:38px;font-weight:900;letter-spacing:-2px;color:#222222;text-decoration:none;")}</td><td align="right" style="${font}${label}">TRAILMAIL<br><span style="font-weight:normal;letter-spacing:0;color:#555555;">Outdoor gear</span></td></tr>`,white),"18px 24px")),
  block("nav.departments","Department bar","Three storefront shortcuts sized for narrow inboxes.",ink,
    "<tr>" + departments.map(([n,p])=>`<td align="center" width="33%" style="padding:12px 3px;">${link(n,p,"color:#FFFFFF;font-size:14px;font-weight:bold;text-decoration:none;")}</td>`).join("") + "</tr>"),
  block("promo.gift_guide","Gift guide spotlight","Seasonal Campmor banner with a live-text invitation and button.",white,
    row(link(`<img src="${home}${hero}" width="600" alt="Snowy mountain cabin at sunset &mdash; Campmor holiday gift guide" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`,guide,"text-decoration:none;"),"0","line-height:0;") +
    row("THE CAMPMOR GIFT GUIDE","20px 24px 5px",label) +
    row('<h1 style="margin:0;font-size:32px;line-height:37px;">For the next adventure</h1>',"0 24px") +
    row("For the camper who packs the coffee first and the hiker who always takes the long way home.","8px 24px 16px","font-size:16px;line-height:24px;") +
    row(cta("Explore the gift guide",guide),"0 24px 24px")),
  block("nav.gear_index","Gear department index","Numbered two-column directory of Campmor gear departments.",paper,
    row('<h2 style="margin:0;font-size:23px;line-height:28px;">Shop by category</h2>',"20px 24px 12px") +
    row(table("<tr>"+aisle(aisles[0],1)+aisle(aisles[1],2)+"</tr><tr>"+aisle(aisles[2],3)+aisle(aisles[3],4)+"</tr>",paper),"0 16px 8px")),
  block("editorial.insider","Campmor Insider","A field-note feature linking to the store’s backpack fitting story.",white,
    row("FROM THE CAMPMOR INSIDER","24px 24px 7px",label) +
    row('<h2 style="margin:0;font-size:25px;line-height:30px;">A better-fitting backpack</h2>',"0 24px") +
    row("A pack should carry its share. See what happens at a Campmor fitting before you load up for your next trip.","8px 24px 12px","font-size:16px;line-height:24px;") +
    row(link("Read the fitting guide &rarr;","/blogs/campmor-insider/get-the-right-fit-backpack-fittings-at-campmor","color:#222222;font-weight:bold;font-size:15px;"),"0 24px 24px")),
  block("footer.outfitter","Outfitter contact band","Direct phone and email links for the Campmor team.",ink,
    row("CAMPMOR &nbsp;/&nbsp; CUSTOMER SERVICE","18px 24px 6px",label+"color:#FFD238;") +
    row('<a href="tel:+18002267667" style="color:#FFFFFF;">1-800-226-7667</a><br><a href="mailto:customerservice@campmor.com" style="color:#FFFFFF;">customerservice@campmor.com</a>',"0 24px 18px","font-size:15px;line-height:24px;"))
];
