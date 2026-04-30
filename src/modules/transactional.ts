import type { ModuleDefinition } from "./registry";
import { text, mod, divider, button, spacer, heading, muted, image, eyebrow, PLACEHOLDER } from "./helpers";

export const transactionalModules: ModuleDefinition[] = [
  {
    type: "tx.order_summary",
    category: "transactional",
    name: "Order Summary",
    description: "Order confirmation summary: order number, line items with thumbnails and totals row. Used in post-purchase emails.",
    tags: ["order", "summary", "receipt", "post-purchase", "ecommerce"],
    create: () =>
      mod("tx.order_summary", "Order Summary", [
        eyebrow("Order #1024"),
        heading("Thanks for your order", { paddingTop: 0 }),
        muted("We'll email you again when it ships."),
        divider({ paddingTop: 16, paddingBottom: 8 }),
        text("Linen Tote Bag · 1 × $39.00", { paddingTop: 4, paddingBottom: 4 }),
        text("Ceramic Mug · 2 × $24.00", { paddingTop: 4, paddingBottom: 4 }),
        divider({ paddingTop: 8, paddingBottom: 8 }),
        text("Subtotal: $87.00", { paddingTop: 2, paddingBottom: 2 }),
        text("Shipping: $5.00", { paddingTop: 2, paddingBottom: 2 }),
        text("Total: $92.00", { fontWeight: "bold", paddingTop: 2, paddingBottom: 16 }),
      ]),
  },
  {
    type: "tx.shipping_update",
    category: "transactional",
    name: "Shipping Update",
    description: "Shipping confirmation with tracking number, carrier, expected delivery date and a Track button.",
    tags: ["shipping", "tracking", "delivery", "post-purchase"],
    create: () =>
      mod("tx.shipping_update", "Shipping Update", [
        text("📦", { align: "center", fontSize: 40, paddingTop: 24 }),
        heading("Your order is on the way", { align: "center", paddingTop: 8 }),
        muted("Carrier: USPS · Expected: May 4, 2026", { align: "center" }),
        text("Tracking: 9400 1108 ...", { align: "center", color: "{colors.muted}", fontFamily: "Menlo, Consolas, monospace", fontSize: 13 }),
        button("Track package"),
        spacer(16),
      ]),
  },
  {
    type: "tx.invoice",
    category: "transactional",
    name: "Invoice",
    description: "Itemized invoice with billing period, services and totals. Used by SaaS and B2B billing emails.",
    tags: ["invoice", "billing", "saas", "b2b", "receipt"],
    create: () =>
      mod("tx.invoice", "Invoice", [
        eyebrow("Invoice INV-2026-04"),
        heading("April 2026 invoice"),
        muted("Billed to: Acme Inc · Period: Apr 1 – Apr 30"),
        divider({ paddingTop: 16, paddingBottom: 8 }),
        text("Pro plan · $49.00", { paddingTop: 4, paddingBottom: 4 }),
        text("Add-on seats (3) · $36.00", { paddingTop: 4, paddingBottom: 4 }),
        divider({ paddingTop: 8, paddingBottom: 8 }),
        text("Total due: $85.00", { fontWeight: "bold", paddingBottom: 16 }),
        button("Download invoice (PDF)"),
        spacer(16),
      ]),
  },
  {
    type: "tx.password_reset",
    category: "transactional",
    name: "Password Reset",
    description: "Authentication email with a reset button and a fallback link. Includes 'expires in X minutes' notice.",
    tags: ["auth", "password", "reset", "security"],
    create: () =>
      mod("tx.password_reset", "Password Reset", [
        heading("Reset your password", { align: "center", paddingTop: 16 }),
        text("Click the button below to set a new password. This link expires in 30 minutes.", {
          align: "center",
          paddingBottom: 16,
        }),
        button("Reset password"),
        muted("If the button doesn't work, paste this link in your browser:", { align: "center", fontSize: 12 }),
        text("https://example.com/reset/abc123", {
          align: "center",
          color: "{colors.primary}",
          fontSize: 12,
          paddingBottom: 24,
        }),
      ]),
  },
  {
    type: "tx.verify_email",
    category: "transactional",
    name: "Verify Email",
    description: "Single-purpose 'verify your email' transactional with one centered button.",
    tags: ["auth", "verify", "email-confirmation"],
    create: () =>
      mod("tx.verify_email", "Verify Email", [
        heading("One last step", { align: "center", paddingTop: 16 }),
        text("Confirm your email address to activate your account.", { align: "center", paddingBottom: 8 }),
        button("Verify email"),
        spacer(24),
      ]),
  },
  {
    type: "tx.appointment",
    category: "transactional",
    name: "Appointment Confirmation",
    description: "Booking/meeting confirmation with date, time, location and add-to-calendar links.",
    tags: ["appointment", "booking", "calendar", "meeting"],
    create: () =>
      mod("tx.appointment", "Appointment", [
        eyebrow("Confirmed", { align: "center" }),
        heading("Your appointment is set", { align: "center", paddingTop: 0 }),
        text("Tuesday, May 12 · 10:00 AM", { align: "center", fontWeight: "bold", paddingTop: 8 }),
        muted("123 Main St, Suite 4 · Brooklyn, NY", { align: "center" }),
        button("Add to calendar"),
        spacer(16),
      ]),
  },
];
