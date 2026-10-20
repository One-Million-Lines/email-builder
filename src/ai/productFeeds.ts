// Product feeds exposed to the AI assistant.
//
// A "product feed" is a named, backend-resolved source of real products
// (e.g. "top purchased", "most viewed", "abandoned cart"). The AI never invents
// product data: when a user asks for "a grid of our best sellers", the client
// forwards the available feeds in the request context, the backend resolves the
// feed to concrete products (via the recommender / catalogue service) and returns
// a `productGrid` module filled with real items — exactly what a human gets when
// they insert products from the editor's product search.
//
// Each feed maps to a recommender algorithm id (see
// `src/plugins/recommendations/logic.ts` ALGORITHMS) so the backend can forward
// the request to the existing recommendation engine.

export interface ProductFeed {
  /** Stable id sent to the backend (also the recommender algorithm id). */
  id: string;
  /** Human + AI readable label. */
  name: string;
  /** What this feed returns — used by the model to pick the right source. */
  description: string;
  /** Underlying recommender algorithm id, when it differs from `id`. */
  algorithm?: string;
}

/**
 * Built-in feeds available out of the box. The host app can override or extend
 * this list via the `ai.productFeeds` prop / `builder.setProductFeeds(...)`.
 * Ids intentionally match recommender algorithm ids where possible.
 */
export const DEFAULT_PRODUCT_FEEDS: ProductFeed[] = [
  {
    id: "top_purchased",
    name: "Top purchased",
    description: "Best-selling products by units sold in the recent period.",
    algorithm: "bestseller-units",
  },
  {
    id: "most_viewed",
    name: "Most viewed",
    description: "Products with the most views / page visits recently.",
    algorithm: "viewed-items",
  },
  {
    id: "bestsellers",
    name: "Bestsellers by conversion",
    description: "Products with the highest view-to-purchase conversion.",
    algorithm: "bestseller-conversion",
  },
  {
    id: "new_arrivals",
    name: "New arrivals",
    description: "Recently added products from the catalogue.",
    algorithm: "new-products",
  },
  {
    id: "best_discount",
    name: "Best discounts",
    description: "Products currently offering the biggest price drop.",
    algorithm: "best-discount",
  },
  {
    id: "abandoned_cart",
    name: "Abandoned cart",
    description: "Products the recipient left in their cart (personalised).",
    algorithm: "abandoned-cart",
  },
];

// ---------------------------------------------------------------------------
// Reactive holder for the configured feeds.
// ---------------------------------------------------------------------------

type Listener = () => void;

let feeds: ProductFeed[] = [];
const listeners = new Set<Listener>();
let version = 0;

function emit() {
  version += 1;
  for (const l of listeners) l();
}

/** Replace the list of product feeds advertised to the AI. */
export function setProductFeeds(next: ProductFeed[] | null | undefined) {
  feeds = Array.isArray(next) ? next : [];
  emit();
}

/** The configured product feeds, or an empty list when none were set. */
export function getProductFeeds(): ProductFeed[] {
  return feeds;
}

/** Subscribe to feed changes (for `useSyncExternalStore`). */
export const subscribeProductFeeds = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Monotonic version; changes whenever the feeds are set. */
export const getProductFeedsVersion = (): number => version;
