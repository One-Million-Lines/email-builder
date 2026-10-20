// Public surface for the AI assistant module.
import type { Plugin, BuilderHandle } from "../core/plugins";
import type { AIProvider } from "../core/aiActions";
import { createHttpAIProvider, type HttpAIProviderOptions } from "./provider";
import type { ProductFeed } from "./productFeeds";

export { createHttpAIProvider } from "./provider";
export type { HttpAIProviderOptions } from "./provider";
export { buildCatalog } from "./catalog";
export type { CatalogEntry } from "./catalog";
export { buildCapabilities } from "./capabilities";
export type {
  Capabilities,
  CapabilitiesContext,
  ElementCapability,
  ActionCapability,
  ThemeCapability,
} from "./capabilities";
export {
  DEFAULT_PRODUCT_FEEDS,
  getProductFeeds,
  setProductFeeds,
} from "./productFeeds";
export type { ProductFeed } from "./productFeeds";
export { AI_MCP_TOOLS, buildMcpManifest } from "./mcp";
export type { McpTool, McpManifest, McpJsonSchema } from "./mcp";
export { applyAIResponse } from "./applyResponse";
export type { ApplyResult } from "./applyResponse";
export { AIChatPanel, useAIAvailable } from "./AIChatPanel";
export {
  getAIProvider as getActiveAIProvider,
  setAIProvider as setActiveAIProvider,
} from "./state";

export interface AIAssistantOptions extends HttpAIProviderOptions {
  /** Named product feeds (top purchased, most viewed…) advertised to the AI. */
  productFeeds?: ProductFeed[];
}

/**
 * Plugin factory that wires an HTTP-backed AI provider into the builder and
 * enables the chat panel.
 *
 * @example
 *   import { registerPlugin } from "@one-million-lines/email-builder";
 *   import { aiAssistantPlugin } from "@one-million-lines/email-builder";
 *   registerPlugin(aiAssistantPlugin({ endpoint: "http://localhost:3001/ai/generate" }));
 */
export function aiAssistantPlugin(opts: AIAssistantOptions): Plugin {
  const { productFeeds, ...httpOpts } = opts;
  const provider: AIProvider = createHttpAIProvider(httpOpts);
  return {
    name: "ai-assistant",
    type: "ai-provider",
    setup(builder: BuilderHandle) {
      builder.setAIProvider(provider);
      if (productFeeds) builder.setProductFeeds(productFeeds);
    },
  };
}

