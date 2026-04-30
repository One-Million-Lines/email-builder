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
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "order-receipt",
  name: "Order Receipt",
  category: "transactional",
  description:
    "Transactional order confirmation with order number, an itemized table, totals, shipping address and a help footer.",
  tags: ["transactional", "receipt", "order", "confirmation"],
  thumbnail: "https://placehold.co/600x800/F4F5F7/0F172A?text=Order+%23A12345",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "Your order #A12345 is confirmed",
      previewText: "Thanks for your order! Here's your receipt.",
    },
    theme: minimalSaaS,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.logo", "Logo", [
        text("ACME", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          letterSpacing: 4,
          paddingTop: 24,
          paddingBottom: 24,
        }),
      ]),
      mod("hero.confirmation", "Confirmation", [
        heading("Thanks, your order is confirmed", {
          align: "center",
          fontSize: 26,
          paddingTop: 8,
          paddingBottom: 4,
        }),
        muted("Order #A12345 · placed April 30, 2026", {
          align: "center",
          paddingBottom: 24,
        }),
      ]),
      mod("tx.items", "Items", [
        text("ITEMS", {
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: "bold",
          color: "{colors.muted}",
          paddingTop: 8,
          paddingBottom: 12,
        }),
        text("Linen Tote Bag · Natural · Qty 1", {
          fontWeight: "bold",
          paddingBottom: 4,
        }),
        muted("$39.00", { paddingBottom: 12 }),
        divider({ paddingTop: 4, paddingBottom: 4 }),
        text("Ceramic Mug · Sand · Qty 2", { fontWeight: "bold", paddingBottom: 4 }),
        muted("$48.00", { paddingBottom: 16 }),
        divider({ paddingTop: 8, paddingBottom: 12 }),
        text("Subtotal · $87.00", { align: "right", paddingBottom: 4 }),
        text("Shipping · $9.00", { align: "right", paddingBottom: 4 }),
        text("<b>Total · $96.00</b>", {
          align: "right",
          fontSize: 18,
          paddingBottom: 16,
        }),
      ]),
      mod(
        "tx.shipping",
        "Shipping address",
        [
          text("SHIPPING TO", {
            fontSize: 11,
            letterSpacing: 3,
            fontWeight: "bold",
            color: "{colors.muted}",
            paddingTop: 16,
            paddingBottom: 8,
          }),
          text("Alex Rada<br/>350 Madison Ave<br/>New York, NY 10017", {
            paddingBottom: 16,
          }),
          button("Track shipment", "#"),
          spacer(16),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0 }
      ),
      mod(
        "footer.help",
        "Help",
        [
          muted("Questions about your order? help@acme.shop", {
            align: "center",
            paddingTop: 16,
          }),
          muted("© 2026 Acme · Privacy", {
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
