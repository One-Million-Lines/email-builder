import type { ModuleDefinition } from "./registry";
import { text, image, mod, heading, muted, eyebrow, spacer, PLACEHOLDER } from "./helpers";

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
        text("“This cut our email production from a week to an afternoon.”", {
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
];
