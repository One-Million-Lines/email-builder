// Product Search plugin.
//
// Registers a ProductProvider that queries a configured backend endpoint and
// returns a single product. The editor surfaces a "Find product" button on
// product cards; picking a result populates the card's fields (which stay
// fully editable afterwards).
//
// See ./README.md for the wire protocol and server examples.

import type {
  Plugin,
  BuilderHandle,
  ProductProvider,
  ProductSearchResult,
} from "../../core/plugins";

export type { ProductProvider, ProductSearchResult } from "../../core/plugins";
export {
  getProductProvider as getActiveProductProvider,
  setProductProvider as setActiveProductProvider,
} from "./state";
export { ProductSearchModal } from "./ProductSearchModal";
export { useProductSearchAvailable } from "./useProductSearch";

export interface ProductSearchOptions {
  /** Absolute or same-origin URL that implements the search. Required. */
  endpoint: string;
  /** HTTP method. Default: "GET" (query is sent as a URL param). */
  method?: "GET" | "POST";
  /** Query-string parameter name used for GET requests. Default: "q". */
  queryParam?: string;
  /** JSON body field used for POST requests. Default: "query". */
  bodyParam?: string;
  /** Extra headers (e.g. Authorization). */
  headers?: Record<string, string>;
  /** Send cookies with the request. Default: false. */
  withCredentials?: boolean;
  /** Abort the request after this many ms. Default: 15000. */
  timeoutMs?: number;
  /**
   * Map a raw server JSON body to a {@link ProductSearchResult} (or null when
   * nothing matched). The default handles common shapes: a bare product object,
   * `{ product: {...} }`, `{ results: [...] }` / `{ products: [...] }`, or a
   * top-level array — taking the first item — and both camelCase and snake_case
   * field names (`final_price`, `old_price`, `image_url`, `rating`, …).
   */
  transformResponse?: (body: unknown) => ProductSearchResult | null;
}

// ---------------------------------------------------------------------------
// Default response mapping
// ---------------------------------------------------------------------------

function firstRecord(body: unknown): Record<string, unknown> | null {
  if (body == null) return null;
  if (Array.isArray(body)) return firstRecord(body[0]);
  if (typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  // Unwrap common envelopes.
  for (const key of ["product", "item", "data"]) {
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      return obj[key] as Record<string, unknown>;
    }
  }
  for (const key of ["results", "products", "items", "hits"]) {
    if (Array.isArray(obj[key])) return firstRecord(obj[key]);
  }
  // Assume the object is already a product.
  return obj;
}

function pickString(rec: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function pickNumber(rec: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

const defaultTransform = (body: unknown): ProductSearchResult | null => {
  const rec = firstRecord(body);
  if (!rec) return null;
  const name = pickString(rec, ["name", "title", "product_name", "productName"]);
  const finalPrice = pickString(rec, [
    "finalPrice",
    "final_price",
    "price",
    "sale_price",
    "salePrice",
  ]);
  if (!name || finalPrice == null) return null;
  return {
    name,
    finalPrice,
    oldPrice: pickString(rec, [
      "oldPrice",
      "old_price",
      "compare_at_price",
      "compareAtPrice",
      "list_price",
      "listPrice",
    ]),
    description: pickString(rec, ["description", "desc", "summary"]),
    link: pickString(rec, ["link", "url", "product_url", "productUrl", "permalink"]),
    image: pickString(rec, ["image", "image_url", "imageUrl", "thumbnail", "img"]),
    imageAlt: pickString(rec, ["imageAlt", "image_alt", "alt"]),
    stars: pickNumber(rec, ["stars", "rating", "review_score", "reviewScore", "score"]),
    sku: pickString(rec, ["sku", "id", "product_id", "productId"]),
  };
};

// ---------------------------------------------------------------------------
// HTTP provider
// ---------------------------------------------------------------------------

/**
 * Create a {@link ProductProvider} backed by an HTTP endpoint.
 *
 * @example
 *   const provider = createProductSearchProvider({ endpoint: "/api/products/search" });
 *   const product = await provider.search("linen tote");
 */
export function createProductSearchProvider(opts: ProductSearchOptions): ProductProvider {
  const method = opts.method ?? "GET";
  const queryParam = opts.queryParam ?? "q";
  const bodyParam = opts.bodyParam ?? "query";
  const timeoutMs = opts.timeoutMs ?? 15000;
  const transform = opts.transformResponse ?? defaultTransform;

  return {
    async search(query: string): Promise<ProductSearchResult | null> {
      const q = query.trim();
      if (!q) return null;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        let url = opts.endpoint;
        const init: RequestInit = {
          method,
          headers: { ...(opts.headers ?? {}) },
          credentials: opts.withCredentials ? "include" : "same-origin",
          signal: controller.signal,
        };
        if (method === "GET") {
          const base = typeof location !== "undefined" ? location.href : undefined;
          const u = new URL(opts.endpoint, base);
          u.searchParams.set(queryParam, q);
          url = u.toString();
        } else {
          (init.headers as Record<string, string>)["Content-Type"] = "application/json";
          init.body = JSON.stringify({ [bodyParam]: q });
        }

        const res = await fetch(url, init);
        let parsed: unknown = null;
        const raw = await res.text();
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          // leave parsed null; handled below
        }

        if (!res.ok) {
          const msg =
            (parsed && typeof parsed === "object" && "error" in parsed &&
            typeof (parsed as { error: unknown }).error === "string"
              ? (parsed as { error: string }).error
              : null) ?? `Product search failed (HTTP ${res.status})`;
          throw new Error(msg);
        }

        return transform(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(`Product search timed out after ${timeoutMs}ms`);
        }
        throw err instanceof Error ? err : new Error(String(err));
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Plugin factory. Pass to `registerPlugin()` exported by the builder.
 *
 * @example
 *   import { registerPlugin, productSearchPlugin } from "@one-million-lines/email-builder";
 *   registerPlugin(productSearchPlugin({ endpoint: "http://localhost:3001/products/search" }));
 */
export function productSearchPlugin(opts: ProductSearchOptions): Plugin {
  const provider = createProductSearchProvider(opts);
  return {
    name: "product-search",
    type: "product-provider",
    setup(b: BuilderHandle) {
      b.registerProductProvider(provider);
    },
  };
}
