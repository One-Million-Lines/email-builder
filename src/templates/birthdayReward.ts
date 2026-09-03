import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { ecommercePromo } from "../themes/defaultThemes";
import {
  mod,
  heading,
  muted,
  text,
  voucherCode,
  button,
  spacer,
  footerLinks,
  eyebrow,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "birthday-reward",
  name: "Birthday Reward",
  category: "ecommerce",
  description:
    "Personalized birthday email with a celebratory headline, warm note, redeemable voucher code, and a gift-led call to action.",
  tags: ["ecommerce", "birthday", "reward", "loyalty", "personalisation"],
  thumbnail: PLACEHOLDER(600, 800, "Birthday Reward"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Happy Birthday, {user.firstname}!",
      previewText: "A little birthday gift from us to you.",
    },
    theme: ecommercePromo,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.birthday", "Birthday hero", [
        eyebrow("A gift for you", { align: "center", paddingTop: 28 }),
        heading("🎂 Happy Birthday {user.firstname}! 🎉", {
          align: "center",
          fontSize: 32,
          paddingTop: 6,
          paddingBottom: 10,
        }),
        muted(
          "We're celebrating you with something sweet: a birthday reward to spend on anything that makes this year feel extra good.",
          { align: "center", paddingBottom: 14 }
        ),
      ]),
      mod("content.reward", "Birthday reward", [
        text("Your birthday treat is ready to unwrap:", {
          align: "center",
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
        }),
        voucherCode("BDAY20"),
        muted("Use this code at checkout to enjoy your birthday savings on your next order.", {
          align: "center",
          paddingTop: 0,
          paddingBottom: 16,
        }),
        button("Claim my birthday gift"),
        spacer(8),
        muted("Expires in 7 days, so don't let your gift sit unopened.", {
          align: "center",
          fontSize: 13,
          paddingBottom: 20,
        }),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Rewards · Celebrating the good stuff with you", {
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
