import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { luxuryBlack } from "../themes/defaultThemes";
import {
  mod,
  text,
  heading,
  muted,
  productGrid,
  product,
  button,
  spacer,
  footerLinks,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "vip-early-access",
  name: "VIP Early Access",
  category: "ecommerce",
  description:
    "Exclusive loyalty email offering a 24-hour head start, premium styling, curated preview products, and a private-access CTA.",
  tags: ["ecommerce", "vip", "exclusive", "early-access", "loyalty"],
  thumbnail: PLACEHOLDER(600, 800, "VIP Early Access"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "VIP early access starts now",
      previewText: "You're in — enjoy 24 hours before everyone else.",
    },
    theme: luxuryBlack,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod(
        "hero.vip",
        "VIP hero",
        [
          text("VIP EARLY ACCESS", {
            align: "center",
            color: "{colors.primary}",
            fontWeight: "bold",
            letterSpacing: 3,
            paddingTop: 28,
            paddingBottom: 8,
          }),
          heading("You're in. 24h before everyone else.", {
            align: "center",
            fontSize: 32,
            paddingTop: 0,
            paddingBottom: 10,
          }),
          muted(
            "Because you're one of our most valued customers, {user.firstname}, the collection is open to you first.",
            { align: "center", paddingBottom: 18 }
          ),
          button("Shop my early access", "#", {
            backgroundColor: "{colors.primary}",
            color: "{colors.buttonText}",
          }),
          spacer(16),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod("ecom.preview_grid", "Preview grid", [
        productGrid(
          [
            product({
              name: "Noir Leather Weekender",
              image: PLACEHOLDER(400, 400, "Leather Weekender"),
              finalPrice: "$320",
              description: "Soft-grain finish with understated gold hardware.",
            }),
            product({
              name: "Reserve Silk Robe",
              image: PLACEHOLDER(400, 400, "Silk Robe"),
              finalPrice: "$210",
              description: "Cut for quiet drama with fluid drape and shine.",
            }),
          ],
          {
            columns: 2,
            showOldPrice: false,
            showDescription: true,
            buttonLabel: "Preview piece",
          }
        ),
      ]),
      mod("content.exclusive_note", "Exclusive note", [
        text("Your private window closes tomorrow at midnight.", {
          align: "center",
          color: "{colors.primary}",
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 20,
        }),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Private Client · Reserved access for loyal members", {
            align: "center",
            paddingTop: 16,
            paddingBottom: 4,
          }),
          footerLinks(
            [
              { label: "Unsubscribe", type: "unsubscribe" },
              { label: "Manage preferences", type: "manage_preferences" },
            ],
            { align: "center", color: "{colors.muted}", paddingTop: 0, paddingBottom: 24 }
          ),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
    ],
  }),
};

templateRegistry.register(def);
export default def;
