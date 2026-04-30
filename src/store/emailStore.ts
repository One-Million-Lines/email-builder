import { create } from "zustand";
import type {
  EmailDocument,
  EmailModule,
  EmailElement,
  Theme,
  Selection,
} from "../core/types";
import { uid } from "../core/utils";
import { documentSchema } from "../core/validation";
import { renderEmailHtml } from "../core/renderer";
import { defaultThemes } from "../themes/defaultThemes";

const HISTORY_LIMIT = 50;

export type ViewMode = "desktop" | "mobile";

interface State {
  doc: EmailDocument;
  selection: Selection;
  past: EmailDocument[];
  future: EmailDocument[];
  themes: Theme[];
  viewMode: ViewMode;

  // Mutations
  setSelection: (sel: Selection) => void;
  setViewMode: (mode: ViewMode) => void;
  applyDoc: (next: EmailDocument, push?: boolean) => void;
  undo: () => void;
  redo: () => void;

  addModule: (mod: EmailModule, index?: number) => void;
  deleteModule: (moduleId: string) => void;
  duplicateModule: (moduleId: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  updateModule: (moduleId: string, patch: Partial<EmailModule>) => void;
  updateElement: (
    moduleId: string,
    elementId: string,
    patch: Partial<EmailElement>
  ) => void;
  deleteElement: (moduleId: string, elementId: string) => void;

  applyTheme: (theme: Theme) => void;
  updateMeta: (patch: Partial<EmailDocument["meta"]>) => void;
  updateSettings: (patch: Partial<EmailDocument["settings"]>) => void;

  // I/O
  exportJson: () => string;
  importJson: (json: string) => { ok: true } | { ok: false; error: string };
  exportHtml: () => string;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const STORAGE_KEY = "openpostcards.draft";

function emptyDoc(theme: Theme): EmailDocument {
  return {
    version: "1.0",
    meta: { name: "Untitled email", previewText: "" },
    theme,
    settings: {
      width: 600,
      backgroundColor: "{colors.background}",
      contentBackgroundColor: "{colors.surface}",
    },
    modules: [],
  };
}

export const useEmailStore = create<State>((set, get) => ({
  doc: emptyDoc(defaultThemes[0]),
  selection: { kind: "email" },
  past: [],
  future: [],
  themes: defaultThemes,
  viewMode: "desktop",

  setSelection: (sel) => set({ selection: sel }),
  setViewMode: (mode) => set({ viewMode: mode }),

  applyDoc: (next, push = true) =>
    set((s) => {
      if (!push) return { doc: next };
      const past = [...s.past, s.doc].slice(-HISTORY_LIMIT);
      return { doc: next, past, future: [] };
    }),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      return {
        doc: prev,
        past: s.past.slice(0, -1),
        future: [s.doc, ...s.future],
      };
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      return { doc: next, past: [...s.past, s.doc], future: rest };
    }),

  addModule: (mod, index) => {
    const { doc, applyDoc } = get();
    const idx = index ?? doc.modules.length;
    const modules = [...doc.modules];
    modules.splice(idx, 0, mod);
    applyDoc({ ...doc, modules });
    set({ selection: { kind: "module", moduleId: mod.id } });
  },

  deleteModule: (moduleId) => {
    const { doc, applyDoc } = get();
    const modules = doc.modules.filter((m) => m.id !== moduleId);
    applyDoc({ ...doc, modules });
    set({ selection: { kind: "email" } });
  },

  duplicateModule: (moduleId) => {
    const { doc, applyDoc } = get();
    const idx = doc.modules.findIndex((m) => m.id === moduleId);
    if (idx === -1) return;
    const original = doc.modules[idx];
    const clone: EmailModule = {
      ...original,
      id: uid("module"),
      children: original.children.map((c) => ({ ...c, id: uid("el") })),
    };
    const modules = [...doc.modules];
    modules.splice(idx + 1, 0, clone);
    applyDoc({ ...doc, modules });
    set({ selection: { kind: "module", moduleId: clone.id } });
  },

  reorderModules: (fromIndex, toIndex) => {
    const { doc, applyDoc } = get();
    if (fromIndex === toIndex) return;
    const modules = [...doc.modules];
    const [moved] = modules.splice(fromIndex, 1);
    modules.splice(toIndex, 0, moved);
    applyDoc({ ...doc, modules });
  },

  updateModule: (moduleId, patch) => {
    const { doc, applyDoc } = get();
    const modules = doc.modules.map((m) =>
      m.id === moduleId ? { ...m, ...patch, style: { ...m.style, ...patch.style } } : m
    );
    applyDoc({ ...doc, modules });
  },

  updateElement: (moduleId, elementId, patch) => {
    const { doc, applyDoc } = get();
    const modules = doc.modules.map((m) => {
      if (m.id !== moduleId) return m;
      const children = m.children.map((c) => {
        if (c.id !== elementId) return c;
        const next = { ...c, ...patch } as EmailElement;
        if ("style" in c && "style" in patch) {
          (next as { style?: Record<string, unknown> }).style = {
            ...(c as { style?: Record<string, unknown> }).style,
            ...(patch as { style?: Record<string, unknown> }).style,
          };
        }
        return next;
      });
      return { ...m, children };
    });
    applyDoc({ ...doc, modules });
  },

  deleteElement: (moduleId, elementId) => {
    const { doc, applyDoc } = get();
    const modules = doc.modules.map((m) =>
      m.id === moduleId
        ? { ...m, children: m.children.filter((c) => c.id !== elementId) }
        : m
    );
    applyDoc({ ...doc, modules });
    set({ selection: { kind: "module", moduleId } });
  },

  applyTheme: (theme) => {
    const { doc, applyDoc } = get();
    applyDoc({ ...doc, theme });
  },

  updateMeta: (patch) => {
    const { doc, applyDoc } = get();
    applyDoc({ ...doc, meta: { ...doc.meta, ...patch } });
  },

  updateSettings: (patch) => {
    const { doc, applyDoc } = get();
    applyDoc({ ...doc, settings: { ...doc.settings, ...patch } });
  },

  exportJson: () => JSON.stringify(get().doc, null, 2),

  importJson: (json) => {
    try {
      const parsed = JSON.parse(json);
      const result = documentSchema.safeParse(parsed);
      if (!result.success) {
        return { ok: false, error: result.error.message };
      }
      get().applyDoc(result.data as EmailDocument);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },

  exportHtml: () => renderEmailHtml(get().doc),

  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const result = documentSchema.safeParse(JSON.parse(raw));
      if (result.success) {
        set({ doc: result.data as EmailDocument, past: [], future: [] });
      }
    } catch {
      // ignore corrupt drafts
    }
  },

  saveToLocalStorage: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(get().doc));
  },
}));
