import type { ModuleDefinition } from "./registry";
import { text, image, button, mod, divider, heading, muted, eyebrow, spacer, product, productGrid, PLACEHOLDER } from "./helpers";

export const featureModules: ModuleDefinition[] = [
  {
    type: "feature.list",
    category: "feature",
    name: "Checkmark Feature List",
    description: "Centered title with 3-4 short checkmarked benefits. Good for product newsletters and onboarding emails.",
    tags: ["features", "benefits", "checkmarks", "list"],
    create: () =>
      mod("feature.list", "Feature List", [
        heading("Why people love it", { align: "center", paddingTop: 24 }),
        text("✓ Fast and reliable", { align: "center" }),
        text("✓ Beautiful out of the box", { align: "center" }),
        text("✓ Backed by humans, not bots", { align: "center", paddingBottom: 24 }),
      ]),
  },
  {
    type: "feature.icon_three",
    category: "feature",
    name: "Three Icon Features",
    description: "Three stacked feature blocks with an emoji/icon, short title and one-line description. Use to highlight 3 product capabilities.",
    tags: ["features", "icons", "three-up", "product"],
    create: () =>
      mod("feature.icon_three", "Three Features", [
        text("⚡", { align: "center", fontSize: 32, paddingTop: 24, paddingBottom: 4 }),
        text("Fast", { align: "center", fontWeight: "bold", paddingBottom: 2 }),
        muted("Built to render in milliseconds.", { align: "center", fontSize: 14 }),
        spacer(16),
        text("🧩", { align: "center", fontSize: 32, paddingBottom: 4 }),
        text("Modular", { align: "center", fontWeight: "bold", paddingBottom: 2 }),
        muted("Compose any layout from blocks.", { align: "center", fontSize: 14 }),
        spacer(16),
        text("🤖", { align: "center", fontSize: 32, paddingBottom: 4 }),
        text("AI-ready", { align: "center", fontWeight: "bold", paddingBottom: 2 }),
        muted("Edit emails as JSON, not HTML.", { align: "center", fontSize: 14, paddingBottom: 24 }),
      ]),
  },
  {
    type: "feature.before_after",
    category: "feature",
    name: "Before / After",
    description: "Two stacked images labeled 'Before' and 'After'. For product transformations, redesigns and case studies.",
    tags: ["before-after", "comparison", "case-study", "transformation"],
    create: () =>
      mod("feature.before_after", "Before / After", [
        eyebrow("Before"),
        image(PLACEHOLDER(560, 280, "Before"), "Before", { width: 560 }),
        spacer(8),
        eyebrow("After"),
        image(PLACEHOLDER(560, 280, "After"), "After", { width: 560 }),
        spacer(16),
      ]),
  },
  {
    type: "feature.benefit_pair",
    category: "feature",
    name: "Image + Benefit Pair",
    description: "Repeat-use block: one supporting image plus a title and benefit paragraph beside it. Stack 2-3 of these for a feature tour.",
    tags: ["benefit", "feature", "image-text", "pair"],
    create: () =>
      mod("feature.benefit_pair", "Benefit Pair", [
        image(PLACEHOLDER(560, 240, "Feature"), "Feature", { width: 560, paddingTop: 16 }),
        heading("Send 10x faster", { paddingTop: 12, paddingBottom: 4 }),
        text("Reusable modules and theme tokens let teams ship campaigns in minutes, not days.", { paddingBottom: 24 }),
      ]),
  },
  {
    type: "feature.testimonial",
    category: "feature",
    name: "Testimonial",
    description: "Customer quote in large type with avatar and attribution. Social proof block.",
    tags: ["testimonial", "review", "social-proof", "customer"],
    create: () =>
      mod("feature.testimonial", "Testimonial", [
        text("\u201cThis cut our email production from a week to an afternoon.\u201d", {
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          align: "center",
          paddingTop: 24,
          paddingBottom: 12,
          lineHeight: 1.4,
        }),
        image(PLACEHOLDER(56, 56, "👤"), "Customer", { width: 56, borderRadius: 28 }),
        text("Alex Kim · Head of Lifecycle, Acme", {
          align: "center",
          color: "{colors.muted}",
          fontSize: 13,
          paddingTop: 4,
          paddingBottom: 24,
        }),
      ]),
  },
  {
    type: "feature.logo_strip",
    category: "feature",
    name: "Customer Logo Strip",
    description: "Small horizontal row implying customer logos for credibility ('Trusted by'). Logos shown as a placeholder image.",
    tags: ["logos", "trusted-by", "social-proof", "strip"],
    create: () =>
      mod("feature.logo_strip", "Logo Strip", [
        muted("TRUSTED BY", { align: "center", fontSize: 11 }),
        image(PLACEHOLDER(520, 60, "LOGOS"), "Customer logos", { width: 520, paddingTop: 8, paddingBottom: 16 }),
      ]),
  },
  // ---------- Additional feature blocks ----------
  {
    type: "feature.gradient_hero",
    category: "feature",
    name: "Gradient Hero CTA",
    description: "Bold centered hero with an eyebrow, oversized headline and a primary CTA button. Great for launch announcements and campaign openers.",
    tags: ["hero", "launch", "cta", "bold", "announcement"],
    create: () =>
      mod(
        "feature.gradient_hero",
        "Gradient Hero CTA",
        [
          eyebrow("Introducing", { align: "center" }),
          heading("Something new is here", {
            level: 1,
            align: "center",
            paddingTop: 4,
            paddingBottom: 8,
          }),
          text("A fresh way to reach your audience — crafted for the inbox.", {
            align: "center",
            color: "{colors.muted}",
            fontSize: 16,
            paddingBottom: 20,
          }),
          button("Explore now", "#", { align: "center" }),
        ],
        { backgroundColor: "{colors.surface}", paddingTop: 40, paddingBottom: 40 }
      ),
  },
  {
    type: "feature.pull_quote",
    category: "feature",
    name: "Pull Quote",
    description: "Large centered quotation with an attribution line. Use to highlight a testimonial or a memorable line.",
    tags: ["quote", "testimonial", "highlight", "pull-quote"],
    create: () =>
      mod("feature.pull_quote", "Pull Quote", [
        text("\u201cThis is the fastest we\u2019ve ever shipped a campaign.\u201d", {
          fontFamily: "{fonts.heading}",
          fontSize: 24,
          align: "center",
          lineHeight: 1.4,
          paddingTop: 28,
          paddingBottom: 8,
        }),
        muted("— A very happy customer", { align: "center", paddingBottom: 28 }),
      ]),
  },
  {
    type: "feature.stat_row",
    category: "feature",
    name: "Stat Row",
    description: "Three short number + label pairs in a row. Use to show traction, metrics or highlights.",
    tags: ["stats", "metrics", "numbers", "row", "kpi"],
    create: () =>
      mod("feature.stat_row", "Stat Row", [
        heading("By the numbers", { align: "center", paddingTop: 24 }),
        text(
          "<b>10k+</b> subscribers &nbsp;\u00b7&nbsp; <b>98%</b> delivery &nbsp;\u00b7&nbsp; <b>4.9\u2605</b> rating",
          { align: "center", color: "{colors.muted}", paddingBottom: 24 }
        ),
      ]),
  },
  {
    type: "feature.single_product_spotlight",
    category: "feature",
    name: "Single Product Spotlight",
    description: "One product with image, name, price and buy button. Use to feature a hero product in a feature-focused email.",
    tags: ["product", "spotlight", "single", "buy", "shop", "ecommerce"],
    create: () =>
      mod("feature.single_product_spotlight", "Product Spotlight", [
        productGrid(
          [
            product({
              name: "The Signature Bag",
              finalPrice: "$129",
              oldPrice: "$159",
              description: "Handmade, built to last.",
              image: PLACEHOLDER(520, 520, "Product"),
            }),
          ],
          { columns: 1, showDescription: true, buttonLabel: "Buy now" }
        ),
      ]),
  },
  {
    type: "feature.pill_nav",
    category: "feature",
    name: "Pill Navigation",
    description: "Centered row of navigation links with a divider below. Compact feature nav block for use inside email content sections.",
    tags: ["menu", "nav", "links", "pill"],
    create: () =>
      mod("feature.pill_nav", "Pill Navigation", [
        image(PLACEHOLDER(120, 32, "LOGO"), "Logo", { width: 120, paddingBottom: 8 }),
        text(
          '<a href="#">Shop</a> &nbsp; <a href="#">New</a> &nbsp; <a href="#">Sale</a> &nbsp; <a href="#">About</a>',
          { align: "center", color: "{colors.primary}", paddingBottom: 8 }
        ),
        divider({ paddingTop: 4, paddingBottom: 0 }),
      ]),
  },
];
