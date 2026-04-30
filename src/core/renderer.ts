// Table-based HTML email renderer. Inline CSS, ESP-friendly.
// Responsive via @media (max-width:600px) class overrides + Outlook (MSO) fallbacks.
import type {
  EmailDocument,
  EmailModule,
  EmailElement,
  TextElement,
  ImageElement,
  ButtonElement,
  SpacerElement,
  DividerElement,
  ProductGridElement,
  Product,
  Theme,
} from "./types";
import { resolveStyle, resolveToken } from "./theme";
import { escapeHtml, safeUrl } from "./utils";

function px(n: number | undefined, fallback = 0): string {
  return `${n ?? fallback}px`;
}

function styleString(style: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${k}:${v}`);
  }
  return parts.join(";");
}

function mobileCssBlock(mobileStyle: Record<string, unknown>, theme: Theme): string {
  const resolved = resolveStyle(mobileStyle, theme);
  const map: Record<string, string> = {};
  const set = (cssKey: string, val: unknown, suffix = "") => {
    if (val === undefined || val === null || val === "") return;
    map[cssKey] = `${val}${suffix} !important`;
  };
  set("font-family", resolved.fontFamily);
  if (resolved.fontSize !== undefined) set("font-size", resolved.fontSize, "px");
  set("line-height", resolved.lineHeight);
  if (resolved.letterSpacing !== undefined) set("letter-spacing", resolved.letterSpacing, "px");
  set("font-weight", resolved.fontWeight);
  set("color", resolved.color);
  set("text-align", resolved.align);
  set("background-color", resolved.backgroundColor);
  if (resolved.paddingTop !== undefined) set("padding-top", resolved.paddingTop, "px");
  if (resolved.paddingBottom !== undefined) set("padding-bottom", resolved.paddingBottom, "px");
  if (resolved.paddingLeft !== undefined) set("padding-left", resolved.paddingLeft, "px");
  if (resolved.paddingRight !== undefined) set("padding-right", resolved.paddingRight, "px");
  if (resolved.borderRadius !== undefined) set("border-radius", resolved.borderRadius, "px");
  if (resolved.width !== undefined) set("width", resolved.width, "px");
  if (resolved.height !== undefined) set("height", resolved.height, "px");
  return Object.entries(map)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

interface RenderCtx {
  theme: Theme;
  mobileRules: string[];
  classCounter: { n: number };
}

function nextClass(ctx: RenderCtx): string {
  ctx.classCounter.n += 1;
  return `r${ctx.classCounter.n}`;
}

function collectMobile(
  ctx: RenderCtx,
  style: Record<string, unknown> | undefined
): string | null {
  const mobile = style?.mobile as Record<string, unknown> | undefined;
  const hideOn = style?.hideOn as "mobile" | "desktop" | undefined;
  if (!mobile && !hideOn) return null;
  const cls = nextClass(ctx);
  if (mobile && Object.keys(mobile).length > 0) {
    const css = mobileCssBlock(mobile, ctx.theme);
    if (css) {
      ctx.mobileRules.push(`@media only screen and (max-width:600px){.${cls}{${css}}}`);
      if (mobile.width !== undefined) {
        ctx.mobileRules.push(
          `@media only screen and (max-width:600px){.${cls} img{max-width:${mobile.width}px !important;width:100% !important;height:auto !important;}}`
        );
      }
    }
  }
  if (hideOn === "mobile") {
    ctx.mobileRules.push(
      `@media only screen and (max-width:600px){.${cls}{display:none !important;mso-hide:all;max-height:0;overflow:hidden;}}`
    );
  }
  if (hideOn === "desktop") {
    ctx.mobileRules.push(
      `@media only screen and (min-width:601px){.${cls}{display:none !important;}}`
    );
  }
  return cls;
}

function renderText(el: TextElement, ctx: RenderCtx): string {
  const s = resolveStyle((el.style ?? {}) as Record<string, unknown>, ctx.theme);
  const css = styleString({
    "font-family": s.fontFamily ?? "Arial, Helvetica, sans-serif",
    "font-size": s.fontSize ? `${s.fontSize}px` : "16px",
    "line-height": s.lineHeight ?? 1.5,
    "letter-spacing": s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    "font-weight": s.fontWeight ?? "normal",
    color: s.color ?? "#111827",
    "text-align": s.align ?? "left",
    "padding-top": px(s.paddingTop as number, 8),
    "padding-bottom": px(s.paddingBottom as number, 8),
    "padding-left": px(s.paddingLeft as number, 16),
    "padding-right": px(s.paddingRight as number, 16),
    "mso-line-height-rule": "exactly",
    "-webkit-text-size-adjust": "100%",
    "-ms-text-size-adjust": "100%",
    margin: 0,
  });
  const link = s.link as string | undefined;
  const inner = link
    ? `<a href="${safeUrl(link)}" style="color:inherit;text-decoration:underline">${el.content}</a>`
    : el.content;
  const cls = collectMobile(ctx, el.style as Record<string, unknown>);
  return `<div${cls ? ` class="${cls}"` : ""} style="${css}">${inner}</div>`;
}

function renderImage(el: ImageElement, ctx: RenderCtx): string {
  const s = resolveStyle((el.style ?? {}) as Record<string, unknown>, ctx.theme);
  const wrapCss = styleString({
    "text-align": s.align ?? "center",
    "padding-top": px(s.paddingTop as number, 0),
    "padding-bottom": px(s.paddingBottom as number, 0),
    "padding-left": px(s.paddingLeft as number, 0),
    "padding-right": px(s.paddingRight as number, 0),
    "font-size": "0",
    "line-height": "0",
  });
  const imgCss = styleString({
    display: "block",
    "max-width": "100%",
    width: s.width ? `${s.width}px` : "100%",
    height: s.height ? `${s.height}px` : "auto",
    "border-radius": s.borderRadius ? `${s.borderRadius}px` : undefined,
    border: 0,
    outline: "none",
    "text-decoration": "none",
    "-ms-interpolation-mode": "bicubic",
    margin: s.align === "center" || !s.align ? "0 auto" : undefined,
  });
  const widthAttr = s.width ? ` width="${s.width}"` : "";
  const img = `<img src="${escapeHtml(el.src)}" alt="${escapeHtml(el.alt ?? "")}"${widthAttr} style="${imgCss}" />`;
  const wrapped = el.link ? `<a href="${safeUrl(el.link)}">${img}</a>` : img;
  const cls = collectMobile(ctx, el.style as Record<string, unknown>);
  return `<div${cls ? ` class="${cls}"` : ""} style="${wrapCss}">${wrapped}</div>`;
}

function renderButton(el: ButtonElement, ctx: RenderCtx): string {
  const s = resolveStyle((el.style ?? {}) as Record<string, unknown>, ctx.theme);
  const align = (s.align as string) ?? "center";
  const wrapCss = styleString({
    "text-align": align,
    "padding-top": px(s.paddingTop as number, 12),
    "padding-bottom": px(s.paddingBottom as number, 12),
    "padding-left": px(s.paddingLeft as number, 16),
    "padding-right": px(s.paddingRight as number, 16),
  });
  const bg = (s.backgroundColor as string) ?? "#3A7D52";
  const color = (s.color as string) ?? "#FFFFFF";
  const radius = (s.borderRadius as number) ?? 6;
  const fontSize = (s.fontSize as number) ?? 16;
  const fontFamily = (s.fontFamily as string) ?? "Arial, Helvetica, sans-serif";
  const fontWeight = (s.fontWeight as string) ?? "bold";

  const btnCss = styleString({
    display: "inline-block",
    "background-color": bg,
    color,
    "font-family": fontFamily,
    "font-size": `${fontSize}px`,
    "font-weight": fontWeight,
    "text-decoration": "none",
    "border-radius": `${radius}px`,
    padding: "14px 28px",
    "mso-padding-alt": "0",
    "line-height": "100%",
    "-webkit-text-size-adjust": "none",
  });
  const label = escapeHtml(el.label);
  const href = safeUrl(el.link);
  const arcsize = Math.min(50, Math.round((radius / 22) * 100));
  const vml = `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="${arcsize}%" stroke="f" fillcolor="${bg}">
<w:anchorlock/>
<center style="color:${color};font-family:${fontFamily};font-size:${fontSize}px;font-weight:${fontWeight};">${label}</center>
</v:roundrect>
<![endif]-->`;
  const html = `<!--[if !mso]><!-- --><a href="${href}" style="${btnCss}">${label}</a><!--<![endif]-->`;
  const cls = collectMobile(ctx, el.style as Record<string, unknown>);
  return `<div${cls ? ` class="${cls}"` : ""} style="${wrapCss}">${vml}${html}</div>`;
}

function renderSpacer(el: SpacerElement): string {
  return `<div style="height:${el.height}px;line-height:${el.height}px;font-size:1px;mso-line-height-rule:exactly;">&nbsp;</div>`;
}

function renderDivider(el: DividerElement, ctx: RenderCtx): string {
  const s = resolveStyle((el.style ?? {}) as Record<string, unknown>, ctx.theme);
  const padTop = px(s.paddingTop as number, 8);
  const padBot = px(s.paddingBottom as number, 8);
  const color = (s.color as string) ?? "#E5E7EB";
  const thickness = (s.thickness as number) ?? 1;
  return `<div style="padding-top:${padTop};padding-bottom:${padBot};"><hr style="border:0;border-top:${thickness}px solid ${color};margin:0;height:0;" /></div>`;
}

function renderElement(el: EmailElement, ctx: RenderCtx): string {
  switch (el.type) {
    case "text":
      return renderText(el, ctx);
    case "image":
      return renderImage(el, ctx);
    case "button":
      return renderButton(el, ctx);
    case "spacer":
      return renderSpacer(el);
    case "divider":
      return renderDivider(el, ctx);
    case "productGrid":
      return renderProductGrid(el, ctx);
  }
}

function renderProductGrid(el: ProductGridElement, ctx: RenderCtx): string {
  const s = resolveStyle((el.style ?? {}) as Record<string, unknown>, ctx.theme);
  const cols = el.columns;
  const products = el.products.slice(0, cols * 6); // sane upper bound
  const cardBg =
    (s.cardBackgroundColor as string) ?? (s.backgroundColor as string) ?? "transparent";
  const nameColor = (s.nameColor as string) ?? "{colors.text}";
  const finalColor = (s.finalPriceColor as string) ?? "{colors.primary}";
  const oldColor = (s.oldPriceColor as string) ?? "#9CA3AF";
  const btnBg = (s.buttonBackgroundColor as string) ?? "{colors.buttonBackground}";
  const btnColor = (s.buttonColor as string) ?? "{colors.buttonText}";
  const radius = (s.borderRadius as number) ?? 0;
  const padTop = px(s.paddingTop as number, 16);
  const padBot = px(s.paddingBottom as number, 16);
  const padL = px(s.paddingLeft as number, 16);
  const padR = px(s.paddingRight as number, 16);

  const colWidthPct = `${Math.floor(100 / cols)}%`;

  // Build product card HTML.
  const card = (p: Product, last: boolean): string => {
    const finalPrice = `<span class="final_price" style="color:${resolveTokenSafe(finalColor, ctx.theme)};font-weight:bold;font-size:18px;">${escapeHtml(
      p.finalPrice
    )}</span>`;
    const oldPrice = el.showOldPrice && p.oldPrice
      ? `<span class="old_price" style="color:${resolveTokenSafe(oldColor, ctx.theme)};text-decoration:line-through;font-size:14px;margin-right:8px;">${escapeHtml(
          p.oldPrice
        )}</span>`
      : "";
    const desc = el.showDescription && p.description
      ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#6B7280;padding:0 0 12px 0;">${escapeHtml(p.description)}</div>`
      : "";
    const btnLabel = p.buttonLabel ?? el.buttonLabel ?? "Shop now";
    const link = p.link ?? "#";
    const btn = el.showButton
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td align="center" bgcolor="${resolveTokenSafe(
          btnBg,
          ctx.theme
        )}" style="border-radius:6px;"><!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeUrl(link)}" style="height:36px;v-text-anchor:middle;width:140px;" arcsize="15%" stroke="f" fillcolor="${resolveTokenSafe(btnBg, ctx.theme)}"><w:anchorlock/><center style="color:${resolveTokenSafe(btnColor, ctx.theme)};font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">${escapeHtml(btnLabel)}</center></v:roundrect>
