import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { greenEco } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  button,
  productGrid,
  product,
  PLACEHOLDER,
  heading,
  muted,
  divider,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "abandoned-cart",
  name: "Abandoned Cart Recovery",
  category: "abandoned_cart",
  description:
    "Friendly reminder showing items left in the cart, a discount nudge, and a return-to-cart button. For automated cart-recovery flows.",
  tags: ["abandoned-cart", "recovery", "automation", "ecommerce"],
  thumbnail: "https://placehold.co/600x800/F5F1EA/2C2928?text=Cart+Reminder",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "You left something behind",
      previewText: "Your cart is waiting — and we saved your spot.",
    },
    theme: greenEco,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Logo", [
        text("ACME", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          letterSpacing: 4,
          paddingTop: 24,
          paddingBottom: 24,
        }),
      ]),
      mod("hero.text", "Headline", [
        heading("You left something behind", {
          align: "center",
          fontSize: 28,
          paddingTop: 16,
          paddingBottom: 8,
        }),
        muted("We saved your bag. Pick up right where you left off.", {
          align: "center",
          paddingBottom: 16,
        }),
      ]),
      mod("ecom.cart_items", "Cart items", [
        productGrid(
          [
            product({
              name: "Linen Tote Bag",
              image: PLACEHOLDER(400, 400, "Tote"),
              oldPrice: "$59",
              finalPrice: "$39",
              description: "Heavyweight natural linen, made in Portugal.",
            }),
            product({
              name: "Cast Iron Skillet",
              image: PLACEHOLDER(400, 400, "Skillet"),
              finalPrice: "$89",
              description: "Pre-seasoned, lifetime guarantee.",
            }),
          ],
          { columns: 1, showOldPrice: true, showDescription: true, buttonLabel: "Return to cart" }
        ),
      ]),
      mod("cta.discount", "Discount nudge", [
        divider({ paddingTop: 8, paddingBottom: 16 }),
        text("Here's 10% off to seal the deal", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          paddingBottom: 4,
        }),
        text("COMEBACK10", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 28,
          fontWeight: "bold",
          color: "{colors.primary}",
          letterSpacing: 4,
          paddingBottom: 16,
        }),
        button("Complete your order"),
        spacer(24),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Questions? hello@acme.shop", {
            align: "center",
            paddingTop: 16,
          }),
          muted("© 2026 Acme · Unsubscribe", {
            align: "center",
            paddingTop: 4,
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
