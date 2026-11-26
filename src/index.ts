// Public API for embedding the editor in React apps and as a vanilla wrapper.
// Note: Vue wrapper is left as a stub (drop-in via createEmailBuilder + a Vue component).
import { createRoot, type Root } from "react-dom/client";
import { createElement, useEffect } from "react";
import "./lib.css";
import type { EmailDocument, Theme, MergeTag, ThemeTokens } from "./core/types";
import { documentSchema } from "./core/validation";
import { renderEmailHtml } from "./core/renderer";
import { useEmailStore } from "./store/emailStore";
import type { BlockPreset, CurrencySettings, UIConfig } from "./store/emailStore";
import { App } from "./App";
import { registerDefaultModules } from "./modules/defaultModules";
import { moduleRegistry, type ModuleDefinition } from "./modules/registry";
import type { AIProvider } from "./core/aiActions";
import { STORAGE_KEY } from "./store/emailStore";
import {
  builder,
  registerPlugin,
  type Plugin,
  type SuggesterProvider,
  type VoucherProvider,
} from "./core/plugins";
import { createHttpAIProvider, type HttpAIProviderOptions } from "./ai";
import { DEFAULT_PRODUCT_FEEDS, type ProductFeed } from "./ai/productFeeds";
import { createSuggesterProvider, type SuggesterOptions } from "./plugins/productSearch";
import { createVoucherProvider, loadVouchers, type VoucherOptions } from "./plugins/voucherSelect";

export interface EmailBuilderAIConfig {
  /**
   * Master switch for the AI assistant. Defaults to `false` — the AI tab and all
   * AI wiring stay off unless this is explicitly set to `true`.
   */
  enabled?: boolean;
  /**
   * Backend endpoint implementing `POST /ai/email/generate` (the AIRequest →
   * AIResponse protocol). A string URL or full {@link HttpAIProviderOptions}.
   */
  endpoint?: string | HttpAIProviderOptions;
  /** Bring-your-own provider. Takes precedence over `endpoint`. */
  provider?: AIProvider;
  /**
   * Named product feeds (e.g. top purchased, most viewed) advertised to the AI.
   * When omitted, the built-in defaults are used once AI is enabled.
   */
  productFeeds?: ProductFeed[];
}

export interface EmailBuilderProps {
  initialDocument?: EmailDocument;
  modules?: ModuleDefinition[];
  themes?: Theme[];
  /**
   * AI assistant configuration. The AI chat assistant is part of the **core**
   * builder but **disabled by default** — provide `ai={{ enabled: true, endpoint }}`
   * (or a custom `provider`) to turn it on. When enabled, an **AI** tab appears in
   * the left sidebar and the full editor capability surface (blocks, elements,
   * themes, colours, width, merge tags, recommendation algorithms, product feeds)
   * is shared with the backend so the assistant can build and edit the email.
   */
  ai?: EmailBuilderAIConfig;
  aiProvider?: AIProvider;
  /**
   * Convenience: wire the built-in HTTP AI provider (the backend) by URL.
   * Ignored when `ai` or `aiProvider` is provided.
   */
  aiEndpoint?: string | HttpAIProviderOptions;
  /** Product search provider (enables the "Find product" modal on product cards). */
  productProvider?: SuggesterProvider;
  /**
   * Convenience: wire the built-in HTTP suggester provider by URL.
   * Ignored when `productProvider` is provided.
   */
  productEndpoint?: string | SuggesterOptions;
  /** Voucher provider (enables the "Select voucher" dropdown on voucher blocks). */
  voucherProvider?: VoucherProvider;
  /**
   * Convenience: wire the built-in HTTP voucher provider by URL.
   * Ignored when `voucherProvider` is provided.
   */
  voucherEndpoint?: string | VoucherOptions;
  /**
   * List of merge tags (personalisation tokens) available in the text element
   * sidebar. When configured, a "Insert merge tag" dropdown appears allowing
   * the user to insert `{attribute}` placeholders into text content.
   *
   * Example:
   * ```ts
   * mergeTags={[
   *   { attribute: "user.firstname", title: "First name" },
   *   { attribute: "user.lastname",  title: "Last name" },
   * ]}
   * ```
   */
  mergeTags?: MergeTag[];
  /**
   * Set to `true` to enable the Recommendations panel in the right sidebar.
   * When enabled, any module containing a `productGrid` element shows a
   * recommendations configuration panel where algorithm stack, fallback
   * strategy, and product filters can be set.
   * Defaults to `false` — the panel is hidden unless explicitly enabled.
   */
  enableRecommendations?: boolean;
  /**
   * Block presets — ordered lists of module types shown as a "Presets" dropdown
   * at the top of the Custom blocks panel. When the user selects a preset and
   * confirms, the entire email content is replaced with the preset's blocks.
   *
   * Can also be set at any time via the standalone `setBlockPresets()` export
   * (useful for dynamic loading from an API).
   */
  blockPresets?: BlockPreset[];
  /**
   * Currency formatting applied around all product prices in the canvas preview.
   * Defaults to empty strings (no prefix/suffix).
   * Can also be set at any time via the standalone `setCurrencySettings()` export.
   */
  currency?: Partial<CurrencySettings>;
  /**
   * Show or hide the "Save draft (local)" button in the top toolbar.
   * Default: true (visible).
   */
  showSaveDraft?: boolean;
  /**
   * Show or hide the HTML mode button in the top toolbar. When shown, clicking it
   * replaces the entire visual builder with a raw HTML editor (irreversible until Reset).
   * Default: true (visible).
   */
  showHtml?: boolean;
  /**
   * Pre-load the editor in full HTML mode with this HTML string. Use when
   * loading content that was previously saved in HTML mode (no builder document).
   */
  initialHtml?: string;
  onChange?: (doc: EmailDocument) => void;
  onExportHtml?: (html: string) => void;
}

