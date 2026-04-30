import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { newsletterEditorial } from "../themes/defaultThemes";
import {
  mod,
  text,
  image,
  button,
  spacer,
  divider,
  heading,
  muted,
  eyebrow,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "weekly-newsletter",
  name: "The Weekly Digest",
  category: "newsletter",
  description:
    "Editorial weekly newsletter with masthead, in-this-issue table of contents, three article summaries, and a footer.",
  tags: ["newsletter", "editorial", "weekly", "publishing"],
  thumbnail: "https://placehold.co/600x800/F5F1EA/1F2937?text=The+Weekly",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "The Weekly Digest — Issue 42",
      previewText: "This week: AI in the newsroom, three reads, and a recipe.",
    },
    theme: newsletterEditorial,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.masthead", "Masthead", [
        text("THE WEEKLY", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 32,
          fontWeight: "bold",
          letterSpacing: 6,
          paddingTop: 32,
          paddingBottom: 4,
        }),
        muted("Issue 42 · April 30, 2026", { align: "center", paddingBottom: 24 }),
        divider({ paddingTop: 0, paddingBottom: 0 }),
      ]),
      mod("content.article", "Lead Story", [
        eyebrow("LEAD STORY", { paddingTop: 24 }),
        heading("AI Comes to the Newsroom — and It's Helping", {
          fontSize: 28,
          paddingTop: 4,
          paddingBottom: 12,
        }),
        image(PLACEHOLDER(560, 320, "Lead+Story"), "Newsroom", { width: 560 }),
        text(
          "A new generation of editorial assistants is changing how stories get written, fact-checked and published. Here's what we found in three newsrooms.",
          { paddingTop: 16, paddingBottom: 12 }
        ),
        text("Read the full piece →", {
          color: "{colors.primary}",
          fontWeight: "bold",
          link: "#",
          paddingBottom: 8,
        }),
      ]),
      mod("content.three_reads", "Three More Reads", [
        eyebrow("ALSO THIS WEEK", { paddingTop: 16 }),
        heading("Three more reads", { paddingBottom: 12 }),
        text("01 · The hidden cost of free tier APIs", {
          fontWeight: "bold",
          link: "#",
          paddingTop: 4,
          paddingBottom: 4,
        }),
        muted("How startups are quietly burning runway on metered cloud calls.", {
          paddingBottom: 12,
        }),
        divider({ paddingTop: 4, paddingBottom: 4 }),
        text("02 · A field guide to product-led onboarding", {
          fontWeight: "bold",
          link: "#",
          paddingBottom: 4,
        }),
        muted("Stop sending welcome emails. Start designing the first 5 minutes.", {
          paddingBottom: 12,
        }),
        divider({ paddingTop: 4, paddingBottom: 4 }),
        text("03 · Inside the new Madrid co-working scene", {
          fontWeight: "bold",
          link: "#",
          paddingBottom: 4,
        }),
        muted("Why founders are leaving Lisbon for Spain's quiet capital.", {
          paddingBottom: 16,
        }),
      ]),
      mod("cta.subscribe_share", "Forward to a friend", [
        divider({ paddingTop: 8, paddingBottom: 8 }),
        text("Liked this? Forward it to a friend.", {
          align: "center",
          paddingTop: 16,
          paddingBottom: 12,
        }),
        button("Share The Weekly", "#"),
        spacer(16),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("© 2026 The Weekly · 350 Madison Ave · NY 10017", {
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
