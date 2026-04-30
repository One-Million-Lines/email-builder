// Public API for embedding the editor in React apps and as a vanilla wrapper.
// Note: Vue wrapper is left as a stub (drop-in via createEmailBuilder + a Vue component).
import { createRoot, type Root } from "react-dom/client";
import { createElement, useEffect } from "react";
import type { EmailDocument, Theme } from "./core/types";
import { documentSchema } from "./core/validation";
import { renderEmailHtml } from "./core/renderer";
import { useEmailStore } from "./store/emailStore";
import { App } from "./App";
import { registerDefaultModules } from "./modules/defaultModules";
import { moduleRegistry, type ModuleDefinition } from "./modules/registry";
import type { AIProvider } from "./core/aiActions";
import { builder, registerPlugin, type Plugin } from "./core/plugins";

export interface EmailBuilderProps {
  initialDocument?: EmailDocument;
  modules?: ModuleDefinition[];
  themes?: Theme[];
  aiProvider?: AIProvider;
  onChange?: (doc: EmailDocument) => void;
  onExportHtml?: (html: string) => void;
}

/** React component wrapper. */
export function EmailBuilder(props: EmailBuilderProps) {
  useEffect(() => {
    registerDefaultModules();
    if (props.modules) for (const m of props.modules) moduleRegistry.register(m);
    if (props.themes) useEmailStore.setState({ themes: props.themes });
    if (props.aiProvider) builder.setAIProvider(props.aiProvider);
    if (props.initialDocument) {
      const r = documentSchema.safeParse(props.initialDocument);
      if (r.success) useEmailStore.getState().applyDoc(r.data as EmailDocument, false);
    }
    const unsub = useEmailStore.subscribe((s, prev) => {
      if (s.doc !== prev.doc) props.onChange?.(s.doc);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose export helper via prop callback.
  useEffect(() => {
    if (!props.onExportHtml) return;
    return useEmailStore.subscribe((s, prev) => {
      if (s.doc !== prev.doc) props.onExportHtml?.(renderEmailHtml(s.doc));
    });
  }, [props.onExportHtml]);

  return createElement(App);
}

/** Vanilla JS factory. */
export interface VanillaOptions extends EmailBuilderProps {
  container: HTMLElement;
}

export interface VanillaInstance {
  destroy: () => void;
  getDocument: () => EmailDocument;
  exportHtml: () => string;
  exportJson: () => string;
}

export function createEmailBuilder(opts: VanillaOptions): VanillaInstance {
  const root: Root = createRoot(opts.container);
  root.render(createElement(EmailBuilder, opts));
  return {
    destroy: () => root.unmount(),
    getDocument: () => useEmailStore.getState().doc,
    exportHtml: () => useEmailStore.getState().exportHtml(),
    exportJson: () => useEmailStore.getState().exportJson(),
  };
}

// Re-exports for plugin authors.
export type { Plugin, ModuleDefinition, AIProvider, EmailDocument, Theme };
export { registerPlugin, renderEmailHtml, documentSchema };
export { imageUploaderPlugin } from "./plugins/imageUploader";
export type { ImageUploaderOptions } from "./plugins/imageUploader";
