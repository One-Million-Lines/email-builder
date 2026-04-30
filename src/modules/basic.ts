import type { ModuleDefinition } from "./registry";
import { text, image, spacer, divider, mod, PLACEHOLDER } from "./helpers";

export const basicModules: ModuleDefinition[] = [
  {
    type: "basic.text",
    category: "basic",
    name: "Text Block",
    description: "Single editable paragraph of body copy. Use for short notes, intros, or filler text between sections.",
    tags: ["text", "paragraph", "body"],
    create: () =>
      mod("basic.text", "Text Block", [text("Write your text here.", { role: "body" })]),
  },
  {
    type: "basic.heading",
    category: "basic",
    name: "Heading",
    description: "Bold standalone heading using the theme heading font. Use to introduce a section without other elements.",
    tags: ["heading", "title", "section"],
    create: () =>
      mod("basic.heading", "Heading", [
        text("A clear section heading", {
          role: "headline",
          fontFamily: "{fonts.heading}",
          fontSize: 28,
          fontWeight: "bold",
          paddingTop: 16,
          paddingBottom: 8,
          lineHeight: 1.25,
        }),
      ]),
  },
  {
    type: "basic.image",
    category: "basic",
    name: "Image",
    description: "Single full-width image, centered. Use for hero photography, illustrations, or screenshots.",
    tags: ["image", "media", "photo"],
    create: () => mod("basic.image", "Image", [image(PLACEHOLDER(600, 300), "Placeholder")]),
  },
  {
    type: "basic.image_caption",
    category: "basic",
    name: "Image with Caption",
    description: "Image followed by a small italicized caption underneath. Editorial style for newsletters.",
    tags: ["image", "caption", "editorial"],
    create: () =>
      mod("basic.image_caption", "Image + Caption", [
        image(PLACEHOLDER(600, 360), "Photo"),
        text("Photo: caption goes here.", {
          color: "{colors.muted}",
          fontSize: 13,
          align: "center",
          paddingTop: 4,
          paddingBottom: 16,
        }),
      ]),
  },
  {
    type: "basic.spacer",
    category: "basic",
    name: "Spacer",
    description: "Empty vertical space. Use to separate modules with breathing room.",
    tags: ["spacer", "spacing", "gap"],
    create: () => mod("basic.spacer", "Spacer", [spacer(32)]),
  },
  {
    type: "basic.divider",
    category: "basic",
    name: "Divider",
    description: "Thin horizontal rule across the email. Use to visually separate sections.",
    tags: ["divider", "separator", "rule"],
    create: () => mod("basic.divider", "Divider", [divider()]),
  },
];
