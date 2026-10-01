// Suggester plugin — registers a SuggesterProvider that the editor uses for:
//   1. The "Find product" modal on product cards (itemType = "item")
//   2. The recommendations panel include/exclude filters (itemType = "item" | "category")
//
// A single provider handles both entity types so the host app only needs
// one endpoint registration.

import type { Plugin, BuilderHandle, SuggesterProvider, SuggesterResult } from "../../core/plugins";

export type { SuggesterProvider, SuggesterResult } from "../../core/plugins";
export { getSuggesterProvider, setSuggesterProvider } from "./state";

export interface SuggesterOptions {
  /**
   * The backend endpoint URL, or a function that returns the URL per item type.
   * Use a function when item and category searches hit different paths, e.g.:
   * ```ts
   * endpoint: (itemType) => `/api/suggest?entity=${itemType}`
   * ```
   */
  endpoint: string | ((itemType: "item" | "category") => string);
  /** HTTP method. Default: "GET". */
  method?: "GET" | "POST";
  /** Query-string parameter name for GET. Default: "q". */
  queryParam?: string;
  /** JSON body field for POST. Default: "query". */
  bodyParam?: string;
  /** Extra headers (e.g. Authorization). */
  headers?: Record<string, string>;
  /** Send cookies. Default: false. */
  withCredentials?: boolean;
  /** Abort after this many ms. Default: 15000. */
  timeoutMs?: number;
  /**
   * Map the raw response body to {@link SuggesterResult}[].
   * Called with both the body AND the itemType so you can return
   * rich product data for items and simple {id, name} for categories.
   *
   * Default: handles `{ data: [...] }`, `{ response: [...] }`, and bare arrays.
   * Items need a `title` field; optionally `_id`, `idInShop`, `final_price`,
   * `old_price`, `image`, `url`.
   */
  transformResponse?: (body: unknown, itemType: "item" | "category") => SuggesterResult[];
}

// ---------------------------------------------------------------------------
// Default response transform
// ---------------------------------------------------------------------------

const defaultTransform = (body: unknown, itemType: "item" | "category"): SuggesterResult[] => {
  const items: unknown[] = Array.isArray(body)
    ? body
    : Array.isArray((body as Record<string, unknown>)?.data)
      ? (body as Record<string, unknown>).data as unknown[]
      : Array.isArray((body as Record<string, unknown>)?.response)
        ? (body as Record<string, unknown>).response as unknown[]
        : Array.isArray((body as Record<string, unknown>)?.results)
          ? (body as Record<string, unknown>).results as unknown[]
          : [];

  const out: SuggesterResult[] = [];
  for (const r of items) {
    if (!r || typeof r !== "object") continue;
    const item = r as Record<string, unknown>;
    const name = String(item.title ?? item.name ?? "");
    if (!name) continue;

    if (itemType === "category") {
      out.push({ id: String(item._id ?? item.id ?? item.name ?? name), name });
      continue;
    }

    const price = (v: unknown): string | undefined =>
      v != null && v !== "" ? String(v) : undefined;
    out.push({
      id: String(item.idInShop ?? item.sku ?? item._id ?? item.id ?? name),
      name,
      finalPrice: price(item.final_price ?? item.price) ?? "",
      oldPrice: price(item.old_price),
      description: typeof item.description === "string" ? item.description : undefined,
      link: typeof item.url === "string" ? item.url
          : typeof item.link === "string" ? item.link
          : undefined,
      image: typeof item.image === "string" ? item.image : undefined,
      imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : undefined,
      stars: typeof item.rating === "number" ? item.rating
           : typeof item.stars === "number" ? item.stars
           : undefined,
    });
  }
  return out;
};

// ---------------------------------------------------------------------------
// HTTP provider factory
// ---------------------------------------------------------------------------

/**
 * Create a {@link SuggesterProvider} backed by an HTTP endpoint.
 *
 * @example
 *   const provider = createSuggesterProvider({
 *     endpoint: (itemType) => `/api/suggest?entity=${itemType}`,
 *     queryParam: "q",
 *   });
 */
export function createSuggesterProvider(opts: SuggesterOptions): SuggesterProvider {
  const method = opts.method ?? "GET";
  const queryParam = opts.queryParam ?? "q";
  const bodyParam = opts.bodyParam ?? "query";
  const timeoutMs = opts.timeoutMs ?? 15000;
  const transform = opts.transformResponse ?? defaultTransform;

  return {
    async search(query: string, itemType: "item" | "category"): Promise<SuggesterResult[]> {
      const q = query.trim();
      if (!q) return [];

      const endpointUrl = typeof opts.endpoint === "function"
        ? opts.endpoint(itemType)
        : opts.endpoint;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        let url = endpointUrl;
        const init: RequestInit = {
          method,
          headers: { ...(opts.headers ?? {}) },
          credentials: opts.withCredentials ? "include" : "same-origin",
          signal: controller.signal,
        };
        if (method === "GET") {
          const base = typeof location !== "undefined" ? location.href : undefined;
          const u = new URL(endpointUrl, base);
          u.searchParams.set(queryParam, q);
          url = u.toString();
        } else {
          (init.headers as Record<string, string>)["Content-Type"] = "application/json";
          init.body = JSON.stringify({ [bodyParam]: q, itemType });
        }

        const res = await fetch(url, init);
        let parsed: unknown = null;
        const raw = await res.text();
        try { parsed = raw ? JSON.parse(raw) : null; } catch { /* ignore */ }
        if (!res.ok) return [];
        return transform(parsed, itemType);
      } catch {
        return [];
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

/**
 * Plugin factory. Pass to `registerPlugin()`.
 *
 * @example
 *   registerPlugin(suggesterPlugin({
 *     endpoint: (itemType) => `/api/suggest?entity=${itemType}`,
 *     headers: { Authorization: "Bearer ..." },
 *   }));
 */
export function suggesterPlugin(opts: SuggesterOptions): Plugin {
  const provider = createSuggesterProvider(opts);
  return {
    name: "suggester",
    type: "suggester-provider",
    setup(b: BuilderHandle) {
      b.registerSuggesterProvider(provider);
    },
  };
}
