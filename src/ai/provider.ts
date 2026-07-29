// HTTP AI provider.
//
// Wraps a backend endpoint (see ../../backend) as an `AIProvider`. The provider
// POSTs an `AIRequest` as JSON and expects an `AIResponse` JSON body back.
// The backend is responsible for talking to the actual model; the client stays
// model-agnostic and only speaks the builder's structured AI protocol.

import type { AIProvider, AIRequest, AIResponse } from "../core/aiActions";

export interface HttpAIProviderOptions {
  /** Absolute or same-origin URL that implements POST /ai/generate. Required. */
  endpoint: string;
  /** Extra headers (e.g. Authorization). */
  headers?: Record<string, string>;
  /** Send cookies with the request. Default: false. */
  withCredentials?: boolean;
  /** Abort the request after this many ms. Default: 60000. */
  timeoutMs?: number;
  /**
   * Map a raw server JSON body to an `AIResponse`.
   * Default expects the body to already be an `AIResponse`.
   */
  transformResponse?: (body: unknown) => AIResponse;
}

const defaultTransform = (body: unknown): AIResponse => {
  if (body && typeof body === "object") return body as AIResponse;
  throw new Error("AI server returned a non-object response.");
};

/**
 * Create an {@link AIProvider} backed by an HTTP endpoint.
 *
 * @example
 *   const provider = createHttpAIProvider({ endpoint: "http://localhost:3001/ai/generate" });
 */
export function createHttpAIProvider(opts: HttpAIProviderOptions): AIProvider {
  const transform = opts.transformResponse ?? defaultTransform;
  const timeoutMs = opts.timeoutMs ?? 60000;

  return {
    async generate(req: AIRequest): Promise<AIResponse> {
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
        const raw = await res.text();
        try {
          body = raw ? JSON.parse(raw) : null;
        } catch {
          // leave body null; handled below
        }

        if (!res.ok) {
          const msg =
            (body && typeof body === "object" && "error" in body &&
            typeof (body as { error: unknown }).error === "string"
              ? (body as { error: string }).error
              : null) ?? `AI request failed (HTTP ${res.status})`;
          throw new Error(msg);
        }

        return transform(body);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(`AI request timed out after ${timeoutMs}ms`);
        }
        throw err instanceof Error ? err : new Error(String(err));
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