<![endif]--><!--[if !mso]><!-- --><a href="${safeUrl(link)}" style="display:inline-block;padding:10px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:${resolveTokenSafe(btnColor, ctx.theme)};background-color:${resolveTokenSafe(btnBg, ctx.theme)};border-radius:6px;text-decoration:none;">${escapeHtml(btnLabel)}</a><!--<![endif]--></td></tr></table>`
      : "";
    const img = `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.imageAlt ?? p.name)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;border-radius:${radius}px;" />`;
    const imgWrapped = p.link
      ? `<a href="${safeUrl(p.link)}" style="text-decoration:none;color:inherit;">${img}</a>`
      : img;

    // Each cell: stack on mobile via class. Vertical-align top.
    return `<td class="stack" valign="top" style="padding:0 ${last ? 0 : 8}px 16px ${last ? 0 : 0}px;width:${colWidthPct};vertical-align:top;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${resolveTokenSafe(cardBg, ctx.theme)};border-radius:${radius}px;">
    <tr><td style="padding:0;font-size:0;line-height:0;">${imgWrapped}</td></tr>
    <tr><td style="padding:12px 12px 4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${resolveTokenSafe(nameColor, ctx.theme)};line-height:1.3;">${escapeHtml(p.name)}</td></tr>
    <tr><td style="padding:0 12px 8px 12px;font-family:Arial,Helvetica,sans-serif;">${oldPrice}${finalPrice}</td></tr>
    ${desc ? `<tr><td style="padding:0 12px 4px 12px;">${desc}</td></tr>` : ""}
    ${btn ? `<tr><td align="center" style="padding:4px 12px 12px 12px;">${btn}</td></tr>` : ""}
  </table>
</td>`;
  };

  // Group products into rows of `cols`.
  const rows: string[] = [];
  for (let i = 0; i < products.length; i += cols) {
    const slice = products.slice(i, i + cols);
    const tds = slice
      .map((p, idx) => card(p, idx === slice.length - 1))
      .join("\n");
    // Pad with empty cells if last row is short to keep widths even on desktop.
    const pads = cols - slice.length;
    let padTds = "";
    for (let j = 0; j < pads; j++) {
      padTds += `<td class="stack" style="width:${colWidthPct};">&nbsp;</td>`;
    }
    rows.push(`<tr>${tds}${padTds}</tr>`);
  }

  // Mobile: each .stack td becomes block, full-width.
  const cls = collectMobile(ctx, el.style as Record<string, unknown>);
  return `<div${cls ? ` class="${cls}"` : ""} style="padding:${padTop} ${padR} ${padBot} ${padL};">
<!--[if mso | IE]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;">
${rows.join("\n")}
</table>
<!--[if mso | IE]></td></tr></table><![endif]-->
</div>`;
}

