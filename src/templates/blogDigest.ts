import type { EmailDocument } from "../core/types";
import { templateRegistry, type TemplateDefinition } from "./registry";
import { newsletterEditorial } from "../themes/defaultThemes";
import {
  mod,
  text,
  spacer,
  image,
  divider,
  heading,
  muted,
  PLACEHOLDER,
} from "../modules/helpers";

const def: TemplateDefinition = {
  id: "blog-digest",
  name: "Blog / Publishing Digest",
  category: "publishing",
  description:
    "Editorial digest of three blog posts: each with a thumbnail, title, dek and read-link. Best for media and creators.",
  tags: ["blog", "digest", "publishing", "media"],
  thumbnail: "https://placehold.co/600x800/FAFAF9/111827?text=Blog+Digest",
  build: (): EmailDocument => ({
    version: "1.0",
    meta: {
      name: "This week on the blog",
      previewText: "Three new pieces — including our deep dive on micro-SaaS in 2026.",
    },
    theme: newsletterEditorial,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [
      mod("header.publication", "Publication header", [
        text("THE LEDGER", {
          align: "center",
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          fontWeight: "bold",
          letterSpacing: 6,
          paddingTop: 32,
          paddingBottom: 4,
        }),
        muted("Notes on building, weekly", { align: "center", paddingBottom: 24 }),
        divider({ paddingTop: 0, paddingBottom: 0 }),
      ]),
      post(
        "Micro-SaaS in 2026: smaller, sharper, more profitable",
        "Why the next wave of indie founders is winning by going narrower than you think.",
        "Maya Chen · 8 min read",
        PLACEHOLDER(560, 280, "Post+1")
      ),
      post(
        "Stop A/B testing your homepage",
        "An evidence-based case for spending that energy on your activation flow instead.",
        "Jordan Lee · 6 min read",
        PLACEHOLDER(560, 280, "Post+2")
      ),
      post(
        "The five-line founder check-in",
        "A weekly journaling pattern that keeps the team aligned and the founder sane.",
        "Sam Park · 4 min read",
        PLACEHOLDER(560, 280, "Post+3")
      ),
      mod(
        "footer.simple",
        "Footer",
        [
          muted("The Ledger · Published Tuesdays", {
            align: "center",
            paddingTop: 16,
          }),
          muted("© 2026 · Manage subscription · Unsubscribe", {
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

function post(title: string, dek: string, byline: string, img: string) {
  return mod("content.post", "Post", [
    image(img, title, { width: 560, paddingTop: 24, paddingBottom: 16 }),
    heading(title, { fontSize: 24, paddingBottom: 8 }),
    text(dek, { paddingBottom: 8 }),
    muted(byline, { paddingBottom: 4 }),
    text("Read the full post →", {
      color: "{colors.primary}",
      fontWeight: "bold",
      link: "#",
      paddingTop: 4,
      paddingBottom: 8,
    }),
    spacer(8),
  ]);
}

templateRegistry.register(def);
export default def;
