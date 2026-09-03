import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { minimalSaaS } from "../themes/defaultThemes";
import {
  mod,
  image,
  heading,
  muted,
  text,
  button,
  spacer,
  footerLinks,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "review-request",
  name: "Review Request",
  category: "transactional",
  description:
    "Clean post-purchase review request with a product visual, rating prompt, founder note, and a simple one-click review CTA.",
  tags: ["transactional", "review", "rating", "social-proof", "post-purchase"],
  thumbnail: PLACEHOLDER(600, 800, "Review Request"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "How did you like it?",
      previewText: "A quick review from you would mean a lot to us.",
    },
    theme: minimalSaaS,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.product_review", "Product review hero", [
        image(PLACEHOLDER(552, 320, "Your Recent Purchase"), "Your recent purchase", {
          width: 552,
          paddingTop: 24,
          paddingBottom: 12,
        }),
        heading("How did you like it?", {
          align: "center",
          fontSize: 28,
          paddingTop: 4,
          paddingBottom: 8,
        }),
        text("⭐⭐⭐⭐⭐", {
          align: "center",
          fontSize: 26,
          paddingTop: 0,
          paddingBottom: 8,
        }),
        muted("Your honest rating helps us improve and helps other shoppers buy with confidence.", {
          align: "center",
          paddingBottom: 16,
        }),
      ]),
      mod("content.founder_note", "Founder note", [
        text("A quick personal note from our founder", {
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          align: "center",
          paddingTop: 8,
          paddingBottom: 6,
        }),
        muted(
          "Hi {user.firstname}, I'm Lena, founder at Acme. We read every review because thoughtful feedback shapes what we make next. If you have 60 seconds, we'd be grateful to hear what you think.",
          { align: "center", paddingBottom: 16 }
        ),
        button("Write a review"),
        spacer(8),
        muted("As a thank-you, you'll unlock early access to future launches and members-only offers.", {
          align: "center",
          fontSize: 13,
          paddingBottom: 20,
        }),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme · Built with customer feedback at the center", {
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
