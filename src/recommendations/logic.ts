// Recommendation logic — ports the legacy Vibetrace logic-builder concept.
// The full logic JSON is stored on the module under `module.data.recommendations`.
// Any module that contains a `productGrid` child becomes "product-aware" and the
// Recommendations panel auto-appears in the right sidebar when the module is selected.

import type { EmailModule } from "../core/types";

export type RecommendationMode = "manual" | "recommender";

export type FallbackId = "smart-reccs" | "random" | "ignore" | "stop";

export interface AlgorithmParamSpec {
  key: string;
  label: string;
  type: "select" | "text" | "number";
  options?: Array<{ value: string | number; label: string }>;
  default?: string | number;
}

export interface AlgorithmDefinition {
  id: string;
  label: string;
  group?: "behavioral" | "catalog" | "personal" | "contextual";
  params?: AlgorithmParamSpec[];
}

export interface StackEntry {
  algorithm: string;
  params?: Record<string, string | number | boolean>;
}

export interface RecommendationFilters {
  /** Product IDs / SKUs to include (manual or boost). */
  includeProducts: string[];
  /** Product IDs / SKUs to exclude. */
  excludeProducts: string[];
  /** Categories to include. */
  includeCategories: string[];
  /** Categories to exclude. */
  excludeCategories: string[];
  minStock?: number;
  minPrice?: number;
  mainOnly?: boolean;
  higherPrice?: boolean;
  salesPrice?: boolean;
  sameCategory?: boolean;
  matchTitle?: boolean;
  /** Comma-separated property keys to match on, e.g. "brand,color". */
  sameField?: string;
  /** Free-form advanced JSON overrides. */
  advanced?: Record<string, unknown>;
}

export interface RecommendationsLogic {
  mode: RecommendationMode;
  noProducts: number;
  /** Source feed id (for manual mode). */
  sourceFeed?: string;
  /** Manually-picked product ids (manual mode). */
  manualProducts: string[];
  /** Algorithm stack — tried in order. Max 3. */
  stack: StackEntry[];
  /** Last-resort algorithm. */
  fallback: FallbackId;
  filters: RecommendationFilters;
}

// ---------------------------------------------------------------------------
// Algorithm catalog — ported from Vibetrace CONSTANTS.algorithms
// ---------------------------------------------------------------------------

const daysParam: AlgorithmParamSpec = {
  key: "days",
  label: "Time window",
  type: "select",
  default: 7,
  options: [
    { value: 7, label: "Last 7 days" },
    { value: 14, label: "Last 14 days" },
    { value: 30, label: "Last 30 days" },
  ],
};

export const ALGORITHMS: AlgorithmDefinition[] = [
  { id: "abandoned-cart", label: "Abandoned basket products", group: "behavioral" },
  { id: "bestseller-conversion", label: "Best seller by Conversion", group: "catalog", params: [daysParam] },
  { id: "bestseller-units", label: "Best seller by Units", group: "catalog", params: [daysParam] },
  { id: "new-products", label: "New items added", group: "catalog", params: [daysParam] },
  { id: "cross-sell", label: "Products Cross-Sell", group: "contextual" },
  { id: "upsell", label: "Products Upsell", group: "contextual" },
  { id: "viewed-categories", label: "Items from viewed categories", group: "behavioral" },
  { id: "viewed-items", label: "Items viewed", group: "behavioral" },
  { id: "similar-basket", label: "Similar to basket items", group: "behavioral" },
  { id: "bought-together", label: "Items bought together", group: "contextual" },
  { id: "best-discount", label: "Items with the best discount", group: "catalog" },
  { id: "match-data", label: "Items matching specific attributes", group: "catalog" },
  { id: "last-purchased", label: "Last purchased items", group: "personal" },
  { id: "similar-to-purchased", label: "Similar to last purchase", group: "personal" },
  { id: "cross-sell-purchased", label: "Cross-sell to last purchase", group: "personal" },
  { id: "similar-items", label: "Similar items", group: "contextual" },
];

export const ALGORITHM_BY_ID: Record<string, AlgorithmDefinition> = Object.fromEntries(
  ALGORITHMS.map((a) => [a.id, a])
);

export const FALLBACK_OPTIONS: Array<{ value: FallbackId; label: string; description: string }> = [
  { value: "smart-reccs", label: "Smart Recommendations", description: "Best generic algorithm — recommended default." },
  { value: "random", label: "Random items (strict filters)", description: "Random items that still pass include/exclude filters." },
  { value: "ignore", label: "Ignore position", description: "Skip the slot if no items found." },
  { value: "stop", label: "Don't display", description: "Don't render the email if the slot can't be filled." },
];

export const MAX_STACK = 3;

export function defaultLogic(noProducts = 2): RecommendationsLogic {
  return {
    mode: "recommender",
    noProducts,
    sourceFeed: "",
    manualProducts: [],
    stack: [{ algorithm: "abandoned-cart" }],
    fallback: "smart-reccs",
    filters: {
      includeProducts: [],
      excludeProducts: [],
      includeCategories: [],
      excludeCategories: [],
      minStock: 0,
      minPrice: 0,
      mainOnly: false,
      higherPrice: false,
      salesPrice: false,
      sameCategory: false,
      matchTitle: false,
      sameField: "",
    },
  };
}

/** Read recommendations logic from a module, returning defaults if absent. */
export function readLogic(data: Record<string, unknown> | undefined): RecommendationsLogic | null {
  if (!data) return null;
  const raw = data["recommendations"];
  if (!raw || typeof raw !== "object") return null;
  return raw as RecommendationsLogic;
}

/** A module is "product-aware" if any of its children renders products. */
export function isProductAware(m: EmailModule): boolean {
  if (!m?.children) return false;
  return m.children.some((c) => c.type === "productGrid");
}

/** Count of product slots the module currently shows (used as default noProducts). */
export function productSlotCount(m: EmailModule): number {
  if (!m?.children) return 0;
  let n = 0;
  for (const c of m.children) {
    if (c.type === "productGrid") n += c.products.length;
  }
  return n;
}

/** Serialize back to legacy Vibetrace-shaped JSON for backend interop. */
export function toLegacyShape(l: RecommendationsLogic) {
  return {
    params: {
      selection: l.mode === "manual" ? "manual" : "recommender",
      include: {
        item: l.filters.includeProducts,
        category: l.filters.includeCategories,
      },
      exclude: {
        item: l.filters.excludeProducts,
        category: l.filters.excludeCategories,
      },
      higherPrice: l.filters.higherPrice ?? false,
      salesPrice: l.filters.salesPrice ?? false,
      sameCategory: l.filters.sameCategory ?? false,
      matchTitle: l.filters.matchTitle ?? false,
      sameField: l.filters.sameField ?? "",
      mainOnly: l.filters.mainOnly ?? false,
    },
    noProducts: String(l.noProducts),
    fallback: l.fallback,
    stack: l.mode === "manual" ? [] : l.stack,
    minStock: String(l.filters.minStock ?? 0),
    minPrice: String(l.filters.minPrice ?? 0),
    sourceFeed: l.sourceFeed ?? "",
    manualProducts: l.manualProducts,
  };
}
