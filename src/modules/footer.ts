import type { ModuleDefinition } from "./registry";
import { text, mod, divider, image, muted, PLACEHOLDER } from "./helpers";

const baseFooterStyle = {
  backgroundColor: "{colors.background}",
  paddingTop: 0,
  paddingBottom: 0,
};

export const footerModules: ModuleDefinition[] = [
  {
    type: "footer.simple",
    category: "footer",
    name: "Simple Footer",
    description: "Minimal footer with copyright, address and unsubscribe links. The default for any newsletter.",
    tags: ["footer", "simple", "copyright", "unsubscribe"],
    create: () =>
      mod(
        "footer.simple",
        "Simple Footer",
        [
          muted("© 2026 Your Company. All rights reserved.", { align: "center", fontSize: 12 }),
          muted("123 Main St · City · Country", { align: "center", fontSize: 12 }),
          text("Unsubscribe · View in browser", {
            align: "center",
            color: "{colors.muted}",
            fontSize: 12,
            paddingTop: 4,
            paddingBottom: 24,
          }),
        ],
        { ...baseFooterStyle, paddingTop: 24 }
      ),
  },
  {
    type: "footer.social",
    category: "footer",
    name: "Footer with Social",
    description: "Footer with social links row above the legal text.",
    tags: ["footer", "social", "links"],
    create: () =>
      mod(
        "footer.social",
        "Social Footer",
        [
          text("Follow us", { align: "center", paddingTop: 24 }),
          text("Twitter · Instagram · LinkedIn", {
            align: "center",
            color: "{colors.primary}",
            paddingBottom: 12,
          }),
          divider(),
          muted("© 2026 Your Company · Unsubscribe", {
            align: "center",
            fontSize: 12,
          }),
          text(" ", { align: "center", paddingBottom: 24 }),
        ],
        baseFooterStyle
      ),
  },
  {
    type: "footer.legal",
    category: "footer",
    name: "Legal Footer",
    description: "Long-form footer with explanation of why the user is receiving the email plus privacy/terms/unsubscribe links. Used by enterprise and finance newsletters.",
    tags: ["footer", "legal", "compliance", "enterprise"],
    create: () =>
      mod(
        "footer.legal",
        "Legal Footer",
        [
          text(
            "You are receiving this email because you signed up for our newsletter. If you no longer wish to receive emails, you can unsubscribe at any time.",
            {
              align: "center",
              color: "{colors.muted}",
              fontSize: 11,
              lineHeight: 1.6,
              paddingTop: 24,
            }
          ),
          text("Privacy Policy · Terms · Unsubscribe", {
            align: "center",
            color: "{colors.muted}",
            fontSize: 11,
            paddingBottom: 24,
          }),
        ],
        baseFooterStyle
      ),
  },
  {
    type: "footer.publisher",
    category: "footer",
    name: "Publisher Footer",
    description: "Magazine-style sign-off with logo, publication name, masthead credits, address and links.",
    tags: ["footer", "publisher", "magazine", "masthead", "editorial"],
    create: () =>
      mod(
        "footer.publisher",
        "Publisher Footer",
        [
          image(PLACEHOLDER(120, 36, "LOGO"), "Logo", { width: 120, paddingTop: 24, paddingBottom: 8 }),
          text("THE WEEKLY", {
            align: "center",
            fontFamily: "{fonts.heading}",
            fontWeight: "bold",
            letterSpacing: 4,
            paddingTop: 0,
            paddingBottom: 4,
          }),
          muted("Editor: Jane Doe · Producer: Alex Kim", { align: "center", fontSize: 12 }),
          divider({ paddingTop: 12, paddingBottom: 12 }),
          muted("© 2026 The Weekly · 350 Madison Ave · NY 10017", { align: "center", fontSize: 11 }),
          text("Manage preferences · Unsubscribe", {
            align: "center",
            color: "{colors.muted}",
            fontSize: 11,
            paddingTop: 4,
            paddingBottom: 24,
          }),
        ],
        baseFooterStyle
      ),
  },
  {
    type: "footer.app_links",
    category: "footer",
    name: "Footer with App Store Badges",
    description: "Footer including 'Get the app' app-store and play-store badge images. For consumer brand newsletters.",
    tags: ["footer", "app", "download", "ios", "android"],
    create: () =>
      mod(
        "footer.app_links",
        "App Footer",
        [
          text("Get the app", { align: "center", fontWeight: "bold", paddingTop: 24, paddingBottom: 8 }),
          image(PLACEHOLDER(135, 40, "App Store"), "App Store", { width: 135, align: "center", paddingTop: 0, paddingBottom: 4 }),
          image(PLACEHOLDER(135, 40, "Google Play"), "Google Play", { width: 135, align: "center", paddingTop: 0, paddingBottom: 16 }),
          divider(),
          muted("© 2026 Your Brand · Unsubscribe", { align: "center", fontSize: 11 }),
          text(" ", { align: "center", paddingBottom: 24 }),
        ],
        baseFooterStyle
      ),
  },
  {
    type: "footer.address_only",
    category: "footer",
    name: "Address Only",
    description: "Just a centered postal address line — required for CAN-SPAM compliance when other footers are minimal.",
    tags: ["footer", "address", "compliance", "can-spam"],
    create: () =>
      mod(
        "footer.address_only",
        "Address",
        [
          muted("Your Company · 123 Main St · Brooklyn, NY 11201 · USA", {
            align: "center",
            fontSize: 11,
          }),
          text(" ", { align: "center", paddingBottom: 16 }),
        ],
        { ...baseFooterStyle, paddingTop: 16 }
      ),
  },
  {
    type: "footer.preferences",
    category: "footer",
    name: "Manage Preferences",
    description: "Footer that emphasizes preference management ('Update your preferences', 'Send less often'). Reduces unsubscribes.",
    tags: ["footer", "preferences", "frequency", "retention"],
    create: () =>
      mod(
        "footer.preferences",
        "Preferences",
        [
          text("Getting too many emails?", { align: "center", paddingTop: 24, paddingBottom: 4 }),
          text("Update your preferences · Send less often · Unsubscribe", {
            align: "center",
            color: "{colors.primary}",
            fontSize: 13,
            paddingBottom: 16,
          }),
          divider(),
          muted("© 2026 Your Company", { align: "center", fontSize: 11 }),
          text(" ", { align: "center", paddingBottom: 24 }),
        ],
        baseFooterStyle
      ),
  },
  {
    type: "footer.signature",
    category: "footer",
    name: "Signature Sign-off",
    description: "Personal hand-signed style sign-off with author name and tiny legal block. For solo creator newsletters.",
    tags: ["footer", "signature", "personal", "creator", "sign-off"],
    create: () =>
      mod(
        "footer.signature",
        "Signature",
        [
          text("Until next week,", { paddingTop: 24, paddingBottom: 4 }),
          text("— Jane", { fontFamily: "{fonts.heading}", fontSize: 22, paddingBottom: 16 }),
          divider(),
          muted("Reply directly · Unsubscribe · 123 Main St, Brooklyn", {
            fontSize: 11,
            align: "center",
          }),
          text(" ", { align: "center", paddingBottom: 24 }),
        ],
        { ...baseFooterStyle, paddingTop: 0 }
      ),
  },
];
