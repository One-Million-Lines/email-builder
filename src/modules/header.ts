import type { ModuleDefinition } from "./registry";
import { text, image, mod, divider, PLACEHOLDER } from "./helpers";

export const headerModules: ModuleDefinition[] = [
  {
    type: "header.logo",
    category: "header",
    name: "Logo Centered",
    description: "Centered brand logo. The simplest header used at the top of almost every newsletter.",
    tags: ["logo", "brand", "centered"],
    create: () =>
      mod("header.logo", "Logo Header", [
        image(PLACEHOLDER(180, 56, "LOGO"), "Logo", { width: 180, paddingTop: 24, paddingBottom: 24 }),
      ]),
  },
  {
    type: "header.logo_left_date_right",
    category: "header",
    name: "Logo Left + Date Right",
    description: "Two-column header with logo on the left and a date or issue label on the right. Common for periodical newsletters and digests.",
    tags: ["logo", "date", "issue", "publication", "newsletter"],
    create: () =>
      mod("header.logo_left_date_right", "Logo + Date", [
        image(PLACEHOLDER(140, 36, "LOGO"), "Logo", { width: 140, align: "left", paddingTop: 16, paddingBottom: 16 }),
        text("Issue #128 · April 29, 2026", {
          color: "{colors.muted}",
          fontSize: 13,
          align: "right",
          paddingTop: 0,
          paddingBottom: 16,
        }),
        divider({ paddingTop: 0, paddingBottom: 0 }),
      ]),
  },
  {
    type: "header.publication",
    category: "header",
    name: "Publication Masthead",
    description: "Editorial masthead with publication name in serif type, tagline, and a divider. Mimics print magazine and newspaper newsletters.",
    tags: ["masthead", "publication", "editorial", "serif", "newspaper", "magazine"],
    create: () =>
      mod(
        "header.publication",
        "Masthead",
        [
          text("THE WEEKLY", {
            fontFamily: "{fonts.heading}",
            fontSize: 36,
            fontWeight: "bold",
            align: "center",
            letterSpacing: 6,
            paddingTop: 32,
            paddingBottom: 4,
          }),
          text("Curated reading for thoughtful people", {
            color: "{colors.muted}",
            align: "center",
            fontSize: 13,
            paddingBottom: 16,
          }),
          divider({ paddingTop: 0, paddingBottom: 0 }),
        ]
      ),
  },
  {
    type: "header.hero",
    category: "header",
    name: "Hero with Headline & Image",
    description: "Big headline, subtitle and a wide hero image. Use for the lead story or campaign announcement.",
    tags: ["hero", "headline", "image", "lead", "feature"],
    create: () =>
      mod("header.hero", "Hero", [
        text("Steps Towards a Greener World", {
          role: "headline",
          fontFamily: "{fonts.heading}",
          fontSize: 36,
          fontWeight: "bold",
          align: "center",
          paddingTop: 32,
          lineHeight: 1.2,
        }),
        text("Small actions, big impact.", {
          color: "{colors.muted}",
          align: "center",
          paddingBottom: 16,
        }),
        image(PLACEHOLDER(560, 280, "Hero"), "Hero", { width: 560 }),
      ]),
  },
  {
    type: "header.hero_text_only",
    category: "header",
    name: "Hero Text Only",
    description: "Centered eyebrow + large headline + supporting paragraph, no image. Editorial intro for opinion or essay newsletters.",
    tags: ["hero", "text", "essay", "editorial", "minimal"],
    create: () =>
      mod("header.hero_text_only", "Hero Text", [
        text("ESSAY · ISSUE 42", {
          fontSize: 12,
          fontWeight: "bold",
          color: "{colors.primary}",
          letterSpacing: 3,
          align: "center",
          paddingTop: 32,
          paddingBottom: 8,
        }),
        text("On building things slowly", {
          role: "headline",
          fontFamily: "{fonts.heading}",
          fontSize: 40,
          fontWeight: "bold",
          align: "center",
          lineHeight: 1.15,
          paddingBottom: 8,
        }),
        text("Why patience and craft still win in a world of shortcuts.", {
          color: "{colors.muted}",
          align: "center",
          fontSize: 16,
          paddingBottom: 32,
        }),
      ]),
  },
  {
    type: "header.announcement",
    category: "header",
    name: "Announcement Bar",
    description: "Thin colored top bar with a single line of promotional text. Use for free shipping, sales, or alerts.",
    tags: ["announcement", "bar", "promo", "alert"],
    create: () =>
      mod(
        "header.announcement",
        "Announcement",
        [
          text("✨ Free shipping on orders over $50", {
            color: "{colors.buttonText}",
            align: "center",
            fontSize: 14,
            paddingTop: 12,
            paddingBottom: 12,
          }),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "header.logo_with_view_browser",
    category: "header",
    name: "Logo + View in Browser",
    description: "Logo with a small 'View in browser' link above it. Standard for marketing newsletters that may render poorly.",
    tags: ["logo", "view-in-browser", "marketing", "preheader"],
    create: () =>
      mod("header.logo_with_view_browser", "Logo + Browser Link", [
        text("View in browser", {
          color: "{colors.muted}",
          fontSize: 11,
          align: "right",
          paddingTop: 8,
          paddingBottom: 0,
          link: "#",
        }),
        image(PLACEHOLDER(160, 48, "LOGO"), "Logo", { width: 160, paddingTop: 8, paddingBottom: 16 }),
      ]),
  },
  {
    type: "header.welcome",
    category: "header",
    name: "Welcome Header",
    description: "Friendly greeting with first name placeholder, used at the top of welcome and onboarding emails.",
    tags: ["welcome", "onboarding", "greeting", "personalized"],
    create: () =>
      mod("header.welcome", "Welcome", [
        text("👋 Welcome aboard, {{first_name}}", {
          fontFamily: "{fonts.heading}",
          fontSize: 28,
          fontWeight: "bold",
          align: "center",
          paddingTop: 32,
          paddingBottom: 8,
        }),
        text("We're glad you're here. Here's what to do next.", {
          color: "{colors.muted}",
          align: "center",
          paddingBottom: 16,
        }),
      ]),
  },
  {
    type: "header.logo_with_tagline",
    category: "header",
    name: "Logo + Tagline",
    description: "Centered logo above a one-line tagline. Friendly brand-forward header.",
    tags: ["logo", "tagline", "brand"],
    create: () =>
      mod("header.logo_with_tagline", "Logo + Tagline", [
        image(PLACEHOLDER(160, 48, "LOGO"), "Logo", { width: 160, paddingTop: 24, paddingBottom: 4 }),
        text("Newsletters that respect your time.", {
          align: "center",
          color: "{colors.muted}",
          fontSize: 14,
          paddingBottom: 24,
        }),
      ]),
  },
  {
    type: "header.story_label",
    category: "header",
    name: "Story Label Header",
    description: "Small category label (e.g. 'Top story', 'Deep dive') above the masthead. Used by The Hustle, Morning Brew style newsletters.",
    tags: ["label", "category", "story", "newsletter", "topic"],
    create: () =>
      mod("header.story_label", "Story Label", [
        text("TODAY'S TOP STORY", {
          color: "{colors.primary}",
          fontSize: 12,
          fontWeight: "bold",
          letterSpacing: 3,
          align: "center",
          paddingTop: 24,
          paddingBottom: 4,
        }),
        text("AI editing tools come for the inbox", {
          fontFamily: "{fonts.heading}",
          fontSize: 28,
          fontWeight: "bold",
          align: "center",
          paddingBottom: 16,
          lineHeight: 1.2,
        }),
      ]),
  },
];