function resolveTokenSafe(value: string | undefined, theme: Theme): string {
  if (!value) return "";
  const r = resolveToken(value, theme);
  return typeof r === "string" ? r : String(r);
}

function renderModule(m: EmailModule, ctx: RenderCtx): string {
  const s = resolveStyle((m.style ?? {}) as Record<string, unknown>, ctx.theme);
  const css = styleString({
    "background-color": s.backgroundColor,
    "padding-top": px(s.paddingTop as number, 0),
    "padding-bottom": px(s.paddingBottom as number, 0),
    "padding-left": px(s.paddingLeft as number, 0),
    "padding-right": px(s.paddingRight as number, 0),
    "border-radius": s.borderRadius ? `${s.borderRadius}px` : undefined,
  });
  const inner = m.children.map((c) => renderElement(c, ctx)).join("\n");
  const cls = collectMobile(ctx, m.style as Record<string, unknown>);
  return `<tr><td${cls ? ` class="${cls}"` : ""} style="${css}">${inner}</td></tr>`;
}

export function renderEmailHtml(doc: EmailDocument): string {
  const bg = resolveToken(doc.settings.backgroundColor, doc.theme) as string;
  const cbg = resolveToken(doc.settings.contentBackgroundColor, doc.theme) as string;
  const width = doc.settings.width;
  const ctx: RenderCtx = { theme: doc.theme, mobileRules: [], classCounter: { n: 0 } };
  const body = doc.modules.map((m) => renderModule(m, ctx)).join("\n");
  const previewText = escapeHtml(doc.meta.previewText ?? "");
  const mobileCss = ctx.mobileRules.join("\n");

  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(doc.meta.name)}</title>
