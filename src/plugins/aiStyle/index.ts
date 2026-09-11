/**
 * AI Style Plugin — public API.
 *
 * Registers a left-sidebar panel that generates or restyles a complete email
 * from a reference image and/or a text description. The panel is fully lazy
 * (never loaded unless the plugin is registered) and independent from the core
 * email builder.
 *
 * @example — with the vtmarketing panel API backend:
 *   import { registerPlugin, aiStylePlugin } from "@one-million-lines/email-builder";
 *   import { ACCESS_TOKEN_KEY } from "@/misc/ApiClient";
 *
 *   registerPlugin(aiStylePlugin({
 *     endpoint: `${import.meta.env.VITE_BASE_API_URL}/ai/email-style`,
 *     headers: {
 *       get Authorization() {
 *         const t = localStorage.getItem(ACCESS_TOKEN_KEY);
 *         return t ? `Bearer ${t}` : "";
 *       },
 *     },
 *     withCredentials: true,
 *   }));
 *
 * @example — standalone (email-builder Python backend):
 *   registerPlugin(aiStylePlugin({ endpoint: "http://localhost:3001/ai/generate-style" }));
 */

import { lazy } from "react";
import type { Plugin, BuilderHandle } from "../../core/plugins";
import type { AIResponse } from "../../core/aiActions";
import type { CatalogEntry } from "../../ai/catalog";
import type { EmailDocument } from "../../core/types";

// ── Provider contract ──────────────────────────────────────────────────────

export interface AIStyleRequest {
  /** Plain-text description of the desired style. */
  description?: string;
  /** Raw base64 string (no data-URL prefix) of a reference design image. */
  image_base64?: string;
  /** Module catalog: the builder's registered modules with samples. */
  catalog: CatalogEntry[];
  /** Current email document (optional; backend may use for incremental restyling). */
  document?: EmailDocument;
}

export interface AIStyleProvider {
  generate(req: AIStyleRequest): Promise<AIResponse>;
}

// ── HTTP provider ──────────────────────────────────────────────────────────

export interface HttpAIStyleProviderOptions {
  /** Absolute or same-origin URL that implements POST <endpoint>. Required. */
  endpoint: string;
  /** Extra headers. Use a getter to supply dynamic auth tokens. */
  headers?: Record<string, string>;
  /** Send cookies with the request. Default: false. */
  withCredentials?: boolean;
  /** Request timeout in ms. Default: 120000 (vision calls take longer). */
  timeoutMs?: number;
  /**
   * Map the raw server JSON body to an {@link AIResponse}.
   * Default: expects the body to be or contain { document? | actions? | text? }.
   * The vtmarketing panel API wraps responses in { data: … }; this transformer
   * unwraps that envelope automatically.
   */
  transformResponse?: (body: unknown) => AIResponse;
}

const defaultTransform = (body: unknown): AIResponse => {
  if (body && typeof body === "object") {
    // Unwrap vtmarketing { data: ... } envelope
    const b = body as Record<string, unknown>;
    const inner = (b.data ?? b.response ?? b) as Record<string, unknown>;
    const r: AIResponse = {};
    if (inner.document) r.document = inner.document as EmailDocument;
    if (inner.actions) r.actions = inner.actions as AIResponse["actions"];
    if (inner.text) r.text = inner.text as string;
    return r;
  }
  throw new Error("AI style server returned a non-object response.");
};

/**
 * Build an {@link AIStyleProvider} backed by an HTTP endpoint.
 */
export function createHttpAIStyleProvider(opts: HttpAIStyleProviderOptions): AIStyleProvider {
  const transform = opts.transformResponse ?? defaultTransform;
  const timeoutMs = opts.timeoutMs ?? 120000;

  return {
    async generate(req: AIStyleRequest): Promise<AIResponse> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(opts.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
          credentials: opts.withCredentials ? "include" : "same-origin",
          body: JSON.stringify(req),
          signal: controller.signal,
        });

        let body: unknown = null;
        try {
          body = await res.json();
        } catch {
          // leave null
        }

        if (!res.ok) {
          const msg =
            (body && typeof body === "object" && "error" in body &&
             typeof (body as { error: unknown }).error === "string"
              ? (body as { error: string }).error
              : null) ??
            `AI style request failed (HTTP ${res.status})`;
          throw new Error(msg);
        }

        return transform(body);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(`AI style request timed out after ${timeoutMs / 1000}s`);
        }
        throw err instanceof Error ? err : new Error(String(err));
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

// ── Module-level provider storage ─────────────────────────────────────────

let _styleProvider: AIStyleProvider | null = null;

export function getStyleProvider(): AIStyleProvider | null {
  return _styleProvider;
}

export function setStyleProvider(p: AIStyleProvider): void {
  _styleProvider = p;
}

// ── Plugin factory ─────────────────────────────────────────────────────────

export interface AIStylePluginOptions extends HttpAIStyleProviderOptions {
  /**
   * Feature-flag: when false (or the function returns false) the plugin is
   * registered but the sidebar button is hidden and requests are blocked.
   * Default: true.
   */
  enabled?: boolean | (() => boolean);
}

const AIStylePanelSlot = lazy(() =>
  import("./AIStylePanel").then((m) => ({ default: m.AIStylePanel }))
);

/**
 * Register the AI Style plugin.
 *
 * After calling `registerPlugin(aiStylePlugin({...}))` a **Style** rail button
 * (wand icon) appears in the left sidebar. Clicking it opens the style
 * generation panel.
 */
export function aiStylePlugin(opts: AIStylePluginOptions): Plugin {
  return {
    name: "ai-style",
    type: "ai-style",
    setup(builder: BuilderHandle) {
      const enabled = opts.enabled ?? true;
      const isEnabled = () =>
        typeof enabled === "function" ? enabled() : Boolean(enabled);

      if (!isEnabled()) return; // feature-flagged off at registration time

      const provider: AIStyleProvider = createHttpAIStyleProvider(opts);
      setStyleProvider(provider);

      builder.registerLeftSidebarPanel({
        id: "ai-style",
        label: "Style",
        icon: "wand2",
        Component: AIStylePanelSlot,
      });
    },
  };
}
