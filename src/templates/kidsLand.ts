import type { EmailDocument, Theme } from "../core/types";
import { SPECIAL_LINK_PLACEHOLDERS } from "../core/types";
import {
  button,
  footerLinks,
  heading,
  image,
  mod,
  muted,
  product,
  productGrid,
  shopInfoText,
  text,
  voucherCode,
} from "../modules/helpers";
import { templateRegistry, type TemplateDefinition } from "./registry";

const kidsLandTheme: Theme = {
  id: "kids-land",
  name: "Kids Land",
  tokens: {
    colors: {
      background: "#E8E8E8",
      surface: "#FFFFFF",
      primary: "#4BA8AA",
      text: "#1C2B35",
      muted: "#6B7280",
      buttonBackground: "#4BA8AA",
      buttonText: "#FFFFFF",
      promo: "#E3AC44",
      border: "#D8DEE2",
    },
    fonts: {
      heading: "Arial, Helvetica, sans-serif",
      body: "Arial, Helvetica, sans-serif",
      button: "Arial, Helvetica, sans-serif",
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 },
    radius: { sm: 6, md: 10, lg: 18 },
  },
};

const headerHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
  <tr>
    <td style="font-family:${kidsLandTheme.tokens.fonts.heading};font-size:28px;font-weight:700;color:${kidsLandTheme.tokens.colors.primary};letter-spacing:1px;">KIDS LAND</td>
    <td align="right" style="font-family:${kidsLandTheme.tokens.fonts.body};font-size:12px;color:${kidsLandTheme.tokens.colors.muted};">
      <a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">TRENDING</a>
      &nbsp;·&nbsp;
      <a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">COLLECTIONS</a>
      &nbsp;·&nbsp;
      <a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">EXPLORE</a>
    </td>
  </tr>
