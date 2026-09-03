import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { ecommercePromo } from "../themes/defaultThemes";
import {
  mod,
  eyebrow,
  heading,
  muted,
  productGrid,
  product,
  button,
  spacer,
  footerLinks,
  text,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "price-drop-alert",
  name: "Price Drop Alert",
  category: "ecommerce",
  description:
    "Savings-focused alert for recently discounted products, combining social proof, urgency, and a concise shop-now call to action.",
  tags: ["ecommerce", "price-drop", "discount", "savings", "automation"],
  thumbnail: PLACEHOLDER(600, 800, "Price Drop Alert"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Prices just dropped on your saved picks",
      previewText: "A deal worth opening: your favorites are now marked down.",
    },
    theme: ecommercePromo,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.price_drop", "Price drop hero", [
        eyebrow("Price Drop Alert", { align: "center", paddingTop: 28 }),
        heading("Save more on the pieces you had your eye on", {
          align: "center",
          fontSize: 30,
          paddingTop: 6,
          paddingBottom: 8,
        }),
        muted(
          "Fresh markdowns just landed, {user.firstname}. These are the deals shoppers are adding to bag first.",
          { align: "center", paddingBottom: 20 }
        ),
      ]),
      mod("ecom.deal_grid", "Deal grid", [
        productGrid(
          [
            product({
              name: "Weekend Travel Tote",
              image: PLACEHOLDER(400, 400, "Travel Tote"),
              oldPrice: "$89",
              finalPrice: "$64",
              stars: 5,
            }),
            product({
              name: "Stoneware Dinner Set",
              image: PLACEHOLDER(400, 400, "Dinner Set"),
              oldPrice: "$120",
              finalPrice: "$82",
              stars: 4,
            }),
            product({
              name: "Everyday Knit Throw",
              image: PLACEHOLDER(400, 400, "Knit Throw"),
              oldPrice: "$72",
              finalPrice: "$49",
              stars: 5,
            }),
          ],
          {
            columns: 3,
            showOldPrice: true,
            showStars: true,
            buttonLabel: "See details",
          }
        ),
      ]),
      mod("cta.deal", "Deal CTA", [
        text("Prices may change anytime.", {
          align: "center",
          fontWeight: "bold",
          color: "{colors.primary}",
          paddingTop: 12,
          paddingBottom: 6,
        }),
        muted("If you've been waiting for the right moment, this is a very good one.", {
          align: "center",
          paddingBottom: 16,
        }),
        button("Grab the deal"),
        spacer(16),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Store · Thoughtful finds, better prices", {
            align: "center",
            paddingTop: 16,
            paddingBottom: 4,
          }),
          footerLinks(
            [
              { label: "Unsubscribe", type: "unsubscribe" },
              { label: "View in browser", type: "view_in_browser" },
            ],
            { align: "center", paddingTop: 0, paddingBottom: 24 }
          ),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

templateRegistry.register(def);
export default def;
