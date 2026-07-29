// Safely apply an AI response to the current document.
//
// Every AI-produced change is funnelled through here so the editor never trusts
// raw model output: ids are regenerated to avoid collisions, actions are applied
// with the existing `applyAIActions` reducer, and the final document is validated
// with the Zod `documentSchema` before it is handed back to the store.

import type { EmailDocument, EmailModule } from "../core/types";
import type { AIAction, AIResponse } from "../core/aiActions";
import { applyAIActions, validateAIDocument } from "../core/aiActions";
import { uid } from "../core/utils";

/** Drop `undefined`-valued keys anywhere in the document via a JSON round-trip.
 *
 * Module helpers leave optional style fields as `undefined`; those keys survive
 * in-memory but fail Zod validation. Serializing removes them so validation is
 * meaningful and the stored document stays clean. */
function sanitize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Deep-clone a module with fresh ids for the module and all its children. */
function withFreshIds(mod: EmailModule): EmailModule {
  const clone = sanitize(mod);
  return {
    ...clone,
    id: uid("module"),
    children: (clone.children ?? []).map((c) => ({ ...c, id: uid("el") })),
  };
}

/**
 * Regenerate ids on any module the AI wants to insert. This keeps ids unique
 * even when the backend reuses a catalog `sample` (which ships with stable ids).
 */
function normalizeActions(actions: AIAction[]): AIAction[] {
  return actions.map((a) =>
    a.type === "insert_module" ? { ...a, module: withFreshIds(a.module) } : a
  );
}

export interface ApplyResult {
  document: EmailDocument;
  /** Assistant chat text, if any. */
  text?: string;
  /** Short human summary of what changed, for the chat log. */
  summary: string;
}

/**
 * Apply an {@link AIResponse} to `doc`. Returns the next document plus a summary,
 * or an error string when the result fails validation.
 */
export function applyAIResponse(
  doc: EmailDocument,
  res: AIResponse
): { ok: true; result: ApplyResult } | { ok: false; error: string } {
  // 1) A full replacement document takes precedence when present.
  if (res.document) {
    const validated = validateAIDocument(sanitize(res.document));
    if (!validated.ok) return { ok: false, error: validated.error };
    return {
      ok: true,
      result: {
        document: validated.document,
        text: res.text,
        summary: "Replaced the email with a freshly generated document.",
      },
    };
  }

  // 2) Otherwise apply structured actions.
  if (res.actions && res.actions.length > 0) {
    const next = applyAIActions(doc, normalizeActions(res.actions));
    const validated = validateAIDocument(sanitize(next));
    if (!validated.ok) return { ok: false, error: validated.error };
    return {
      ok: true,
      result: {
        document: validated.document,
        text: res.text,
        summary: summarizeActions(res.actions),
      },
    };
  }

  // 3) Text-only response (e.g. rewrite suggestions, subject lines).
  return {
    ok: true,
    result: {
      document: doc,
      text: res.text,
      summary: res.text ? "" : "No changes were suggested.",
    },
  };
}

function summarizeActions(actions: AIAction[]): string {
  const counts: Record<string, number> = {};
  for (const a of actions) counts[a.type] = (counts[a.type] ?? 0) + 1;
  const label: Record<string, string> = {
    insert_module: "added block",
    delete_module: "removed block",
    update_module: "updated block",
    update_element: "edited content",
    update_meta: "updated meta",
    update_settings: "updated settings",
    apply_theme: "applied theme",
  };
  const parts = Object.entries(counts).map(([type, n]) => {
    const base = label[type] ?? type;
    return n > 1 ? `${n} ${base}s` : base;
  });
  return parts.length ? `Applied: ${parts.join(", ")}.` : "No changes applied.";
}
