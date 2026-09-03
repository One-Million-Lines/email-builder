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
  divider,
  footerLinks,
  text,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "back-in-stock",
  name: "Back in Stock Spotlight",
  category: "ecommerce",
  description:
    "Urgency-led back-in-stock alert featuring a single bestselling item, social proof, limited-stock messaging, and a fast path to purchase.",
  tags: ["ecommerce", "back-in-stock", "urgency", "product", "automation"],
  thumbnail: PLACEHOLDER(600, 800, "Back in Stock"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "It's back — and already moving fast",
      previewText: "Good news, {user.firstname}: your saved favorite is back in stock.",
    },
    theme: ecommercePromo,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod(
        "hero.back_in_stock",
        "Back in stock hero",
        [
          eyebrow("It's back!", { align: "center", paddingTop: 28 }),
          heading("Your wait is over, {user.firstname}", {
            align: "center",
            fontSize: 30,
            paddingTop: 6,
            paddingBottom: 8,
          }),
          muted(
            "The bestseller you checked out is back on the shelf — but only in a small restock batch.",
            { align: "center", paddingBottom: 20 }
          ),
        ]
      ),
      mod("ecom.product_spotlight", "Product spotlight", [
        productGrid(
          [
            product({
              name: "CloudSoft Lounge Set",
              image: PLACEHOLDER(520, 520, "CloudSoft Lounge Set"),
              oldPrice: "$128",
              finalPrice: "$96",
              description: "Rated 4.9/5 for the buttery-soft feel and all-day comfort.",
              stars: 5,
              buttonLabel: "Shop before it's gone",
            }),
          ],
          {
            columns: 1,
            showOldPrice: true,
            showDescription: true,
            showStars: true,
            buttonLabel: "Shop before it's gone",
          }
        ),
      ]),
      mod("content.urgency", "Urgency note", [
        divider({ color: "{colors.background}", paddingTop: 8, paddingBottom: 12 }),
        text("Only a limited number are available in your size range.", {
          align: "center",
          fontWeight: "bold",
          color: "{colors.primary}",
          paddingTop: 0,
          paddingBottom: 6,
        }),
        muted(
          "Popular restocks like this usually sell through within a day, so we wanted you to have first dibs.",
          { align: "center", paddingBottom: 16 }
        ),
        button("Shop before it's gone"),
        spacer(16),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Store · Curated essentials you actually reach for", {
            align: "center",
            paddingTop: 16,
            paddingBottom: 4,
          }),
          footerLinks(
            [
              { label: "Unsubscribe", type: "unsubscribe" },
              { label: "Manage preferences", type: "manage_preferences" },
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
