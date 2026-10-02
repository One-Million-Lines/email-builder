/**
 * AI Image Generate Plugin — public API.
 *
 * Adds a ✨ "Generate with AI" button next to the Image URL field in the
 * right sidebar.  Clicking it opens a conversational image-generation modal
 * where users can describe an image, see the AI result, iterate with follow-up
 * prompts, and insert the final image directly into their email.
 *
 * @example — with the vtmarketing panel API backend:
 *   import { registerPlugin, aiImagePlugin } from "@one-million-lines/email-builder";
 *
 *   registerPlugin(aiImagePlugin({
 *     generateEndpoint: `${VITE_BASE_API_URL}/ai/image/generate`,
 *     chatEndpoint:     `${VITE_BASE_API_URL}/ai/image/chat`,
 *     saveEndpoint:     `${VITE_BASE_API_URL}/ai/image/save`,
 *     headers: {
 *       get Authorization() {
 *         const t = localStorage.getItem(ACCESS_TOKEN_KEY);
 *         return t ? `Bearer ${t}` : "";
 *       },
 *     },
 *     withCredentials: true,
 *   }));
 */

import type { Plugin, BuilderHandle } from "../../core/plugins";
export { getAIImageProvider, setAIImageProvider } from "./state";

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/** A single turn in the image-generation conversation. */
export interface AIImageMessage {
  role: "user" | "assistant";
  /** User prompt or `"__IMAGE__"` (placeholder for assistant image turns). */
  content: string;
}

/** Options passed to the generate / chat endpoints. */
export interface AIImageRequest {
  /** Full conversation history (for /chat) or a single user message (for /generate). */
  messages: AIImageMessage[];
  /** Model id: "gpt-image-2.5-flare" | "gemini-2.5-flash-image" */
  model?: string;
  /** Image dimensions. Default "1024x1024". */
  size?: string;
  /** Quality hint: "standard" | "hd". */
  quality?: string;
  /** Style: "vivid" | "natural". */
  style?: string;
}

/** Result returned by the provider after generating an image. */
export interface AIImageResult {
  /** Raw base64-encoded image data (no data-URL prefix). */
  image_b64: string;
  /** Provider's revised or expanded prompt, if any. */
  revised_prompt?: string;
  /** Resolved model name used by the backend. */
  model?: string;
}

/** Result returned after saving an image. */
export interface AIImageSaveResult {
  /** Public CDN URL of the uploaded image. */
  url: string;
}

// ---------------------------------------------------------------------------
// Provider contract
// ---------------------------------------------------------------------------

export interface AIImageProvider {
  /**
   * Generate an image from a single prompt (first turn in a session).
   */
  generate(prompt: string, options?: Omit<AIImageRequest, "messages">): Promise<AIImageResult>;
  /**
   * Continue the conversation: send all prior messages + the new instruction.
   * The backend builds a combined prompt and re-generates the image.
   */
  chat(req: AIImageRequest): Promise<AIImageResult>;
  /**
   * Upload the generated base64 image to the backend S3 bucket.
   * Returns the public CDN URL.
   */
  save(image_b64: string, ext?: string): Promise<AIImageSaveResult>;
}

// ---------------------------------------------------------------------------
// HTTP provider factory
// ---------------------------------------------------------------------------

export interface HttpAIImageProviderOptions {
  /** Endpoint for first-turn image generation. Required. */
  generateEndpoint: string;
  /** Endpoint for multi-turn refinement chat. Required. */
  chatEndpoint: string;
  /** Endpoint for saving the generated image to S3. Required. */
  saveEndpoint: string;
  /** Extra headers (e.g. Authorization). May use getter for dynamic tokens. */
  headers?: Record<string, string>;
  /** Send cookies with requests. Default: false. */
  withCredentials?: boolean;
  /** Request timeout in ms. Default: 90000 (image generation can be slow). */
  timeoutMs?: number;
}

async function _post(
  endpoint: string,
  body: unknown,
  opts: Pick<HttpAIImageProviderOptions, "headers" | "withCredentials" | "timeoutMs">,
): Promise<unknown> {
  const timeoutMs = opts.timeoutMs ?? 90000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
      credentials: opts.withCredentials ? "include" : "same-origin",
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let json: unknown = null;
    try { json = await res.json(); } catch { /* not JSON */ }

    if (!res.ok) {
      const msg =
        (json && typeof json === "object"
          ? (json as Record<string, unknown>).detail
            ?? (json as Record<string, unknown>).error
          : null) ?? `Request failed (HTTP ${res.status})`;
      throw new Error(String(msg));
    }
    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    }
    throw err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timer);
  }
}

function _unwrap(body: unknown): Record<string, unknown> {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const inner = (b.data ?? b.response ?? b) as Record<string, unknown>;
    return inner;
  }
  throw new Error("Unexpected response format from AI image service.");
}

export function createHttpAIImageProvider(
  opts: HttpAIImageProviderOptions,
): AIImageProvider {
  return {
    async generate(prompt, options = {}) {
      const body = await _post(opts.generateEndpoint, { prompt, ...options }, opts);
      const d = _unwrap(body);
      return {
        image_b64: String(d.image_b64 ?? ""),
        revised_prompt: typeof d.revised_prompt === "string" ? d.revised_prompt : undefined,
        model: typeof d.model === "string" ? d.model : undefined,
      };
    },

    async chat(req) {
      const body = await _post(opts.chatEndpoint, req, opts);
      const d = _unwrap(body);
      return {
        image_b64: String(d.image_b64 ?? ""),
        revised_prompt: typeof d.revised_prompt === "string" ? d.revised_prompt : undefined,
        model: typeof d.model === "string" ? d.model : undefined,
      };
    },

    async save(image_b64, ext = "png") {
      const body = await _post(opts.saveEndpoint, { image_b64, ext }, opts);
      const d = _unwrap(body);
      return { url: String(d.url ?? "") };
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export interface AIImagePluginOptions extends HttpAIImageProviderOptions {
  /**
   * Feature flag.  Set to false to register the plugin without showing the
   * button (useful to conditionally enable based on subscription tier).
   * Default: true.
   */
  enabled?: boolean | (() => boolean);
}

/**
 * Register the AI Image Generate plugin.
 *
 * After calling `registerPlugin(aiImagePlugin({...}))`, a ✨ button appears
 * next to the Image URL input in the right sidebar.  Clicking it opens the
 * AI image generation modal.
 */
export function aiImagePlugin(opts: AIImagePluginOptions): Plugin {
  return {
    name: "ai-image-generate",
    type: "ai-image-provider",
    setup(b: BuilderHandle) {
      const enabled = opts.enabled ?? true;
      const isEnabled = () =>
        typeof enabled === "function" ? enabled() : Boolean(enabled);

      if (!isEnabled()) return;

      const provider = createHttpAIImageProvider(opts);
      b.registerAIImageProvider(provider);
    },
  };
}
