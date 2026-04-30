import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { ecommercePromo } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  button,
  productGrid,
  product,
  PLACEHOLDER,
  muted,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "flash-sale",
  name: "Flash Sale — 24h",
  category: "ecommerce",
  description:
    "Urgency-driven 24-hour flash sale with countdown headline, three featured products with old/final prices, and a closing CTA.",
  tags: ["ecommerce", "sale", "promo", "discount", "urgency"],
  thumbnail: "https://placehold.co/600x800/EA580C/FFFFFF?text=FLASH+SALE",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Flash Sale — 24h only",
      previewText: "Up to 50% off — ends midnight tonight.",
    },
    theme: ecommercePromo,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod(
        "hero.flash",
        "Flash hero",
        [
          text("⏰ FLASH SALE — ENDS IN 24H", {
            color: "{colors.buttonText}",
            align: "center",
            fontWeight: "bold",
            letterSpacing: 3,
            paddingTop: 24,
            paddingBottom: 8,
          }),
          text("Up to 50% off everything", {
            color: "{colors.buttonText}",
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 32,
            fontWeight: "bold",
            paddingBottom: 16,
          }),
          button("Shop the sale", "#", {
            backgroundColor: "{colors.surface}",
            color: "{colors.primary}",
          }),
          spacer(24),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod("ecom.featured_grid", "Featured products", [
        text("Today's picks", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 24,
          fontWeight: "bold",
          paddingTop: 24,
          paddingBottom: 16,
        }),
        productGrid(
          [
            product({
              name: "Linen Tote Bag",
              image: PLACEHOLDER(400, 400, "Tote"),
              oldPrice: "$59",
              finalPrice: "$29",
            }),
            product({
              name: "Ceramic Mug Set",
              image: PLACEHOLDER(400, 400, "Mug+Set"),
              oldPrice: "$48",
              finalPrice: "$24",
            }),
            product({
              name: "Brass Desk Lamp",
              image: PLACEHOLDER(400, 400, "Lamp"),
              oldPrice: "$159",
              finalPrice: "$79",
            }),
          ],
          { columns: 3, showOldPrice: true, buttonLabel: "Add to bag" }
        ),
      ]),
      mod("cta.urgency", "Final CTA", [
        text("Don't sleep on it — this ends at midnight.", {
          align: "center",
          fontWeight: "bold",
          paddingTop: 16,
          paddingBottom: 12,
        }),
        button("Shop now", "#"),
        spacer(24),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("© 2026 Acme Co · Unsubscribe · Manage preferences", {
            align: "center",
            paddingTop: 16,
            paddingBottom: 24,
            link: "#",
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

templateRegistry.register(def);
export default def;
