import type { ModuleDefinition } from "./registry";
import { text, image, mod, divider, spacer, button, eyebrow, heading, muted, PLACEHOLDER } from "./helpers";

export const contentModules: ModuleDefinition[] = [
  {
    type: "content.headline_body",
    category: "content",
    name: "Headline + Body",
    description: "Section title with one paragraph of body text. The most generic written content block.",
    tags: ["headline", "body", "paragraph", "article"],
    create: () =>
      mod("content.headline_body", "Headline + Body", [
        heading("A compelling headline", { paddingTop: 24 }),
        text(
          "Tell your story with a clear, concise paragraph. Keep readers engaged with short sentences and meaningful detail.",
          { paddingBottom: 24 }
        ),
      ]),
  },
  {
    type: "content.lead_story",
    category: "content",
    name: "Lead Story",
    description: "Top story of the issue: eyebrow label, big headline, hero image, lead paragraph and a 'Continue reading' link. Used by news and editorial newsletters.",
    tags: ["lead", "story", "feature", "news", "editorial", "long-form"],
    create: () =>
      mod("content.lead_story", "Lead Story", [
        eyebrow("Lead story"),
        heading("Inside the new wave of indie publishers", { level: 1, paddingBottom: 4 }),
        muted("By Jane Doe · 6 min read", { fontSize: 13 }),
        image(PLACEHOLDER(560, 320, "Lead"), "Lead", { width: 560, paddingTop: 12 }),
        text(
          "A growing group of writers are leaving big media to build their own readerships, betting that quality and a direct relationship beat scale.",
          { paddingTop: 16 }
        ),
        text("Continue reading →", {
          color: "{colors.primary}",
          fontWeight: "bold",
          paddingTop: 4,
          paddingBottom: 24,
          link: "#",
        }),
      ]),
  },
  {
    type: "content.article_summary",
    category: "content",
    name: "Article Summary Card",
    description: "Compact link-out card: image on top, category label, title, one-line summary, and 'Read more'. Use repeatedly to list secondary articles.",
    tags: ["article", "summary", "card", "link-out", "newsletter"],
    create: () =>
      mod("content.article_summary", "Article Card", [
        image(PLACEHOLDER(560, 280, "Article"), "Article", { width: 560 }),
        text("CULTURE", {
          color: "{colors.primary}",
          fontSize: 11,
          fontWeight: "bold",
          letterSpacing: 2,
          paddingTop: 12,
          paddingBottom: 4,
        }),
        heading("How long-form writing made a comeback", { paddingTop: 0, paddingBottom: 4 }),
        text("Why subscribers are paying for slower, deeper coverage — and what it means for publishers.", {
          paddingBottom: 8,
        }),
        text("Read more →", { color: "{colors.primary}", fontWeight: "bold", paddingBottom: 24, link: "#" }),
      ]),
  },
  {
    type: "content.image_text",
    category: "content",
    name: "Image + Text Beside",
    description: "Image with article title and short summary stacked below. Standard editorial card.",
    tags: ["image", "text", "article", "stacked"],
    create: () =>
      mod("content.image_text", "Image + Text", [
        image(PLACEHOLDER(560, 300, "Article"), "Article", { width: 560 }),
        heading("Article title", { paddingTop: 16, paddingBottom: 4 }),
        text("A short summary of the article goes here, two or three lines is plenty."),
      ]),
  },
  {
    type: "content.two_column_articles",
    category: "content",
    name: "Two Column Stories",
    description: "Two short article previews shown side-by-side as stacked blocks (renders as full-width on mobile). Use to tease two related stories.",
    tags: ["two-column", "articles", "side-by-side", "preview"],
    create: () =>
      mod("content.two_column_articles", "Two Stories", [
        eyebrow("More to read"),
        image(PLACEHOLDER(272, 180, "Story A"), "Story A", { width: 272 }),
        text("Story A title", { fontWeight: "bold", paddingTop: 4, paddingBottom: 2 }),
        text("One sentence about story A.", { fontSize: 14, paddingBottom: 16 }),
        image(PLACEHOLDER(272, 180, "Story B"), "Story B", { width: 272 }),
        text("Story B title", { fontWeight: "bold", paddingTop: 4, paddingBottom: 2 }),
        text("One sentence about story B.", { fontSize: 14, paddingBottom: 16 }),
      ]),
  },
  {
    type: "content.three_picks",
    category: "content",
    name: "Three Picks (Numbered)",
    description: "Numbered list of three short recommendations or links. Used by curators ('3 things to read this week').",
    tags: ["list", "picks", "curated", "links", "recommendations"],
    create: () =>
      mod("content.three_picks", "Three Picks", [
        eyebrow("Three picks"),
        text("01 / How to stay focused in 2026", {
          fontFamily: "{fonts.heading}",
          fontSize: 18,
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
          link: "#",
        }),
        muted("Notes on attention, deep work, and the slow internet.", { fontSize: 14 }),
        divider({ paddingTop: 12, paddingBottom: 8 }),
        text("02 / The case for boring software", {
          fontFamily: "{fonts.heading}",
          fontSize: 18,
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
          link: "#",
        }),
        muted("Why teams are returning to simpler, predictable tools.", { fontSize: 14 }),
        divider({ paddingTop: 12, paddingBottom: 8 }),
        text("03 / A short history of the inbox", {
          fontFamily: "{fonts.heading}",
          fontSize: 18,
          fontWeight: "bold",
          paddingTop: 8,
          paddingBottom: 4,
          link: "#",
        }),
        muted("From memos to MIME, and what comes next.", { fontSize: 14, paddingBottom: 24 }),
      ]),
  },
  {
    type: "content.quote",
    category: "content",
    name: "Pull Quote",
    description: "Centered serif pull quote with attribution. Adds rhythm to long editorial newsletters.",
    tags: ["quote", "pull-quote", "editorial", "attribution"],
    create: () =>
      mod("content.quote", "Pull Quote", [
        text("“The best way to predict the future is to create it.”", {
          fontFamily: "{fonts.heading}",
          fontSize: 22,
          align: "center",
          paddingTop: 24,
          lineHeight: 1.4,
        }),
        text("— Peter Drucker", { color: "{colors.muted}", align: "center", paddingBottom: 24 }),
      ]),
  },
  {
    type: "content.author_byline",
    category: "content",
    name: "Author Byline",
    description: "Round avatar + author name + role on one line. Drop above or below an article body for personal newsletters.",
    tags: ["author", "byline", "avatar", "personal"],
    create: () =>
      mod("content.author_byline", "Byline", [
        image(PLACEHOLDER(64, 64, "👤"), "Author", { width: 64, borderRadius: 32, paddingTop: 16, paddingBottom: 0 }),
        text("Jane Doe", { align: "center", fontWeight: "bold", paddingTop: 8, paddingBottom: 0 }),
        muted("Editor, The Weekly", { align: "center", fontSize: 13 }),
        spacer(16),
      ]),
  },
  {
    type: "content.editor_note",
    category: "content",
    name: "Editor's Note",
    description: "Personal letter-style block: 'Hi {{first_name}}', a few paragraphs and a sign-off. Ideal for newsletters with a strong author voice.",
    tags: ["editor", "note", "letter", "personal", "voice"],
    create: () =>
      mod("content.editor_note", "Editor's Note", [
        text("Hi {{first_name}},", { paddingTop: 24, paddingBottom: 8 }),
        text(
          "This week I've been thinking about what makes a newsletter feel like a letter rather than a broadcast. Spoiler: it's not the format, it's the tone.",
          { paddingBottom: 8, lineHeight: 1.7 }
        ),
        text("Let me know what you think — just hit reply.", { paddingBottom: 8, lineHeight: 1.7 }),
        text("— Jane", { fontFamily: "{fonts.heading}", paddingBottom: 24 }),
      ]),
  },
  {
    type: "content.tip_box",
    category: "content",
    name: "Tip / Callout Box",
    description: "Highlighted background box with an icon, short title and one-paragraph tip. Use for 'pro tips', notes, and warnings.",
    tags: ["tip", "callout", "box", "highlight", "note"],
    create: () =>
      mod(
        "content.tip_box",
        "Tip Box",
        [
          text("💡 PRO TIP", {
            color: "{colors.primary}",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: 2,
            paddingTop: 16,
            paddingBottom: 4,
          }),
          text("Always preview your email on mobile before sending — most opens happen there.", { paddingBottom: 16 }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0, paddingLeft: 16, paddingRight: 16 }
      ),
  },
  {
    type: "content.numbered_list",
    category: "content",
    name: "Numbered List",
    description: "Vertical numbered list of 4-5 short items with optional sub-text. Use for tutorials, checklists and 'how-to' newsletters.",
    tags: ["list", "numbered", "tutorial", "checklist", "how-to"],
    create: () =>
      mod("content.numbered_list", "Numbered List", [
        heading("How to do it in 4 steps", { paddingTop: 16, paddingBottom: 12 }),
        text("1. Define the goal", { fontWeight: "bold", paddingTop: 4, paddingBottom: 2 }),
        muted("Write down the outcome in one sentence."),
        text("2. List constraints", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("Time, budget, scope. Be specific."),
        text("3. Plan the smallest version", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("What can you ship this week?"),
        text("4. Ship it", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("Refine after real feedback.", { fontSize: 14 }),
        spacer(16),
      ]),
  },
  {
    type: "content.bullet_list",
    category: "content",
    name: "Bullet List",
    description: "Simple unordered list of takeaways or facts. Concise summary block.",
    tags: ["list", "bullets", "takeaways", "summary"],
    create: () =>
      mod("content.bullet_list", "Bullets", [
        heading("Key takeaways", { paddingTop: 16, paddingBottom: 8 }),
        text("• Newsletters are growing 20% YoY", { paddingTop: 2, paddingBottom: 2 }),
        text("• Mobile opens crossed 70%", { paddingTop: 2, paddingBottom: 2 }),
        text("• Plain-text emails outperform image-heavy ones in B2B", { paddingTop: 2, paddingBottom: 2 }),
        text("• Personalization drives 2x click-through", { paddingTop: 2, paddingBottom: 16 }),
      ]),
  },
  {
    type: "content.qa",
    category: "content",
    name: "Q&A Block",
    description: "Question in bold followed by an answer paragraph. Use for FAQ, reader mailbags, or AMAs.",
    tags: ["qa", "faq", "ama", "mailbag", "reader-questions"],
    create: () =>
      mod("content.qa", "Q&A", [
        eyebrow("Reader question"),
        text("Q: How do I get my first 100 subscribers?", {
          fontFamily: "{fonts.heading}",
          fontSize: 18,
          fontWeight: "bold",
          paddingTop: 4,
          paddingBottom: 8,
          lineHeight: 1.3,
        }),
        text(
          "A: Tell ten people who already know you. Then ask each of them to forward to one friend. The first 100 don't come from algorithms — they come from your network.",
          { paddingBottom: 24, lineHeight: 1.7 }
        ),
      ]),
  },
  {
    type: "content.stats_row",
    category: "content",
    name: "Stat Row",
    description: "Big numbers with short labels (e.g. '12k readers · 4.8★ rating · 96% open rate'). Used for impact summaries and social proof.",
    tags: ["stats", "numbers", "metrics", "social-proof"],
    create: () =>
      mod(
        "content.stats_row",
        "Stat Row",
        [
          eyebrow("By the numbers", { align: "center" }),
          text("12,400", {
            fontFamily: "{fonts.heading}",
            fontSize: 36,
            fontWeight: "bold",
            align: "center",
            color: "{colors.primary}",
            paddingTop: 4,
            paddingBottom: 0,
          }),
          muted("active readers this month", { align: "center", fontSize: 13 }),
          spacer(8),
          text("96% · 4.8★ · 32 issues shipped", {
            align: "center",
            color: "{colors.text}",
            fontSize: 14,
            paddingBottom: 24,
          }),
        ]
      ),
  },
  {
    type: "content.timeline",
    category: "content",
    name: "Timeline / What Happened",
    description: "Chronological list of recent events with dates. Used by news roundups and changelog newsletters.",
    tags: ["timeline", "changelog", "news", "events", "what-happened"],
    create: () =>
      mod("content.timeline", "Timeline", [
        eyebrow("This week"),
        text("Mon · Acme launches plan B", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("After 6 months of beta testing.", { fontSize: 14 }),
        text("Wed · New funding round announced", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("$24M Series A led by Foundry.", { fontSize: 14 }),
        text("Fri · Industry report drops", { fontWeight: "bold", paddingTop: 8, paddingBottom: 2 }),
        muted("Open rates up across the board.", { fontSize: 14, paddingBottom: 24 }),
      ]),
  },
  {
    type: "content.podcast_episode",
    category: "content",
    name: "Podcast Episode",
    description: "Episode artwork, episode number, title, short description and a 'Listen' button. For shows that announce episodes by email.",
    tags: ["podcast", "episode", "audio", "listen", "show"],
    create: () =>
      mod("content.podcast_episode", "Podcast Episode", [
        image(PLACEHOLDER(220, 220, "Cover"), "Cover", { width: 220, borderRadius: 12 }),
        text("EPISODE 042", {
          color: "{colors.primary}",
          fontSize: 11,
          fontWeight: "bold",
          letterSpacing: 2,
          align: "center",
          paddingTop: 12,
          paddingBottom: 4,
        }),
        heading("Why publishers are betting on email", { align: "center", paddingTop: 0, paddingBottom: 4 }),
        muted("With Jane Doe · 38 min", { align: "center", fontSize: 13 }),
        button("Listen now", "https://example.com"),
        spacer(16),
      ]),
  },
  {
    type: "content.video_thumbnail",
    category: "content",
    name: "Video Thumbnail",
    description: "Video thumbnail with overlay-feeling play button (image only, links to a hosted player). Title and duration below.",
    tags: ["video", "thumbnail", "watch", "play", "media"],
    create: () =>
      mod("content.video_thumbnail", "Video", [
        image(PLACEHOLDER(560, 315, "▶ Watch"), "Video", { width: 560, link: "#", borderRadius: 8 }),
        heading("Watch: a guided tour of our 2026 launches", { paddingTop: 12, paddingBottom: 4 }),
        muted("4 min watch", { fontSize: 13, paddingBottom: 16 }),
      ]),
  },
  {
    type: "content.event_card",
    category: "content",
    name: "Event Card",
    description: "Date badge with event title, location, time and an RSVP button. For event-driven newsletters and community digests.",
    tags: ["event", "rsvp", "community", "date", "card"],
    create: () =>
      mod(
        "content.event_card",
        "Event",
        [
          text("MAY", {
            align: "center",
            color: "{colors.buttonText}",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: 2,
            paddingTop: 12,
            paddingBottom: 0,
          }),
          text("12", {
            align: "center",
            color: "{colors.buttonText}",
            fontSize: 36,
            fontWeight: "bold",
            paddingTop: 0,
            paddingBottom: 12,
          }),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "content.code_block",
    category: "content",
    name: "Code Snippet",
    description: "Monospaced code block on a tinted background. For developer newsletters and changelog excerpts.",
    tags: ["code", "snippet", "developer", "monospace", "changelog"],
    create: () =>
      mod(
        "content.code_block",
        "Code",
        [
          text("npm install @one-million-lines/email-builder", {
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: 13,
            color: "{colors.text}",
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }),
        ],
        { backgroundColor: "{colors.background}", paddingTop: 0, paddingBottom: 0, paddingLeft: 16, paddingRight: 16 }
      ),
  },
];
