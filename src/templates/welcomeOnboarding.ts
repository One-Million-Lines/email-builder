import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { minimalSaaS } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  button,
  divider,
  heading,
  muted,
  PLACEHOLDER,
  image,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "welcome-onboarding",
  name: "SaaS Welcome & Onboarding",
  category: "onboarding",
  description:
    "First-touch SaaS welcome with a personal note, a 3-step getting-started checklist, and a CTA to the app.",
  tags: ["welcome", "onboarding", "saas", "checklist"],
  thumbnail: "https://placehold.co/600x800/F4F5F7/2563EB?text=Welcome",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Welcome to Acme",
      previewText: "Three quick steps to get the most out of Acme.",
    },
    theme: minimalSaaS,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Logo", [
        image(PLACEHOLDER(120, 40, "ACME"), "Acme", { width: 120, paddingTop: 24 }),
      ]),
      mod("hero.welcome", "Welcome", [
        heading("Welcome aboard, friend 👋", {
          align: "center",
          fontSize: 28,
          paddingTop: 8,
          paddingBottom: 8,
        }),
        text(
          "I'm Maya, the founder of Acme. Thanks for signing up — I wanted to send you a quick note (and a 3-step checklist) so you get value fast.",
          { align: "center", paddingBottom: 24 }
        ),
      ]),
      mod("content.checklist", "Checklist", [
        text("✅ 1. Connect your data", { fontWeight: "bold", paddingTop: 8, paddingBottom: 4 }),
        muted("Hook up Stripe, HubSpot or Salesforce in 30 seconds.", { paddingBottom: 12 }),
        divider({ paddingTop: 4, paddingBottom: 4 }),
        text("⚡ 2. Run your first report", { fontWeight: "bold", paddingTop: 4, paddingBottom: 4 }),
        muted("Pick a template, click Run, watch the magic.", { paddingBottom: 12 }),
        divider({ paddingTop: 4, paddingBottom: 4 }),
        text("👯 3. Invite a teammate", { fontWeight: "bold", paddingTop: 4, paddingBottom: 4 }),
        muted("Acme is more fun (and useful) with your team.", { paddingBottom: 16 }),
      ]),
      mod("cta.app", "Open the app", [
        button("Open Acme", "#"),
        spacer(8),
        muted("Or reply to this email — a real human will read it.", { align: "center", paddingBottom: 24 }),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme, Inc · 100 Market St · San Francisco, CA", {
            align: "center",
            paddingTop: 16,
          }),
          muted("Manage notifications · Unsubscribe", {
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
