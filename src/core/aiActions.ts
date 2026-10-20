// AI action interface. AI must edit JSON, not HTML.
import type { EmailDocument, EmailModule, Theme } from "../core/types";
import { documentSchema } from "../core/validation";
import { uid } from "./utils";

export type AIAction =
  | { type: "update_meta"; patch: Partial<EmailDocument["meta"]> }
  | { type: "update_settings"; patch: Partial<EmailDocument["settings"]> }
  | { type: "apply_theme"; theme: Theme }
  | { type: "insert_module"; index?: number; module: EmailModule }
  | { type: "delete_module"; moduleId: string }
  | { type: "update_module"; moduleId: string; patch: Partial<EmailModule> }
  | { type: "move_module"; moduleId: string; toIndex: number }
  | { type: "duplicate_module"; moduleId: string; index?: number }
  | {
      type: "update_element";
      moduleId: string;
      elementId: string;
      patch: Record<string, unknown>;
    }
  | {
      /** Set recommendation logic on a module (stored under `module.data.recommendations`). */
      type: "set_recommendations";
      moduleId: string;
      logic: Record<string, unknown>;
    };

export type AITask =
  | "create_email"
  | "edit_email"
  | "insert_products"
  | "rewrite_text"
  | "generate_subject"
  | "generate_preview"
  | "translate"
  | "adapt_tone"
  | "apply_theme";

export interface AIRequest {
  task: AITask;
  document?: EmailDocument;
  instruction?: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  actions?: AIAction[];
  document?: EmailDocument;
  text?: string;
}

export interface AIProvider {
  generate(req: AIRequest): Promise<AIResponse>;
}

export function applyAIActions(
  doc: EmailDocument,
  actions: AIAction[]
): EmailDocument {
  let next = doc;
  for (const a of actions) {
    next = applyAIAction(next, a);
  }
  return next;
}

function applyAIAction(doc: EmailDocument, action: AIAction): EmailDocument {
  switch (action.type) {
    case "update_meta":
      return { ...doc, meta: { ...doc.meta, ...action.patch } };
    case "update_settings":
      return { ...doc, settings: { ...doc.settings, ...action.patch } };
    case "apply_theme":
      return { ...doc, theme: action.theme };
    case "insert_module": {
      const idx = action.index ?? doc.modules.length;
      const modules = [...doc.modules];
      modules.splice(idx, 0, action.module);
      return { ...doc, modules };
    }
    case "delete_module":
      return { ...doc, modules: doc.modules.filter((m) => m.id !== action.moduleId) };
    case "move_module": {
      const from = doc.modules.findIndex((m) => m.id === action.moduleId);
      if (from === -1) return doc;
      const modules = [...doc.modules];
      const [moved] = modules.splice(from, 1);
      const to = Math.max(0, Math.min(action.toIndex, modules.length));
      modules.splice(to, 0, moved);
      return { ...doc, modules };
    }
    case "duplicate_module": {
      const from = doc.modules.findIndex((m) => m.id === action.moduleId);
      if (from === -1) return doc;
      const original = doc.modules[from];
      const clone: EmailModule = {
        ...original,
        id: uid("module"),
        children: original.children.map((c) => ({ ...c, id: uid("el") })),
      };
      const modules = [...doc.modules];
      modules.splice(action.index ?? from + 1, 0, clone);
      return { ...doc, modules };
    }
    case "update_module":
      return {
        ...doc,
        modules: doc.modules.map((m) =>
          m.id === action.moduleId ? { ...m, ...action.patch } : m
        ),
      };
    case "set_recommendations":
      return {
        ...doc,
        modules: doc.modules.map((m) =>
          m.id === action.moduleId
            ? { ...m, data: { ...(m.data ?? {}), recommendations: action.logic } }
            : m
        ),
      };
    case "update_element":
      return {
        ...doc,
        modules: doc.modules.map((m) => {
          if (m.id !== action.moduleId) return m;
          return {
            ...m,
            children: m.children.map((c) =>
              c.id === action.elementId ? ({ ...c, ...action.patch } as typeof c) : c
            ),
          };
        }),
      };
  }
}

/** Validate an AI-returned document before applying. */
export function validateAIDocument(doc: unknown):
  | { ok: true; document: EmailDocument }
  | { ok: false; error: string } {
  const result = documentSchema.safeParse(doc);
  if (result.success) return { ok: true, document: result.data as EmailDocument };
  return { ok: false, error: result.error.message };
}

/** Mock AI provider for demos and tests. Returns deterministic patches. */
export const mockAIProvider: AIProvider = {
  async generate(req) {
    if (req.task === "rewrite_text" && req.instruction) {
      return { text: `[AI rewrite] ${req.instruction}` };
    }
    if (req.task === "generate_subject") {
      return { text: "Your weekly insight is here ✨" };
    }
    if (req.task === "generate_preview") {
      return { text: "A short summary that nudges readers to open." };
    }
    return { actions: [] };
  },
};