<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>
  html,body{margin:0 !important;padding:0 !important;height:100% !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt !important;mso-table-rspace:0pt !important;border-collapse:collapse;}
  table{border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important;}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}
  a{text-decoration:none;}
  a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important;}
  u + #body a{color:inherit;text-decoration:none;}
  #MessageViewBody a{color:inherit;text-decoration:none;}
  @media only screen and (max-width:600px){
    .email-container{width:100% !important;max-width:100% !important;}
    .email-content{width:100% !important;max-width:100% !important;}
    .stack{display:block !important;width:100% !important;max-width:100% !important;box-sizing:border-box;padding:0 0 16px 0 !important;}
    .center-on-mobile{text-align:center !important;}
    .full-on-mobile{width:100% !important;height:auto !important;max-width:100% !important;}
  }
  /* Price classes — override these to restyle prices project-wide. */
  .final_price{font-weight:bold;}
  .old_price{text-decoration:line-through;color:#9CA3AF;margin-right:8px;}
${mobileCss}
</style>
</head>
<body id="body" style="margin:0;padding:0;background-color:${bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${previewText}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};">
  <tr><td align="center" style="padding:0;">
    <!--[if mso | IE]><table role="presentation" width="${width}" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
    <table role="presentation" class="email-container" width="${width}" cellpadding="0" cellspacing="0" border="0" style="width:${width}px;max-width:${width}px;background-color:${cbg};margin:0 auto;">
${body}
    </table>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </td></tr>
</table>
</body>
</html>`;
}