/** React component wrapper. */
export function EmailBuilder(props: EmailBuilderProps) {
  useEffect(() => {
    registerDefaultModules();
    if (props.modules) {
      let hasCustom = false;
      for (const m of props.modules) {
        moduleRegistry.register(m);
        if (m.category === "custom") hasCustom = true;
      }
      // Signal the sidebar to show the Custom tab for any newly registered
      // custom blocks supplied via the modules prop.
      if (hasCustom) {
        useEmailStore.setState((s) => ({
          customModulesRevision: s.customModulesRevision + 1,
        }));
      }
    }
    if (props.themes) useEmailStore.setState({ themes: props.themes });
    // AI assistant — part of core, disabled by default. Enabled either via the
    // first-class `ai` config, or the legacy `aiProvider` / `aiEndpoint` props.
    if (props.ai?.enabled) {
      if (props.ai.provider) builder.setAIProvider(props.ai.provider);
      else if (props.ai.endpoint) {
        const opts =
          typeof props.ai.endpoint === "string"
            ? { endpoint: props.ai.endpoint }
            : props.ai.endpoint;
        builder.setAIProvider(createHttpAIProvider(opts));
      }
      builder.setProductFeeds(props.ai.productFeeds ?? DEFAULT_PRODUCT_FEEDS);
    } else if (props.aiProvider) builder.setAIProvider(props.aiProvider);
    else if (props.aiEndpoint) {
      const opts =
        typeof props.aiEndpoint === "string" ? { endpoint: props.aiEndpoint } : props.aiEndpoint;
      builder.setAIProvider(createHttpAIProvider(opts));
    }
    if (props.productProvider) builder.registerSuggesterProvider(props.productProvider);
    else if (props.productEndpoint) {
      const opts =
        typeof props.productEndpoint === "string"
          ? { endpoint: props.productEndpoint }
          : props.productEndpoint;
      builder.registerSuggesterProvider(createSuggesterProvider(opts));
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
    if (props.mergeTags) builder.registerMergeTags(props.mergeTags);
    if (props.enableRecommendations) builder.registerRecommendationsPlugin();
    if (props.blockPresets) useEmailStore.getState().setBlockPresets(props.blockPresets);
    if (props.currency) useEmailStore.getState().setCurrency(props.currency);
    if (props.showSaveDraft !== undefined || props.showHtml !== undefined) {
      useEmailStore.getState().setUIConfig({
        ...(props.showSaveDraft !== undefined && { showSaveDraft: props.showSaveDraft }),
        ...(props.showHtml !== undefined && { showHtml: props.showHtml }),
      });
    }
    if (props.initialHtml) {
      useEmailStore.getState().enterFullHtmlMode(props.initialHtml);
    } else if (props.initialDocument) {
      const r = documentSchema.safeParse(props.initialDocument);
      if (r.success) useEmailStore.getState().applyDoc(r.data as EmailDocument, false);
    }
    const unsub = useEmailStore.subscribe((s, prev) => {
      if (s.doc !== prev.doc) props.onChange?.(s.doc);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose export helper via prop callback — also fires when raw HTML changes in full HTML mode.
  useEffect(() => {
    if (!props.onExportHtml) return;
    return useEmailStore.subscribe((s, prev) => {
      if (s.fullHtmlMode) {
        if (s.rawHtml !== prev.rawHtml) props.onExportHtml!(s.rawHtml);
      } else {
        if (s.doc !== prev.doc) props.onExportHtml!(renderEmailHtml(s.doc));
      }
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

/**
 * Reset the email builder to an empty document and clear its localStorage
 * draft, so the next mount starts fresh instead of restoring the previous
 * session.
 *
 * Call this before opening the builder for a brand-new content item to avoid
 * the previous edit bleeding into the new template.
 *
 * @example
 *   // In ContentEditPage when isNew:
 *   clearEmailBuilderDocument();
 *   setBuilderKey(k => k + 1); // remount the builder
 */
export function clearEmailBuilderDocument(): void {
  useEmailStore.getState().resetDocument();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore (e.g. SSR or restricted storage)
  }
}

// Re-exports for plugin authors.
export type { Plugin, ModuleDefinition, AIProvider, EmailDocument, EmailModule, Theme, MergeTag, ThemeTokens, EditableSlot, SlotType };
export { registerPlugin, renderEmailHtml, documentSchema };
export { getAssetProvider, builder } from "./core/plugins";
export { applyEditableSlots, applyThemeTokens } from "./core/utils";
export { imageUploaderPlugin } from "./plugins/imageUploader";
export type { ImageUploaderOptions } from "./plugins/imageUploader";

// Suggester plugin — single provider for both product and category search.
export {
  suggesterPlugin,
  createSuggesterProvider,
  getSuggesterProvider,
  setSuggesterProvider,
} from "./plugins/productSearch";
export type {
  SuggesterOptions,
  SuggesterProvider,
  SuggesterResult,
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

// AI assistant module — chat-driven editing backed by the panel AI backend.
export {
  aiAssistantPlugin,
  createHttpAIProvider,
  buildCatalog,
  buildCapabilities,
  applyAIResponse,
  AI_MCP_TOOLS,
  buildMcpManifest,
  DEFAULT_PRODUCT_FEEDS,
  getProductFeeds,
  setProductFeeds,
} from "./ai";
export type {
  AIAssistantOptions,
  HttpAIProviderOptions,
  CatalogEntry,
  Capabilities,
  CapabilitiesContext,
  ElementCapability,
  ActionCapability,
  ThemeCapability,
  ProductFeed,
  McpTool,
  McpManifest,
  McpJsonSchema,
  ApplyResult,
} from "./ai";
export { mockAIProvider, applyAIActions, validateAIDocument } from "./core/aiActions";
export type { AIAction, AITask, AIRequest, AIResponse } from "./core/aiActions";

// AI Style plugin — generate or restyle an email from an image/description.
export {
  aiStylePlugin,
  createHttpAIStyleProvider,
  getStyleProvider,
  setStyleProvider,
} from "./plugins/aiStyle";
export type {
  AIStylePluginOptions,
  AIStyleRequest,
  AIStyleProvider,
  HttpAIStyleProviderOptions,
} from "./plugins/aiStyle";

// AI Image Generate plugin — generate images from text prompts inside the editor.
export {
  aiImagePlugin,
  createHttpAIImageProvider,
  getAIImageProvider,
  setAIImageProvider,
} from "./plugins/aiImageGenerate";
export type {
  AIImagePluginOptions,
  AIImageProvider,
  AIImageRequest,
  AIImageResult,
  AIImageSaveResult,
  AIImageMessage,
  HttpAIImageProviderOptions,
} from "./plugins/aiImageGenerate";

export { templateRegistry, TEMPLATE_CATEGORY_LABELS } from "./templates";
export type { TemplateDefinition, TemplateCategory } from "./templates";
export {
  ALGORITHMS,
  ALGORITHM_BY_ID,
  FALLBACK_OPTIONS,
  defaultLogic as defaultRecommendationsLogic,
  readLogic as readRecommendationsLogic,
  toLegacyShape as recommendationsToLegacyShape,
  isProductAware,
} from "./plugins/recommendations/logic";
export type {
  RecommendationsLogic,
  RecommendationFilters,
  StackEntry,
  AlgorithmDefinition,
  AlgorithmParamSpec,
  FallbackId,
  RecommendationMode,
} from "./plugins/recommendations/logic";

// Recommendations plugin — opt-in activation and helper exports.
export {
  useRecommendationsStore,
  setRecommendationFeeds,
} from "./plugins/recommendations/state";
export type { RecommendationFeed, ItemSuggestion, SuggesterFn } from "./plugins/recommendations/state";

/**
 * Convenience plugin object.  Pass to `registerPlugin()` or use
 * `<EmailBuilder enableRecommendations />` to activate the recommendations
 * panel for product-grid modules.
 *
 * @example
 * ```ts
 * import { registerPlugin, recommendationsPlugin } from "@one-million-lines/email-builder";
 * registerPlugin(recommendationsPlugin);
 * ```
 */
export const recommendationsPlugin = {
  name: "recommendations",
  type: "recommendations" as const,
  setup: (b: import("./core/plugins").BuilderHandle) => b.registerRecommendationsPlugin(),
};

// ─── Theme utilities ─────────────────────────────────────────────────────────
// Exported so that external consumers can compose theme lists, e.g.:
//   themes={[myTenantTheme, ...defaultThemes]}
export {
  defaultThemes,
  minimalSaaS,
  ecommercePromo,
  luxuryBlack,
  greenEco,
  newsletterEditorial,
  // Shared defaults for the new token groups — spread these in custom themes:
  //   button: { ...DEFAULT_BUTTON_TOKENS, borderRadius: 0 }
  DEFAULT_BUTTON_TOKENS,
  DEFAULT_TEXT_TOKENS,
  DEFAULT_HEADING_TOKENS,
} from "./themes/defaultThemes";

// ─── Document-building helpers ───────────────────────────────────────────────
// The same helpers used by every built-in template. Export them so that
// external consumers can write custom templates and starter documents without
// reaching into internal package paths.
export { uid } from "./core/utils";
export {
  mod,
  text,
  heading,
  eyebrow,
  muted,
  voucherCode,
  image,
  button,
  spacer,
  divider,
  product,
  productGrid,
  footerLinks,
  logoImage,
  shopInfoText,
  shopDomainText,
  PLACEHOLDER,
} from "./modules/helpers";
export type { Product } from "./core/types";

/**
 * Dynamically register a custom theme so it appears in the Themes panel of
 * every currently-mounted builder instance. Safe to call at any time, including
 * after the builder has mounted (unlike the static `themes` prop which is only
 * read once). Re-registering an existing theme id is a no-op.
 *
 * Primary use-case: loading tenant/gallery themes from the backend and surfacing
 * them in the Themes panel without remounting the editor.
 *
 * @example
 *   // After fetching a theme from the gallery API:
 *   import { registerTheme } from "@one-million-lines/email-builder";
 *   registerTheme(galleryItem.params.theme);
 */
export function registerTheme(theme: Theme): void {
  const current = useEmailStore.getState().themes;
  if (current.find((t) => t.id === theme.id)) return;
  useEmailStore.setState({ themes: [...current, theme] });
}

/**
 * Dynamically register a custom block module at runtime. The module appears in
 * the sidebar immediately after registration. Modules with `category: "custom"`
 * trigger the "Custom" tab to appear (purple accent, Puzzle icon).
 *
 * Primary use-case: loading tenant-specific custom blocks from the gallery API
 * (via `useGalleryTemplates`) without needing to pass them as a static
 * `modules` prop or remount the editor.
 *
 * Re-registering an existing `type` silently overwrites the previous definition
 * (idempotent for the same type).
 *
 * @example
 *   import { registerModule } from "@one-million-lines/email-builder";
 *   registerModule({
 *     type: "acme.promo.strip",
 *     category: "custom",
 *     name: "Acme Promo Strip",
 *     description: "Dark promo banner with discount headline.",
 *     create: () => ({ id: uid("module"), type: "acme.promo.strip", name: "Acme Promo Strip",
 *       style: { backgroundColor: "#1C1C1C" }, children: [], htmlOverride: "<p>...</p>" }),
 *   });
 */
export function registerModule(def: ModuleDefinition): void {
  moduleRegistry.register(def);
  // Notify the sidebar to re-evaluate the custom-modules list.
  if (def.category === "custom") {
    useEmailStore.setState((s) => ({
      customModulesRevision: s.customModulesRevision + 1,
    }));
  }
}

export type { BlockPreset } from "./store/emailStore";
export type { CurrencySettings } from "./store/emailStore";
export type { UIConfig } from "./store/emailStore";

/**
 * Set the list of block presets shown in the Custom blocks panel dropdown.
 * Each preset is an ordered collection of module types that replaces the full
 * email content when the user selects and confirms it.
 *
 * Call this after registering the corresponding custom modules so the sidebar
 * can resolve the type strings to live module definitions.
 *
 * @example
 *   import { setBlockPresets } from "@one-million-lines/email-builder";
 *   setBlockPresets([
 *     { title: "Info Newsletter", blocks_list: ["acme.header.logo", "acme.content.news"] },
 *   ]);
 */
export function setBlockPresets(presets: BlockPreset[]): void {
  useEmailStore.getState().setBlockPresets(presets);
}

/**
 * Configure currency prefix/suffix applied around all product prices in both
 * the canvas preview and the exported HTML.
 *
 * The currency text is rendered as static HTML outside the `item-final_price` /
 * `item-old_price` class-marked spans so that the backend's value-replacement
 * engine leaves the currency text intact.
 *
 * @example
 *   setCurrencySettings({ before: "$" })          // → $29.99
 *   setCurrencySettings({ before: "", after: " RON" })  // → 29.99 RON
 */
export function setCurrencySettings(settings: Partial<CurrencySettings>): void {
  useEmailStore.getState().setCurrency(settings);
}

/** Read the current currency settings from the editor state. */
export function getCurrencySettings(): CurrencySettings {
  return useEmailStore.getState().currency;
}
