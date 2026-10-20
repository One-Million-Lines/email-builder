// MCP-ready tool contract for the AI email assistant.
//
// The builder speaks a single structured protocol (`AIRequest` → `AIResponse`,
// see `../core/aiActions.ts`). To let *other* AI agents drive the same backend —
// through the Model Context Protocol — we describe that protocol as a set of MCP
// tools. A host can expose these verbatim from an MCP server whose handlers call
// the same `POST /ai/email/*` endpoints the builder uses; the model then "builds
// the email change by change" using the same actions a human would.
//
// This module is pure data + a manifest helper. It does not start a server; it
// provides the contract so the backend (and any MCP gateway) can stay in sync.

import type { Capabilities } from "./capabilities";

/** A JSON-Schema-ish parameter description (MCP `inputSchema`). */
export interface McpJsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

/** A single MCP tool definition. */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: McpJsonSchema;
}

/**
 * The tools an MCP server should expose to drive the email builder. Each maps to
 * a backend route and ultimately to the structured `AIAction`s the editor applies.
 */
export const AI_MCP_TOOLS: McpTool[] = [
  {
    name: "email_generate",
    description:
      "Create or edit a marketing email from a natural-language instruction. " +
      "Returns structured actions (insert/update/move/delete blocks, update settings, " +
      "apply theme) that compose or edit the email. Maps to POST /ai/email/generate.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          enum: ["create_email", "edit_email"],
          description: "create_email builds from scratch; edit_email modifies the current document.",
        },
        instruction: { type: "string", description: "What the user wants." },
        document: { type: "object", description: "Current EmailDocument (required for edit_email)." },
      },
      required: ["task", "instruction"],
    },
  },
  {
    name: "email_insert_products",
    description:
      "Insert a product grid filled with REAL products pulled from a named product " +
      "feed (e.g. top_purchased, most_viewed, bestsellers, new_arrivals, abandoned_cart). " +
      "Maps to POST /ai/email/generate with task=insert_products (products resolved server-side).",
    inputSchema: {
      type: "object",
      properties: {
        feed: { type: "string", description: "Product feed id (see capabilities.productFeeds)." },
        count: { type: "number", description: "How many products to include (default 3)." },
        columns: { type: "number", enum: [1, 2, 3], description: "Grid columns (default 3)." },
        index: { type: "number", description: "Insertion index among modules (default: append)." },
        document: { type: "object", description: "Current EmailDocument." },
      },
      required: ["feed"],
    },
  },
  {
    name: "email_apply_theme",
    description:
      "Apply one of the available themes by id (see capabilities.themes). " +
      "Maps to POST /ai/email/generate with task=apply_theme.",
    inputSchema: {
      type: "object",
      properties: {
        themeId: { type: "string", description: "Theme id from capabilities.themes." },
        document: { type: "object", description: "Current EmailDocument." },
      },
      required: ["themeId"],
    },
  },
  {
    name: "email_rewrite_text",
    description:
      "Rewrite, translate, adapt the tone of, or generate a subject/preview line. " +
      "Returns text only. Maps to POST /ai/email/generate text tasks.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          enum: ["rewrite_text", "translate", "adapt_tone", "generate_subject", "generate_preview"],
        },
        instruction: { type: "string" },
      },
      required: ["task", "instruction"],
    },
  },
  {
    name: "email_list_capabilities",
    description:
      "Return the full editor capability surface: modules, element types, themes, " +
      "settings, merge tags, special links, recommendation algorithms and product feeds. " +
      "Maps to GET /ai/email/capabilities (static) merged with the client payload.",
    inputSchema: { type: "object", properties: {} },
  },
];

/** A self-describing MCP manifest: the tool list plus the live capability surface. */
export interface McpManifest {
  name: string;
  version: string;
  description: string;
  tools: McpTool[];
  capabilities: Capabilities;
}

/**
 * Build an MCP manifest that embeds the live {@link Capabilities}. An MCP server
 * can serve this so a connecting agent learns both *what it can call* (tools) and
 * *what the editor currently supports* (capabilities) in one shot.
 */
export function buildMcpManifest(capabilities: Capabilities): McpManifest {
  return {
    name: "email-builder",
    version: "1.0",
    description:
      "Compose and edit table-based marketing emails through structured actions. " +
      "The model edits JSON (never raw HTML); the builder renders email-safe HTML.",
    tools: AI_MCP_TOOLS,
    capabilities,
  };
}
