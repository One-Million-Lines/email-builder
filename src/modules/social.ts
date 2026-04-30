import type { ModuleDefinition } from "./registry";
import { text, mod, image, eyebrow, PLACEHOLDER, muted, spacer } from "./helpers";

export const socialModules: ModuleDefinition[] = [
  {
    type: "social.icons",
    category: "social",
    name: "Social Icons Row",
    description: "Centered 'Follow us' label with text-link icons in a row. Light footer-style social block.",
    tags: ["social", "follow", "icons", "row"],
    create: () =>
      mod("social.icons", "Social Icons", [
        muted("Follow us", { align: "center" }),
        text("Twitter · Instagram · LinkedIn · YouTube", {
          align: "center",
          color: "{colors.primary}",
          paddingBottom: 16,
        }),
      ]),
  },
  {
    type: "social.share",
    category: "social",
    name: "Share This Email",
    description: "'Share this email' bar with Forward · Tweet · Share text links. Used at the end of newsletters.",
    tags: ["social", "share", "forward", "viral"],
    create: () =>
      mod("social.share", "Share Bar", [
        text("Share this email", { align: "center", paddingTop: 8 }),
        text("Forward · Tweet · Share", {
          align: "center",
          color: "{colors.primary}",
          paddingBottom: 8,
        }),
      ]),
  },
  {
    type: "social.featured_post",
    category: "social",
    name: "Featured Social Post",
    description: "Embed-style preview of a single social post: avatar, name, post text and a link to view it on the platform.",
    tags: ["social", "post", "embed", "twitter", "instagram"],
    create: () =>
      mod(
        "social.featured_post",
        "Social Post",
        [
          eyebrow("From the community"),
          image(PLACEHOLDER(48, 48, "👤"), "Avatar", { width: 48, borderRadius: 24 }),
          text("@maker · 2h", { color: "{colors.muted}", fontSize: 13, paddingTop: 4, paddingBottom: 4 }),
          text("\"Just shipped my newsletter using OpenPostcards. Honestly the smoothest email build I've ever done.\"", {
            paddingBottom: 8,
            lineHeight: 1.6,
          }),
          text("View on Twitter →", { color: "{colors.primary}", paddingBottom: 16, link: "#" }),
        ]
      ),
  },
  {
    type: "social.instagram_grid",
    category: "social",
    name: "Instagram Grid",
    description: "3 small square thumbnails in a row representing recent Instagram posts, with handle and link.",
    tags: ["social", "instagram", "grid", "thumbnails"],
    create: () =>
      mod("social.instagram_grid", "IG Grid", [
        muted("@youraccount on Instagram", { align: "center" }),
        image(PLACEHOLDER(180, 180, "1"), "Post 1", { width: 180 }),
        image(PLACEHOLDER(180, 180, "2"), "Post 2", { width: 180 }),
        image(PLACEHOLDER(180, 180, "3"), "Post 3", { width: 180 }),
        text("View profile →", { align: "center", color: "{colors.primary}", paddingTop: 8, paddingBottom: 16, link: "#" }),
      ]),
  },
  {
    type: "social.community_stats",
    category: "social",
    name: "Community Stats",
    description: "Short '12k Twitter · 4k IG · 2k YT' style row used to show following sizes.",
    tags: ["social", "stats", "community", "following"],
    create: () =>
      mod("social.community_stats", "Community Stats", [
        eyebrow("Join the community", { align: "center" }),
        text("12k Twitter · 4k Instagram · 2k YouTube", { align: "center", paddingBottom: 16 }),
        spacer(8),
      ]),
  },
];
