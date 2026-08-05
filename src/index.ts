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
import {
  builder,
  registerPlugin,
  type Plugin,
  type ProductProvider,
  type VoucherProvider,
} from "./core/plugins";
import { createHttpAIProvider, type HttpAIProviderOptions } from "./ai";
import { createProductSearchProvider, type ProductSearchOptions } from "./plugins/productSearch";
import { createVoucherProvider, loadVouchers, type VoucherOptions } from "./plugins/voucherSelect";

export interface EmailBuilderProps {
  initialDocument?: EmailDocument;
  modules?: ModuleDefinition[];
  themes?: Theme[];
  aiProvider?: AIProvider;
  /**
   * Convenience: wire the built-in HTTP AI provider (the Python backend) by URL.
   * Ignored when `aiProvider` is provided.
   */
  aiEndpoint?: string | HttpAIProviderOptions;
  /** Product search provider (enables the "Find product" modal on product cards). */
  productProvider?: ProductProvider;
  /**
   * Convenience: wire the built-in HTTP product-search provider by URL.
   * Ignored when `productProvider` is provided.
   */
  productEndpoint?: string | ProductSearchOptions;
  /** Voucher provider (enables the "Select voucher" dropdown on voucher blocks). */
  voucherProvider?: VoucherProvider;
  /**
   * Convenience: wire the built-in HTTP voucher provider by URL.
   * Ignored when `voucherProvider` is provided.
   */
  voucherEndpoint?: string | VoucherOptions;
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
    else if (props.aiEndpoint) {
      const opts =
        typeof props.aiEndpoint === "string" ? { endpoint: props.aiEndpoint } : props.aiEndpoint;
      builder.setAIProvider(createHttpAIProvider(opts));
    }
    if (props.productProvider) builder.registerProductProvider(props.productProvider);
    else if (props.productEndpoint) {
      const opts =
        typeof props.productEndpoint === "string"
          ? { endpoint: props.productEndpoint }
          : props.productEndpoint;
      builder.registerProductProvider(createProductSearchProvider(opts));
    }
    if (props.voucherProvider) builder.registerVoucherProvider(props.voucherProvider);
    else if (props.voucherEndpoint) {
      const opts =
        typeof props.voucherEndpoint === "string"
          ? { endpoint: props.voucherEndpoint }
          : props.voucherEndpoint;
      builder.registerVoucherProvider(createVoucherProvider(opts));
      if (typeof props.voucherEndpoint !== "string" && props.voucherEndpoint.preload) {
        void loadVouchers();
      }
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

// Product search — modal-driven catalog lookup backed by a configurable endpoint.
export {
  productSearchPlugin,
  createProductSearchProvider,
  getActiveProductProvider,
  setActiveProductProvider,
} from "./plugins/productSearch";
export type {
  ProductSearchOptions,
  ProductProvider,
  ProductSearchResult,
} from "./plugins/productSearch";

// Voucher select — pick discount codes from a backend list on voucher blocks.
export {
  voucherPlugin,
  createVoucherProvider,
  getActiveVoucherProvider,
  setActiveVoucherProvider,
  isVoucherAware,
} from "./plugins/voucherSelect";
export type { VoucherOptions, Voucher, VoucherProvider } from "./plugins/voucherSelect";

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
