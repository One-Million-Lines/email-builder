import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { greenEco } from "../themes/defaultThemes";
import {
  mod,
  heading,
  muted,
  text,
  divider,
  button,
  spacer,
  footerLinks,
  eyebrow,
  PLACEHOLDER,
  image,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "post-purchase-follow-up",
  name: "Post-Purchase Follow-Up",
  category: "transactional",
  description:
    "Warm after-purchase email with confirmation messaging, practical usage guidance, support reassurance, and a gentle review request.",
  tags: ["transactional", "post-purchase", "onboarding", "follow-up", "review"],
  thumbnail: PLACEHOLDER(600, 800, "Post Purchase"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Thanks again for your order, {user.firstname}",
      previewText: "A few simple tips to help you get the most from your new purchase.",
    },
    theme: greenEco,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.follow_up", "Follow-up hero", [
        eyebrow("Thank you", { align: "center", paddingTop: 28 }),
        heading("Thanks for your order, {user.firstname}", {
          align: "center",
          fontSize: 28,
          paddingTop: 6,
          paddingBottom: 8,
        }),
        muted("Your order is confirmed, packed with care, and on its way to becoming a favorite.", {
          align: "center",
          paddingBottom: 16,
        }),
      ]),
      mod("content.tips_visual", "Usage image", [
        image(PLACEHOLDER(552, 260, "Getting Started Tips"), "Getting started tips", {
          width: 552,
          paddingTop: 0,
          paddingBottom: 8,
        }),
      ]),
      mod("content.usage_tips", "Usage tips", [
        text("1. Unbox and set up with intention", {
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
        }),
        muted("Start with the quick-start guide included in the package for the smoothest first use.", {
          paddingBottom: 12,
        }),
        divider({ color: "{colors.background}", paddingTop: 4, paddingBottom: 4 }),
        text("2. Make it part of your weekly routine", {
          fontWeight: "bold",
          paddingTop: 4,
          paddingBottom: 4,
        }),
        muted("The best results come from small, consistent use — a few minutes goes a long way.", {
          paddingBottom: 12,
        }),
        divider({ color: "{colors.background}", paddingTop: 4, paddingBottom: 4 }),
        text("3. Save this email for care and support", {
          fontWeight: "bold",
          paddingTop: 4,
          paddingBottom: 4,
        }),
        muted("Need help later? We've included the fastest way to reach us just below.", {
          paddingBottom: 12,
        }),
      ]),
      mod("support.help", "Support", [
        text("Need a hand?", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
        }),
        muted(
          "Reply directly to this email or visit our help center any time. Our team is happy to help with setup, care, and product questions.",
          { align: "center", paddingBottom: 16 }
        ),
        button("Leave a review", "#", {
          backgroundColor: "{colors.surface}",
          color: "{colors.primary}",
        }),
        spacer(8),
        muted("If you're loving it, a quick review helps other customers feel confident too.", {
          align: "center",
          paddingBottom: 20,
        }),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Care Team · Here when you need us", {
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
