import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { luxuryBlack } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  button,
  image,
  productGrid,
  product,
  PLACEHOLDER,
  heading,
  muted,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "product-launch",
  name: "Product Launch — Drop",
  category: "product_launch",
  description:
    "Bold full-bleed product launch announcement: hero image, big headline, three new products, and an early-access CTA.",
  tags: ["launch", "drop", "new-arrivals", "ecommerce"],
  thumbnail: "https://placehold.co/600x800/000000/D4AF37?text=NEW+DROP",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "AUREX 02 — New Drop",
      previewText: "The new collection lands today. Limited stock.",
    },
    theme: luxuryBlack,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod(
        "hero.full_bleed",
        "Full-bleed hero",
        [
          image(PLACEHOLDER(600, 700, "AUREX+02"), "AUREX 02 hero", {
            width: 600,
            paddingTop: 0,
            paddingBottom: 0,
          }),
          text("AUREX 02", {
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 40,
            fontWeight: "bold",
            color: "{colors.primary}",
            letterSpacing: 6,
            paddingTop: 32,
            paddingBottom: 8,
          }),
          text("Pure performance. Limited release.", {
            align: "center",
            color: "{colors.text}",
            paddingBottom: 24,
          }),
          button("Shop the drop", "#"),
          spacer(40),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod("ecom.collection", "The Collection", [
        muted("THE COLLECTION", {
          align: "center",
          letterSpacing: 4,
          paddingTop: 24,
          paddingBottom: 4,
        }),
        heading("Meet the line-up", {
          align: "center",
          fontSize: 26,
          paddingBottom: 16,
        }),
        productGrid(
          [
            product({
              name: "AUREX 02 — Carbon",
              image: PLACEHOLDER(400, 400, "Carbon"),
              finalPrice: "$329",
            }),
            product({
              name: "AUREX 02 — Sand",
              image: PLACEHOLDER(400, 400, "Sand"),
              finalPrice: "$329",
            }),
            product({
              name: "AUREX 02 — Sage",
              image: PLACEHOLDER(400, 400, "Sage"),
              finalPrice: "$329",
            }),
          ],
          { columns: 3, showOldPrice: false, buttonLabel: "View" }
        ),
      ]),
      mod(
        "cta.early_access",
        "Early access",
        [
          text("Members get 24h early access", {
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 22,
            fontWeight: "bold",
            color: "{colors.text}",
            paddingTop: 32,
            paddingBottom: 16,
          }),
          button("Become a member", "#"),
          spacer(40),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "footer.brand",
        "Footer",
        [
          muted("AUREX · Designed in Berlin · Made in Italy", {
            align: "center",
            paddingTop: 16,
          }),
          muted("Manage preferences · Unsubscribe", {
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
