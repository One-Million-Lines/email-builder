import type { ModuleDefinition } from "./registry";
import { text, mod, button, spacer, image, heading, muted, eyebrow, PLACEHOLDER } from "./helpers";

export const ctaModules: ModuleDefinition[] = [
  {
    type: "cta.simple",
    category: "call_to_action",
    name: "Simple CTA",
    description: "Centered headline + body + primary button. The default call-to-action block for any newsletter or promo.",
    tags: ["cta", "primary", "centered", "button"],
    create: () =>
      mod("cta.simple", "Simple CTA", [
        heading("Ready to get started?", { align: "center", paddingTop: 24 }),
        muted("Create better emails faster.", { align: "center" }),
        button("Start now", "https://example.com"),
        spacer(16),
      ]),
  },
  {
    type: "cta.banner",
    category: "call_to_action",
    name: "Colored Banner CTA",
    description: "Full-width colored band with eyebrow, big headline and a contrasting button. Use to draw attention to sales or launches.",
    tags: ["cta", "banner", "colored", "promo", "sale"],
    create: () =>
      mod(
        "cta.banner",
        "CTA Banner",
        [
          text("Limited time offer", {
            color: "{colors.buttonText}",
            align: "center",
            fontSize: 14,
            paddingTop: 24,
            paddingBottom: 4,
          }),
          text("Save 30% this week only", {
            color: "{colors.buttonText}",
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 28,
            fontWeight: "bold",
            paddingBottom: 16,
          }),
          button("Shop the sale"),
          spacer(24),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "cta.button_only",
    category: "call_to_action",
    name: "Button Only",
    description: "Single primary button on a clean background. Use as a follow-up CTA after a content block.",
    tags: ["cta", "button", "minimal"],
    create: () => mod("cta.button_only", "Button", [button("Click here", "https://example.com")]),
  },
  {
    type: "cta.dual_button",
    category: "call_to_action",
    name: "Two Button Choice",
    description: "Two side-by-side actions: a primary and a ghost-styled secondary. Use when offering 'Learn more' vs 'Get started'.",
    tags: ["cta", "buttons", "two-options", "choice"],
    create: () =>
      mod("cta.dual_button", "Two Buttons", [
        heading("Pick your path", { align: "center", paddingTop: 24 }),
        muted("Choose what fits your team.", { align: "center" }),
        button("Get started", "https://example.com"),
        button("Learn more", "https://example.com", { backgroundColor: "transparent", color: "{colors.primary}" }),
        spacer(16),
      ]),
  },
  {
    type: "cta.image_overlay",
    category: "call_to_action",
    name: "Image + Overlay CTA",
    description: "Lead image with a headline, supporting text, and a button immediately below. Strong visual call to action.",
    tags: ["cta", "image", "visual", "hero"],
    create: () =>
      mod("cta.image_overlay", "Image CTA", [
        image(PLACEHOLDER(560, 280, "Visual"), "Visual", { width: 560, paddingTop: 16 }),
        heading("Stop guessing. Start measuring.", { align: "center", paddingTop: 16 }),
        muted("Free for 14 days. No credit card.", { align: "center" }),
        button("Try it free"),
        spacer(16),
      ]),
  },
  {
    type: "cta.subscribe",
    category: "call_to_action",
    name: "Subscribe / Forward",
    description: "Friendly 'Was this forwarded? Subscribe' block that grows the list virally. Common at the end of newsletters.",
    tags: ["cta", "subscribe", "forward", "growth", "newsletter"],
    create: () =>
      mod(
        "cta.subscribe",
        "Subscribe",
        [
          eyebrow("Was this forwarded?", { align: "center" }),
          heading("Get the next issue in your inbox", { align: "center", paddingTop: 0, paddingBottom: 8 }),
          button("Subscribe free"),
          spacer(16),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "cta.referral",
    category: "call_to_action",
    name: "Referral / Share",
    description: "Encourages readers to share the newsletter with a unique referral link. Includes a 'Share' button and a personalized URL.",
    tags: ["cta", "referral", "share", "viral", "growth"],
    create: () =>
      mod("cta.referral", "Referral", [
        eyebrow("Tell a friend", { align: "center" }),
        heading("Share & earn perks", { align: "center", paddingTop: 0, paddingBottom: 8 }),
        muted("Refer 3 friends and unlock the bonus issue.", { align: "center" }),
        text("yourname.com/r/abc123", {
          align: "center",
          color: "{colors.primary}",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: 14,
          paddingTop: 8,
          paddingBottom: 8,
        }),
        button("Share now"),
        spacer(16),
      ]),
  },
  {
    type: "cta.upgrade",
    category: "call_to_action",
    name: "Upgrade / Paid",
    description: "Conversion block that promotes a paid plan or premium tier. Includes price, benefits and an upgrade button.",
    tags: ["cta", "upgrade", "paid", "premium", "conversion"],
    create: () =>
      mod(
        "cta.upgrade",
        "Upgrade",
        [
          eyebrow("Become a member", { align: "center" }),
          heading("$5 / month", { align: "center", level: 1 }),
          muted("Unlock the archive, weekly bonus and member chat.", { align: "center", fontSize: 14 }),
          button("Upgrade"),
          spacer(16),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "cta.feedback",
    category: "call_to_action",
    name: "Feedback Reply",
    description: "Asks the reader to reply with feedback ('Hit reply and let me know'). Personal, no button.",
    tags: ["cta", "feedback", "reply", "personal"],
    create: () =>
      mod("cta.feedback", "Feedback", [
        text("How did this issue land for you? Just hit reply — I read every message.", {
          align: "center",
          paddingTop: 24,
          paddingBottom: 24,
          lineHeight: 1.6,
        }),
      ]),
  },
];
