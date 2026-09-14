import type { EmailDocument, Theme } from "../core/types";
import { SPECIAL_LINK_PLACEHOLDERS } from "../core/types";
import {
  button,
  footerLinks,
  heading,
  mod,
  muted,
  product,
  productGrid,
  shopInfoText,
  text,
} from "../modules/helpers";
import { templateRegistry, type TemplateDefinition } from "./registry";

const laborDayTheme: Theme = {
  id: "labor-day",
  name: "Labor Day",
  tokens: {
    colors: {
      background: "#EDE8DA",
      surface: "#FFFFFF",
      primary: "#1C1C1C",
      text: "#1C1C1C",
      muted: "#6B6B6B",
      buttonBackground: "#1C1C1C",
      buttonText: "#FFFFFF",
      accent: "#B5643F",
      border: "#D8D1C2",
    },
    fonts: {
      heading: "Georgia, serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 8, md: 50, lg: 50 },
  },
};

const galleryHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;">
  <tr>
    <td width="50%" style="padding:0 6px 12px 0;">
      <img src="https://placehold.co/264x180?text=Family+Cookout" alt="Family cookout" style="display:block;width:100%;height:auto;border-radius:18px;" />
    </td>
    <td width="50%" style="padding:0 0 12px 6px;">
      <img src="https://placehold.co/264x180?text=Weekend+Escape" alt="Weekend escape" style="display:block;width:100%;height:auto;border-radius:18px;" />
    </td>
  </tr>
  <tr>
    <td width="50%" style="padding:0 6px 0 0;">
      <img src="https://placehold.co/264x180?text=Holiday+Table" alt="Holiday table" style="display:block;width:100%;height:auto;border-radius:18px;" />
    </td>
    <td width="50%" style="padding:0 0 0 6px;">
      <img src="https://placehold.co/264x180?text=Patriotic+Style" alt="Patriotic style" style="display:block;width:100%;height:auto;border-radius:18px;" />
    </td>
  </tr>
</table>`;

const footerNavHtml = `
<a class="vtw-url" href="${SPECIAL_LINK_PLACEHOLDERS.shop_url}" data-link-type="shop_url" style="color:${laborDayTheme.tokens.colors.muted};text-decoration:none;">Shop</a>
&nbsp;|&nbsp;
<a href="#" style="color:${laborDayTheme.tokens.colors.muted};text-decoration:none;">Gift Cards</a>
&nbsp;|&nbsp;
<a href="#" style="color:${laborDayTheme.tokens.colors.muted};text-decoration:none;">Blog</a>
&nbsp;|&nbsp;
<a href="#" style="color:${laborDayTheme.tokens.colors.muted};text-decoration:none;">The Science</a>
&nbsp;|&nbsp;
<a href="#" style="color:${laborDayTheme.tokens.colors.muted};text-decoration:none;">Contact Us</a>`;

export const laborDay: TemplateDefinition = {
  id: "labor-day",
  name: "Labor Day Promo",
  category: "ecommerce",
  description:
    "USA-themed Labor Day promotional email with a sandy palette, gallery imagery, pricing cards, feature blocks, and compliant VT-aware footer links.",
  tags: ["labor-day", "holiday", "usa", "promo", "ecommerce"],
  thumbnail: "https://placehold.co/600x800/EDE8DA/1C1C1C?text=Labor+Day",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Labor Day Promo",
      previewText: "Gather together for Labor Day and explore exclusive holiday offers.",
    },
    theme: laborDayTheme,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.background}",
    },
    modules: [
      mod(
        "header.badge",
        "USA badge",
        [
          text("🛡️ USA", {
            align: "center",
            color: "{colors.text}",
            fontFamily: "{fonts.heading}",
            fontSize: 30,
            fontWeight: "bold",
            letterSpacing: 2,
            paddingTop: 28,
            paddingBottom: 8,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "hero.labor_day",
        "Labor Day hero",
        [
          heading("Gather together for Labor Day", {
            align: "center",
            fontSize: 38,
            paddingTop: 8,
            paddingBottom: 10,
          }),
          muted("Celebrate the holiday and enjoy exclusive deals just for you.", {
            align: "center",
            fontSize: 16,
            paddingTop: 0,
            paddingBottom: 12,
          }),
          button("Explore Offers", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
            align: "center",
            linkType: "shop_url",
            borderRadius: laborDayTheme.tokens.radius.md,
            paddingTop: 8,
            paddingBottom: 28,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "content.image_grid",
        "Holiday gallery",
        [
          text(galleryHtml, {
            align: "center",
            paddingTop: 0,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "ecom.pricing_showcase",
        "Pricing cards",
        [
          heading("Gather together for Labor Day", {
            align: "center",
            fontSize: 28,
            paddingTop: 28,
            paddingBottom: 8,
          }),
          muted("Celebrate the holiday and enjoy exclusive deals just for you.", {
            align: "center",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 16,
          }),
          productGrid(
            [
              product({
                name: "$219",
                image: "https://placehold.co/240x80?text=30+Credits",
                finalPrice: "30 credits",
                description: "Up to 10% off · 5% off additional items · Free shipping",
                link: SPECIAL_LINK_PLACEHOLDERS.shop_url,
              }),
              product({
                name: "$299",
                image: "https://placehold.co/240x80?text=50+Credits",
                finalPrice: "50 credits",
                description: "Up to 20% off · 10% off additional items · Free shipping",
                link: SPECIAL_LINK_PLACEHOLDERS.shop_url,
              }),
            ],
            {
              columns: 2,
              showOldPrice: false,
              showDescription: true,
              showButton: false,
              cardBackgroundColor: "{colors.background}",
              borderRadius: 20,
              paddingTop: 8,
              paddingBottom: 8,
              finalPriceColor: "{colors.text}",
            }
          ),
          button("Shop Now", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
            align: "center",
            linkType: "shop_url",
            borderRadius: laborDayTheme.tokens.radius.md,
            paddingTop: 8,
            paddingBottom: 24,
          }),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop: 0,
          paddingBottom: 20,
          borderRadius: 18,
        }
      ),
      mod(
        "feature.measurements",
        "Know your measurements",
        [
          text("Know Your Measurements", {
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 26,
            fontWeight: "bold",
            paddingTop: 28,
            paddingBottom: 6,
          }),
          muted("Use sizing details before checkout so every holiday outfit lands just right.", {
            align: "center",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 28,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "feature.shape",
        "Dress for your shape",
        [
          text("Dress for Your Shape", {
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 26,
            fontWeight: "bold",
            paddingTop: 28,
            paddingBottom: 6,
          }),
          muted("Choose silhouettes that make holiday dressing feel easy, flattering, and fun.", {
            align: "center",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 28,
          }),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop: 0,
          paddingBottom: 0,
          border: `1px solid ${laborDayTheme.tokens.colors.border}`,
          borderRadius: 18,
        }
      ),
      mod(
        "feature.descriptions",
        "Read descriptions",
        [
          text("Read Descriptions", {
            align: "center",
            color: "{colors.buttonText}",
            fontFamily: "{fonts.heading}",
            fontSize: 26,
            fontWeight: "bold",
            paddingTop: 28,
            paddingBottom: 6,
          }),
          text("Fabric details, fit notes, and styling tips help you shop with confidence.", {
            align: "center",
            color: "{colors.buttonText}",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 28,
          }),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0, borderRadius: 18 }
      ),
      mod(
        "feature.returns",
        "Return policy",
        [
          text("Check the Return Policy", {
            align: "center",
            color: "{colors.buttonText}",
            fontFamily: "{fonts.heading}",
            fontSize: 26,
            fontWeight: "bold",
            paddingTop: 28,
            paddingBottom: 6,
          }),
          text("Need flexibility after the long weekend? Start with the store policy before you buy.", {
            align: "center",
            color: "{colors.buttonText}",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 28,
          }),
        ],
        { backgroundColor: "{colors.accent}", paddingTop: 0, paddingBottom: 0, borderRadius: 18 }
      ),
      mod(
        "footer.nav",
        "Footer navigation",
        [
          text(footerNavHtml, {
            align: "center",
            color: "{colors.muted}",
            fontSize: 12,
            paddingTop: 20,
            paddingBottom: 16,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "footer.social_bar",
        "Social bar",
        [
          text("Catch us on social and get promotion", {
            align: "center",
            color: "{colors.buttonText}",
            fontWeight: "bold",
            fontSize: 15,
            paddingTop: 20,
            paddingBottom: 6,
          }),
          text("Instagram · Facebook · TikTok · Pinterest", {
            align: "center",
            color: "{colors.buttonText}",
            fontSize: 13,
            paddingTop: 0,
            paddingBottom: 20,
          }),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "footer.legal",
        "Legal footer",
        [
          shopInfoText("USA Outfitters · 123 Main St · Brooklyn, NY 11201 · USA", {
            align: "center",
            fontSize: 11,
            paddingTop: 16,
            paddingBottom: 4,
          }),
          footerLinks([
            { label: "Privacy Policy", type: "policy_page" },
            { label: "Unsubscribe", type: "unsubscribe" },
          ], { paddingBottom: 24 }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

templateRegistry.register(laborDay);
export default laborDay;
