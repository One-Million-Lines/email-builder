// Public API for embedding the editor in React apps and as a vanilla wrapper.
// Note: Vue wrapper is left as a stub (drop-in via createEmailBuilder + a Vue component).
import { createRoot, type Root } from "react-dom/client";
import { createElement, useEffect } from "react";
import "./lib.css";
import type { EmailDocument, Theme } from "./core/types";
import { documentSchema } from "./core/validation";
import { renderEmailHtml } from "./core/renderer";
import { useEmailStore } from "./store/emailStore";
import { App } from "./App";
import { registerDefaultModules } from "./modules/defaultModules";
import { moduleRegistry, type ModuleDefinition } from "./modules/registry";
import type { AIProvider } from "./core/aiActions";
import { builder, registerPlugin, type Plugin } from "./core/plugins";
import { galleryRegistry, type GalleryDefinition } from "./gallery";
import { createHttpAIProvider, type HttpAIProviderOptions } from "./ai";

export interface EmailBuilderProps {
  initialDocument?: EmailDocument;
  modules?: ModuleDefinition[];
  themes?: Theme[];
  /** Galleries of extra ready-made blocks, surfaced on top of each category. */
  galleries?: GalleryDefinition[];
  aiProvider?: AIProvider;
  /**
   * Convenience: wire the built-in HTTP AI provider (the Python backend) by URL.
   * Ignored when `aiProvider` is provided.
   */
  aiEndpoint?: string | HttpAIProviderOptions;
  onChange?: (doc: EmailDocument) => void;
  onExportHtml?: (html: string) => void;
}

/** React component wrapper. */
export function EmailBuilder(props: EmailBuilderProps) {
  useEffect(() => {
    registerDefaultModules();
    if (props.modules) for (const m of props.modules) moduleRegistry.register(m);
    if (props.galleries) for (const g of props.galleries) galleryRegistry.registerGallery(g);
    if (props.themes) useEmailStore.setState({ themes: props.themes });
    if (props.aiProvider) builder.setAIProvider(props.aiProvider);
    else if (props.aiEndpoint) {
      const opts =
        typeof props.aiEndpoint === "string" ? { endpoint: props.aiEndpoint } : props.aiEndpoint;
      builder.setAIProvider(createHttpAIProvider(opts));
    }
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

// Gallery module — extra ready-made blocks surfaced on top of each category.
export { galleryRegistry, galleryPlugin, sampleGallery } from "./gallery";
export type { GalleryDefinition, GalleryItem } from "./gallery";

// AI assistant module — chat-driven editing backed by the Python service.
export {
  aiAssistantPlugin,
  createHttpAIProvider,
  buildCatalog,
  applyAIResponse,
} from "./ai";
export type {
  AIAssistantOptions,
  HttpAIProviderOptions,
  CatalogEntry,
  ApplyResult,
} from "./ai";
export { mockAIProvider, applyAIActions, validateAIDocument } from "./core/aiActions";
export type { AIAction, AIRequest, AIResponse } from "./core/aiActions";

export { templateRegistry, TEMPLATE_CATEGORY_LABELS } from "./templates";
export type { TemplateDefinition, TemplateCategory } from "./templates";
export {
  ALGORITHMS,
  ALGORITHM_BY_ID,
  FALLBACK_OPTIONS,
  defaultLogic as defaultRecommendationsLogic,
  readLogic as readRecommendationsLogic,
  toLegacyShape as recommendationsToLegacyShape,
} from "./recommendations/logic";
export type {
  RecommendationsLogic,
  RecommendationFilters,
  StackEntry,
  AlgorithmDefinition,
  AlgorithmParamSpec,
  FallbackId,
  RecommendationMode,
} from "./recommendations/logic";
