import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { greenEco } from "../themes/defaultThemes";
import {
  mod,
  eyebrow,
  heading,
  image,
  muted,
  button,
  spacer,
  text,
  footerLinks,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "replenishment-reminder",
  name: "Replenishment Reminder",
  category: "ecommerce",
  description:
    "Restock-focused reminder with recent order context, a quick reorder path, and a gentle subscription nudge for repeat purchases.",
  tags: ["ecommerce", "replenishment", "reorder", "subscription", "automation"],
  thumbnail: PLACEHOLDER(600, 800, "Restock Reminder"),
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Time to restock your favorite",
      previewText: "Running low? Reordering takes one click.",
    },
    theme: greenEco,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("hero.restock", "Restock hero", [
        eyebrow("Running low?", { align: "center", paddingTop: 28 }),
        heading("Time to restock, {user.firstname}", {
          align: "center",
          fontSize: 30,
          paddingTop: 6,
          paddingBottom: 8,
        }),
        muted("We thought we'd send a nudge before you run out of the good stuff.", {
          align: "center",
          paddingBottom: 16,
        }),
      ]),
      mod("content.product_image", "Product image", [
        image(PLACEHOLDER(552, 320, "Daily Essentials Refill"), "Daily essentials refill", {
          width: 552,
          paddingTop: 0,
          paddingBottom: 12,
        }),
      ]),
      mod("content.reorder_note", "Reorder details", [
        muted("Last ordered 32 days ago · Daily Greens Blend · 1 pack", {
          align: "center",
          paddingTop: 4,
          paddingBottom: 12,
        }),
        text("Reordering now means you stay stocked without missing a beat.", {
          align: "center",
          fontWeight: "bold",
          paddingTop: 0,
          paddingBottom: 12,
        }),
        button("Reorder now"),
        spacer(8),
        muted(
          "Want one less thing to remember? Switch to subscribe & save for automatic delivery and a little extra value each month.",
          { align: "center", paddingBottom: 20 }
        ),
      ]),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("Acme Refill Club · Practical reminders, never spam", {
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
