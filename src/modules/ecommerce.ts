import type { ModuleDefinition } from "./registry";
import {
  text,
  image,
  mod,
  button,
  spacer,
  divider,
  heading,
  muted,
  eyebrow,
  PLACEHOLDER,
  product,
  productGrid,
  voucherCode,
} from "./helpers";

export const ecommerceModules: ModuleDefinition[] = [
  {
    type: "ecom.product_grid",
    category: "ecommerce",
    name: "Product Grid",
    description: "Responsive product grid with configurable columns (1–3). Each card has image, name, price, optional description, stars and button. Supports recommendations plugin for dynamic product slots.",
    tags: ["product", "grid", "ecommerce", "responsive", "recommendations"],
    create: () =>
      mod("ecom.product_grid", "Product Grid", [
        productGrid(
          [
            product({ name: "Product A", finalPrice: "$29", oldPrice: "$39" }),
            product({ name: "Product B", finalPrice: "$34", oldPrice: "$45" }),
          ],
          { columns: 2, showOldPrice: true }
        ),
      ]),
  },
  {
    type: "ecom.collection_banner",
    category: "ecommerce",
    name: "Collection Banner",
    description: "Wide collection banner with title and 'Shop the collection' button overlaying or under an image. Use for category drops.",
    tags: ["collection", "banner", "category", "drop"],
    create: () =>
      mod("ecom.collection_banner", "Collection", [
        image(PLACEHOLDER(560, 300, "Collection"), "Collection", { width: 560 }),
        heading("Spring Collection 2026", { align: "center", paddingTop: 16 }),
        muted("Lighter fabrics, brighter colors.", { align: "center" }),
        button("Shop the collection"),
        spacer(16),
      ]),
  },
  {
    type: "ecom.voucher",
    category: "ecommerce",
    name: "Voucher Code",
    description: "Personalized voucher block: 'Your code' label, a large voucher code and a Redeem button. With the voucher-select plugin, pick a code from your backend catalog; otherwise edit the code text directly.",
    tags: ["voucher", "coupon", "discount", "code", "promo", "redeem"],
    create: () =>
      mod("ecom.voucher", "Voucher Code", [
        muted("Your code", { align: "center" }),
        voucherCode("SAVE20"),
        button("Redeem"),
        spacer(24),
      ]),
  },
  {
    type: "ecom.flash_sale",
    category: "ecommerce",
    name: "Flash Sale Banner",
    description: "Urgency-driven banner with countdown-style copy ('Ends in 24h'), discount value and a shop button.",
    tags: ["flash-sale", "urgency", "promo", "banner", "countdown"],
    create: () =>
      mod(
        "ecom.flash_sale",
        "Flash Sale",
        [
          text("⏰ FLASH SALE — ENDS IN 24H", {
            color: "{colors.buttonText}",
            align: "center",
            fontWeight: "bold",
            letterSpacing: 2,
            paddingTop: 16,
            paddingBottom: 4,
          }),
          text("Up to 50% off everything", {
            color: "{colors.buttonText}",
            align: "center",
            fontFamily: "{fonts.heading}",
            fontSize: 28,
            fontWeight: "bold",
            paddingBottom: 12,
          }),
          button("Shop now", "#", { backgroundColor: "{colors.surface}", color: "{colors.primary}" }),
          spacer(16),
        ],
        { backgroundColor: "{colors.primary}", paddingTop: 0, paddingBottom: 0 }
      ),
  },
  {
    type: "ecom.abandoned_cart",
    category: "ecommerce",
    name: "Abandoned Cart Reminder",
    description: "Friendly reminder showing the items left in the cart with a return-to-cart button. For cart recovery automations.",
    tags: ["abandoned-cart", "recovery", "automation", "reminder"],
    create: () =>
      mod("ecom.abandoned_cart", "Abandoned Cart", [
        heading("You left something behind", { align: "center", paddingTop: 16 }),
        muted("Pick up where you left off.", { align: "center" }),
        spacer(8),
        productGrid(
          [
            product({
              name: "Linen Tote Bag",
              image: PLACEHOLDER(400, 400, "Item"),
              finalPrice: "$39",
              oldPrice: "$49",
            }),
          ],
          { columns: 1, showOldPrice: true, buttonLabel: "Return to cart" }
        ),
      ]),
  },
  {
    type: "ecom.review_request",
    category: "ecommerce",
    name: "Review Request",
    description: "Post-purchase block asking for a 1-5 star rating with stacked star buttons. For review-collection emails.",
    tags: ["review", "rating", "post-purchase", "feedback"],
    create: () =>
      mod("ecom.review_request", "Review", [
        heading("How did we do?", { align: "center", paddingTop: 24 }),
        muted("Tap a star to leave a quick review.", { align: "center" }),
        text("☆ ☆ ☆ ☆ ☆", {
          align: "center",
          fontSize: 32,
          color: "{colors.primary}",
          paddingTop: 12,
          paddingBottom: 24,
          link: "#",
        }),
      ]),
  },
  {
    type: "ecom.gift_guide",
    category: "ecommerce",
    name: "Gift Guide Pick",
    description: "Editorial gift-guide pick: persona eyebrow + a single product card with full details (image, name, old/final price, description, CTA).",
    tags: ["gift-guide", "curated", "editorial", "holiday"],
    create: () =>
      mod("ecom.gift_guide", "Gift Pick", [
        eyebrow("For the home cook"),
        productGrid(
          [
            product({
              name: "Cast Iron Skillet",
              image: PLACEHOLDER(560, 300, "Pick"),
              oldPrice: "$119",
              finalPrice: "$89",
              description: "Pre-seasoned, lifetime-guarantee. Made in USA.",
            }),
          ],
          { columns: 1, showOldPrice: true, showDescription: true, buttonLabel: "View product" }
        ),
      ]),
  },
  {
    type: "ecom.bestseller_list",
    category: "ecommerce",
    name: "Bestseller Grid",
    description: "Top products grid (3 up) with old/final prices. Used by retailers for weekly bestsellers.",
    tags: ["bestsellers", "grid", "ranking", "top"],
    create: () =>
      mod("ecom.bestseller_list", "Bestsellers", [
        eyebrow("Top 3 this week"),
        productGrid(
          [
            product({ name: "Linen Tote", finalPrice: "$39", oldPrice: "$49" }),
            product({ name: "Ceramic Mug", finalPrice: "$24" }),
            product({ name: "Brass Lamp", finalPrice: "$129", oldPrice: "$149" }),
          ],
          { columns: 3, showOldPrice: true }
        ),
      ]),
  },
];
