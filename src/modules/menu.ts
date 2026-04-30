import type { ModuleDefinition } from "./registry";
import { text, mod, divider } from "./helpers";

export const menuModules: ModuleDefinition[] = [
  {
    type: "menu.horizontal",
    category: "menu",
    name: "Horizontal Nav",
    description: "Horizontal menu with 3-5 inline links separated by dots. Common publication navigation under the masthead.",
    tags: ["menu", "nav", "horizontal", "publication"],
    create: () =>
      mod("menu.horizontal", "Horizontal Menu", [
        text("Home · Articles · Podcast · About · Subscribe", {
          align: "center",
          color: "{colors.text}",
          fontSize: 13,
          paddingTop: 12,
          paddingBottom: 12,
        }),
      ]),
  },
  {
    type: "menu.sections",
    category: "menu",
    name: "Section Tabs",
    description: "Linked section labels representing the contents of today's issue (e.g. News · Markets · Tech · Culture). Used by daily digests.",
    tags: ["menu", "sections", "tabs", "digest", "daily"],
    create: () =>
      mod("menu.sections", "Section Tabs", [
        divider({ paddingTop: 0, paddingBottom: 8 }),
        text("NEWS · MARKETS · TECH · CULTURE · WEEKEND", {
          align: "center",
          color: "{colors.primary}",
          fontSize: 11,
          fontWeight: "bold",
          letterSpacing: 2,
          paddingTop: 0,
          paddingBottom: 8,
        }),
        divider({ paddingTop: 0, paddingBottom: 8 }),
      ]),
  },
  {
    type: "menu.in_this_issue",
    category: "menu",
    name: "In This Issue",
    description: "Table-of-contents box listing the items in this newsletter issue with anchor links. Helps readers scan long emails.",
    tags: ["toc", "menu", "issue", "summary", "table of contents"],
    create: () =>
      mod(
        "menu.in_this_issue",
        "In This Issue",
        [
          text("IN THIS ISSUE", {
            fontSize: 11,
            fontWeight: "bold",
            color: "{colors.muted}",
            letterSpacing: 2,
            paddingTop: 16,
            paddingBottom: 8,
          }),
          text("→ Lead story: AI in the inbox", { fontSize: 14, paddingTop: 2, paddingBottom: 2, link: "#lead" }),
          text("→ 3 things worth your time", { fontSize: 14, paddingTop: 2, paddingBottom: 2, link: "#picks" }),
          text("→ Reader question of the week", { fontSize: 14, paddingTop: 2, paddingBottom: 2, link: "#qa" }),
          text("→ Upcoming events", { fontSize: 14, paddingTop: 2, paddingBottom: 16, link: "#events" }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 }
      ),
  },
  {
    type: "menu.cta_strip",
    category: "menu",
    name: "Linked Action Strip",
    description: "Three short text actions in a row (e.g. 'Read · Share · Reply'). Light alternative to a button bar.",
    tags: ["menu", "actions", "links", "strip"],
    create: () =>
      mod("menu.cta_strip", "Action Strip", [
        text("Read online · Share · Reply with feedback", {
          align: "center",
          color: "{colors.primary}",
          fontSize: 13,
          paddingTop: 12,
          paddingBottom: 12,
        }),
      ]),
  },
];
