// A small example gallery.
//
// This demonstrates the shape of a gallery pack: a handful of ready-made
// modules across several categories. Registering it drops these blocks at the
// TOP of their respective category panels, badged "New".
//
// Real embedders typically build galleries dynamically (see ../gallery/README.md)
// or fetch them from a backend and call `galleryRegistry.registerGallery(...)`.

import type { GalleryDefinition } from "./registry";
import {
  text,
  image,
  button,
  mod,
  divider,
  eyebrow,
  heading,
  muted,
  product,
  productGrid,
  PLACEHOLDER,
} from "../modules/helpers";

export const sampleGallery: GalleryDefinition = {
  id: "starter-gallery",
  name: "Starter Gallery",
  description:
    "A curated set of extra header, content, ecommerce and menu styles to showcase how galleries extend the builder.",
  badge: "New",
  items: [
    {
      type: "gallery.header.gradient_hero",
      category: "header",
      name: "Gradient Hero",
      description:
        "Bold centered hero with an eyebrow, oversized headline and a primary button on a tinted background. Great for launch announcements.",
      tags: ["hero", "gradient", "launch", "cta", "bold"],
      create: () =>
        mod(
          "gallery.header.gradient_hero",
          "Gradient Hero",
          [
            eyebrow("Introducing", { align: "center" }),
            heading("Something new is here", {
              level: 1,
              align: "center",
              paddingTop: 4,
              paddingBottom: 8,
            }),
            text("A fresh way to reach your audience — crafted for the inbox.", {
              align: "center",
              color: "{colors.muted}",
              fontSize: 16,
              paddingBottom: 20,
            }),
            button("Explore now", "#", { align: "center" }),
          ],
          { backgroundColor: "{colors.surface}", paddingTop: 40, paddingBottom: 40 }
        ),
    },
    {
      type: "gallery.content.quote",
      category: "content",
      name: "Pull Quote",
      description:
        "Large centered quotation with an attribution line. Use to highlight a testimonial or a memorable line.",
      tags: ["quote", "testimonial", "highlight", "pull-quote"],
      create: () =>
        mod("gallery.content.quote", "Pull Quote", [
          text("“This is the fastest we've ever shipped a campaign.”", {
            fontFamily: "{fonts.heading}",
            fontSize: 24,
            align: "center",
            lineHeight: 1.4,
            paddingTop: 28,
            paddingBottom: 8,
          }),
          muted("— A very happy customer", { align: "center", paddingBottom: 28 }),
        ]),
    },
    {
      type: "gallery.content.stat_row",
      category: "content",
      name: "Stat Row",
      description:
        "Three short number + label pairs in a row. Use to show traction, metrics or highlights.",
      tags: ["stats", "metrics", "numbers", "row", "kpi"],
      create: () =>
        mod("gallery.content.stat_row", "Stat Row", [
          heading("By the numbers", { align: "center", paddingTop: 24 }),
          text(
            "<b>10k+</b> subscribers &nbsp;·&nbsp; <b>98%</b> delivery &nbsp;·&nbsp; <b>4.9★</b> rating",
            { align: "center", color: "{colors.muted}", paddingBottom: 24 }
          ),
        ]),
    },
    {
      type: "gallery.ecommerce.single_product",
      category: "ecommerce",
      name: "Single Product Spotlight",
      description:
        "One product with image, name, price and buy button. Use to feature a hero product.",
      tags: ["product", "spotlight", "single", "buy", "shop"],
      create: () =>
        mod("gallery.ecommerce.single_product", "Product Spotlight", [
          productGrid(
            [
              product({
                name: "The Signature Bag",
                finalPrice: "$129",
                oldPrice: "$159",
                description: "Handmade, built to last.",
                image: PLACEHOLDER(520, 520, "Product"),
              }),
            ],
            { columns: 1, showDescription: true, buttonLabel: "Buy now" }
          ),
        ]),
    },
    {
      type: "gallery.menu.pill_nav",
      category: "menu",
      name: "Pill Navigation",
      description:
        "Centered row of navigation links with a divider below. Compact top-of-email menu.",
      tags: ["menu", "nav", "links", "pill"],
      create: () =>
        mod("gallery.menu.pill_nav", "Pill Navigation", [
          image(PLACEHOLDER(120, 32, "LOGO"), "Logo", { width: 120, paddingBottom: 8 }),
          text(
            '<a href="#">Shop</a> &nbsp; <a href="#">New</a> &nbsp; <a href="#">Sale</a> &nbsp; <a href="#">About</a>',
            { align: "center", color: "{colors.primary}", paddingBottom: 8 }
          ),
          divider({ paddingTop: 4, paddingBottom: 0 }),
        ]),
    },
  ],
};
