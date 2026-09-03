import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { newsletterEditorial } from "../themes/defaultThemes";
import {
  mod,
  heading,
  muted,
  text,
  eyebrow,
  productGrid,
  product,
  voucherCode,
  button,
  spacer,
  footerLinks,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "win-back",
  name: "Win-Back Campaign",
  category: "ecommerce",
  description:
    "Editorial-style re-engagement email with a personal note, a what's-new product preview, and a simple incentive to return.",
  tags: ["ecommerce", "win-back", "re-engagement", "lapsed", "discount"],
  thumbnail: PLACEHOLDER(600, 800, "We Miss You"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "We miss you, {user.firstname}",
      previewText: "It's been a while — here's what's new and a reason to come back.",
    },
    theme: newsletterEditorial,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.win_back", "Win-back hero", [
        eyebrow("We miss you", { align: "center", paddingTop: 28 }),
        heading("It's been a little while, {user.firstname}", {
          align: "center",
          fontSize: 30,
          paddingTop: 6,
          paddingBottom: 8,
        }),
        muted(
          "Since your last order about 6 months ago, we've added new favorites, improved bestsellers, and kept the experience even easier.",
          { align: "center", paddingBottom: 18 }
        ),
      ]),
      mod("editorial.whats_new", "What's new", [
        text("What's new", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 24,
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 16,
        }),
        productGrid(
          [
            product({
              name: "Studio Candle Trio",
              image: PLACEHOLDER(400, 400, "Candle Trio"),
              finalPrice: "$58",
              description: "Three layered scents designed for calm evenings in.",
            }),
            product({
              name: "Washed Cotton Throw",
              image: PLACEHOLDER(400, 400, "Cotton Throw"),
              finalPrice: "$74",
              description: "An easy, year-round layer customers keep reordering.",
            }),
          ],
          {
            columns: 2,
            showOldPrice: false,
            showDescription: true,
            buttonLabel: "See what's new",
          }
        ),
      ]),
      mod("offer.comeback", "Comeback offer", [
        text("Your best offer to return", {
          align: "center",
          fontWeight: "bold",
          paddingTop: 12,
          paddingBottom: 4,
        }),
        voucherCode("COMEBACK15"),
        muted("Use this discount code on your next order — no hoops, just a warm welcome back.", {
          align: "center",
          paddingTop: 0,
          paddingBottom: 16,
        }),
        button("Come back →"),
        spacer(16),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Editorial · Notes, launches, and thoughtful offers", {
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