</table>`;

const outlineButtonHtml = `
<a class="vtw-url" href="${SPECIAL_LINK_PLACEHOLDERS.shop_url}" data-link-type="shop_url" style="display:inline-block;padding:12px 28px;border:1px solid ${kidsLandTheme.tokens.colors.primary};border-radius:999px;color:${kidsLandTheme.tokens.colors.primary};font-family:${kidsLandTheme.tokens.fonts.button};font-size:14px;font-weight:700;text-decoration:none;background-color:${kidsLandTheme.tokens.colors.surface};">Shop Now</a>`;

const footerNavHtml = `
<a class="vtw-url" href="${SPECIAL_LINK_PLACEHOLDERS.shop_url}" data-link-type="shop_url" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">Shop</a>
&nbsp;·&nbsp;
<a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">Gift Cards</a>
&nbsp;·&nbsp;
<a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">Blog</a>
&nbsp;·&nbsp;
<a href="#" style="color:${kidsLandTheme.tokens.colors.muted};text-decoration:none;">Contact</a>`;

export const kidsLand: TemplateDefinition = {
  id: "kids-land",
  name: "Kids Land Back to School",
  category: "ecommerce",
  description:
    "Back-to-school retail email with a teal identity, hero image, category grid, bestseller banner, product grid, and promo-code section.",
  tags: ["kids", "back-to-school", "retail", "ecommerce", "promo"],
  thumbnail: "https://placehold.co/600x800/E8E8E8/4BA8AA?text=Kids+Land",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Kids Land Back to School",
      previewText: "Back to school savings, best sellers, and today's special code.",
    },
    theme: kidsLandTheme,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod(
        "header.brand_nav",
        "Brand nav",
        [
          text(headerHtml, {
            paddingTop: 24,
            paddingBottom: 16,
            paddingLeft: 24,
            paddingRight: 24,
          }),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "hero.back_to_school",
        "Back to school hero",
        [
          text("WELCOME", {
            align: "center",
            color: "{colors.primary}",
            fontWeight: "bold",
            letterSpacing: 3,
            fontSize: 12,
            paddingTop: 20,
            paddingBottom: 6,
          }),
          heading("BACK TO SCHOOL SALE", {
            align: "center",
            fontSize: 34,
            paddingTop: 0,
            paddingBottom: 10,
          }),
          image("https://placehold.co/560x360?text=Back+to+School+Hero", "Back to school hero", {
            width: 560,
            borderRadius: 18,
            paddingTop: 0,
            paddingBottom: 12,
          }),
          muted("Exclusive discounts are here to make the new school season feel fresh, fun, and affordable.", {
            align: "center",
            fontSize: 15,
            paddingTop: 0,
            paddingBottom: 12,
          }),
          text(outlineButtonHtml, {
            align: "center",
            paddingTop: 0,
            paddingBottom: 24,
          }),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "content.categories",
        "Category grid",
        [
          heading("Explore the collection", {
            align: "center",
            fontSize: 26,
            paddingTop: 24,
            paddingBottom: 10,
          }),
          productGrid(
            [
              product({ name: "HATS", image: "https://placehold.co/240x240?text=HATS", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
              product({ name: "JACKETS", image: "https://placehold.co/240x240?text=JACKETS", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
              product({ name: "JEANS", image: "https://placehold.co/240x240?text=JEANS", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
              product({ name: "SHOES", image: "https://placehold.co/240x240?text=SHOES", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
              product({ name: "SOCKS", image: "https://placehold.co/240x240?text=SOCKS", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
              product({ name: "BAGS", image: "https://placehold.co/240x240?text=BAGS", finalPrice: "→", link: SPECIAL_LINK_PLACEHOLDERS.shop_url }),
            ],
            {
              columns: 2,
              showOldPrice: false,
              showDescription: false,
              showButton: false,
              cardBackgroundColor: "{colors.surface}",
              borderRadius: 14,
              paddingTop: 0,
              paddingBottom: 8,
              finalPriceColor: "{colors.primary}",
            }
          ),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 12 }
      ),
      mod(
        "content.intro",
        "Intro copy",
        [
          muted(
            "Back-to-school season is here, and we've packed this edition with standout looks, essential layers, and extra savings for every family cart.",
            {
              align: "center",
              fontSize: 15,
              paddingTop: 8,
              paddingBottom: 24,
            }
          ),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "content.best_seller_banner",
        "Best seller banner",
        [
          image("https://placehold.co/560x220?text=BEST+SELLER", "Best seller banner", {
            width: 560,
            borderRadius: 18,
            paddingTop: 0,
            paddingBottom: 20,
          }),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "ecom.back_to_school_grid",
        "Best seller grid",
        [
          heading("Best sellers", {
            align: "center",
            fontSize: 26,
            paddingTop: 8,
            paddingBottom: 12,
          }),
          productGrid(
            [
              product({ name: "School Suit No.1", image: "https://placehold.co/300x300?text=Suit+1", oldPrice: "$49.99", finalPrice: "$34.99", link: SPECIAL_LINK_PLACEHOLDERS.shop_url, buttonLabel: "Shop Now" }),
              product({ name: "School Suit No.2", image: "https://placehold.co/300x300?text=Suit+2", oldPrice: "$49.99", finalPrice: "$34.99", link: SPECIAL_LINK_PLACEHOLDERS.shop_url, buttonLabel: "Shop Now" }),
              product({ name: "School Suit No.3", image: "https://placehold.co/300x300?text=Suit+3", oldPrice: "$49.99", finalPrice: "$34.99", link: SPECIAL_LINK_PLACEHOLDERS.shop_url, buttonLabel: "Shop Now" }),
              product({ name: "School Suit No.4", image: "https://placehold.co/300x300?text=Suit+4", oldPrice: "$49.99", finalPrice: "$34.99", link: SPECIAL_LINK_PLACEHOLDERS.shop_url, buttonLabel: "Shop Now" }),
            ],
            {
              columns: 2,
              showOldPrice: true,
              showDescription: false,
              showButton: true,
              cardBackgroundColor: "{colors.surface}",
              borderRadius: 14,
            }
          ),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 8 }
      ),
      mod(
        "cta.see_more",
        "See more banner",
        [
          image("https://placehold.co/560x180?text=See+More", "See more banner", {
            width: 560,
            borderRadius: 18,
            paddingTop: 8,
            paddingBottom: 8,
          }),
          button("See More", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
            align: "center",
            linkType: "shop_url",
            borderRadius: 24,
            paddingTop: 0,
            paddingBottom: 24,
          }),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "ecom.discount_code",
        "Discount code",
        [
          text("TODAY ONLY!", {
            align: "center",
            fontWeight: "bold",
            letterSpacing: 3,
            fontSize: 12,
            color: "{colors.text}",
            paddingTop: 28,
            paddingBottom: 4,
          }),
          heading("25% OFF", {
            align: "center",
            fontSize: 38,
            paddingTop: 0,
            paddingBottom: 6,
          }),
          muted("USE CODE", {
            align: "center",
            fontSize: 12,
            letterSpacing: 3,
            paddingTop: 0,
            paddingBottom: 4,
          }),
          voucherCode("BACKTOSCHOOL", { color: "{colors.text}" }),
          button("Shop Now", SPECIAL_LINK_PLACEHOLDERS.shop_url, {
            align: "center",
            linkType: "shop_url",
            backgroundColor: "{colors.surface}",
            color: "{colors.primary}",
            borderRadius: 24,
            paddingTop: 0,
            paddingBottom: 28,
          }),
        ],
        { backgroundColor: "{colors.promo}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "footer.nav",
        "Footer navigation",
        [
          text(footerNavHtml, {
            align: "center",
            color: "{colors.muted}",
            fontSize: 12,
            paddingTop: 18,
            paddingBottom: 8,
          }),
          shopInfoText("Kids Land · 123 Main St · Brooklyn, NY 11201 · USA", {
            align: "center",
            fontSize: 11,
            paddingTop: 0,
            paddingBottom: 4,
          }),
          footerLinks([
            { label: "Manage preferences", type: "manage_preferences" },
            { label: "Unsubscribe", type: "unsubscribe" },
          ], { paddingBottom: 24 }),
        ],
        {
          backgroundColor: "{colors.surface}",
          paddingTop: 0,
          paddingBottom: 0,
          border: `1px solid ${kidsLandTheme.tokens.colors.border}`,
        }
      ),
    ],
  }),
};

templateRegistry.register(kidsLand);
export default kidsLand;
