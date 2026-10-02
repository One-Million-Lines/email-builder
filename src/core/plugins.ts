// Plugin API. Plugins can add modules, themes, AI providers, asset providers.
import { lazy } from "react";
import type React from "react";
import type { ModuleDefinition } from "../modules/registry";
import { moduleRegistry } from "../modules/registry";
import type { Theme, MergeTag } from "./types";
import type { AIProvider } from "./aiActions";
import { setAIProvider as setReactiveAIProvider } from "../ai/state";
import { setSuggesterProvider as setReactiveSuggesterProvider } from "../plugins/productSearch/state";
import { setVoucherProvider as setReactiveVoucherProvider } from "../plugins/voucherSelect/state";
import { setMergeTagsGlobal } from "../plugins/mergeTags/state";
import { enableRecommendations } from "../plugins/recommendations/state";
import { setAIImageProvider as setReactiveAIImageProvider } from "../plugins/aiImageGenerate/state";
import { usePluginSlotStore } from "./pluginSlots";

// Gate helpers — inlined so `plugins.ts` doesn't need to import from plugin
// logic files (those may not exist in trimmed builds).
import type { EmailModule, TextElement } from "./types";

function isProductGridModule(mod: EmailModule) {
  return mod.children?.some((c) => c.type === "productGrid") ?? false;
}

function isVoucherModule(mod: EmailModule) {
  return (
    mod.children?.some(
      (c): c is TextElement => c.type === "text" && c.role === "voucherCode"
    ) ?? false
  );
}

// Null-safe lazy import: if the file doesn't exist (e.g. tree-shaken build),
// the slot just renders nothing instead of crashing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeLazy(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return lazy<React.ComponentType<any>>(() =>
    factory().catch(() => ({ default: (() => null) as React.ComponentType<any> }))
  );
}

const ProductSearchModalSlot =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  safeLazy(() =>
    import("../plugins/productSearch/ProductSearchModal").then((m) => ({
      default: m.ProductSearchModal,
    }))
  ) as any;

const VoucherPanelSlot = safeLazy(() =>
  import("../plugins/voucherSelect/VoucherPanel").then((m) => ({
    default: m.VoucherPanel,
  }))
);

const RecommendationsPanelSlot = safeLazy(() =>
  import("../plugins/recommendations/RecommendationsPanel").then((m) => ({
    default: m.RecommendationsPanel,
  }))
);

const AIImageModalSlot =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  safeLazy(() =>
    import("../plugins/aiImageGenerate/AIImageModal").then((m) => ({
      default: m.AIImageModal,
    }))
  ) as any;

export interface AssetProvider {
  upload: (file: File) => Promise<{ url: string; alt?: string }>;
}

/**
 * A single result returned by a {@link SuggesterProvider} search.
 * For `itemType === "item"` the price/image/link fields are populated.
 * For `itemType === "category"` only `id` and `name` are guaranteed.
 */
export interface SuggesterResult {
  /** Stable identifier — SKU or `_id` depending on item type. */
  id: string;
  name: string;
  finalPrice?: string;
  oldPrice?: string;
  description?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
  stars?: number;
}

export interface SuggesterProvider {
  /**
   * Search for items or categories.
   * @param query   Free-text search term.
   * @param itemType  `"item"` for products/SKUs, `"category"` for categories.
   */
  search(query: string, itemType: "item" | "category"): Promise<SuggesterResult[]>;
}

/** A discount/voucher entry returned by a {@link VoucherProvider}. */
export interface Voucher {
  /** Stable identifier (used to remember the selection). */
  id: string;
  /** Human label shown in the select dropdown. */
  title: string;
  /** The code (or merge tag) inserted into the voucher block. */
  code: string;
  /** Optional longer description. */
  description?: string;
}

export interface VoucherProvider {
  /** Load the list of vouchers to choose from. */
  list: () => Promise<Voucher[]>;
}

/** Provider that powers the AI image generation modal in the right sidebar. */
export interface AIImageProvider {
  generate(prompt: string, options?: Record<string, unknown>): Promise<{ image_b64: string; revised_prompt?: string; model?: string }>;
  chat(req: { messages: Array<{ role: string; content: string }>; model?: string; size?: string; quality?: string }): Promise<{ image_b64: string; revised_prompt?: string; model?: string }>;
  save(image_b64: string, ext?: string): Promise<{ url: string }>;
}

export interface BuilderHandle {
  registerModule: (def: ModuleDefinition) => void;
  registerTheme: (theme: Theme) => void;
  registerAssetProvider: (provider: AssetProvider) => void;
  registerSuggesterProvider: (provider: SuggesterProvider) => void;
  registerVoucherProvider: (provider: VoucherProvider) => void;
  setAIProvider: (provider: AIProvider) => void;
  registerMergeTags: (tags: MergeTag[]) => void;
  registerLeftSidebarPanel: (slot: import("./pluginSlots").LeftSidebarPanelSlot) => void;
  registerRecommendationsPlugin: () => void;
  registerAIImageProvider: (provider: AIImageProvider) => void;
}

export type PluginType =
  | "modules"
  | "themes"
  | "asset-provider"
  | "suggester-provider"
  | "voucher-provider"
  | "ai-provider"
  | "ai-style"
  | "ai-image-provider";

export interface Plugin {
  name: string;
  type: PluginType;
  setup: (builder: BuilderHandle) => void;
}

const themes: Theme[] = [];
let assetProvider: AssetProvider | null = null;
let voucherProvider: VoucherProvider | null = null;
let aiProvider: AIProvider | null = null;

export const builder: BuilderHandle = {
  registerModule: (def) => moduleRegistry.register(def),
  registerTheme: (t) => themes.push(t),
  registerAssetProvider: (p) => {
    assetProvider = p;
  },
  registerSuggesterProvider: (p) => {
    setReactiveSuggesterProvider(p);
    // Register the product-search modal as a lazy slot so RightSidebar
    // never statically imports the plugin file.
    usePluginSlotStore.getState().registerProductSearch({
      Component: ProductSearchModalSlot,
    });
  },
  registerVoucherProvider: (p) => {
    voucherProvider = p;
    setReactiveVoucherProvider(p);
    // Register the voucher module panel as a lazy slot.
    usePluginSlotStore.getState().registerModulePanel({
      id: "voucher",
      shouldShow: isVoucherModule,
      Component: VoucherPanelSlot,
    });
  },
  setAIProvider: (p) => {
    aiProvider = p;
    setReactiveAIProvider(p);
  },
  registerMergeTags: (tags) => setMergeTagsGlobal(tags),
  registerLeftSidebarPanel: (slot) => {
    usePluginSlotStore.getState().registerLeftSidebarPanel(slot);
  },
  registerRecommendationsPlugin: () => {
    enableRecommendations();
    // Register the recommendations module panel as a lazy slot.
    usePluginSlotStore.getState().registerModulePanel({
      id: "recommendations",
      shouldShow: isProductGridModule,
      Component: RecommendationsPanelSlot,
    });
  },
  registerAIImageProvider: (p) => {
    setReactiveAIImageProvider(p);
    // Register the AI image modal as a lazy slot so the sidebar
    // never imports the plugin code unless activated.
    usePluginSlotStore.getState().registerAIImageModal({
      Component: AIImageModalSlot,
    });
  },
};

export function registerPlugin(plugin: Plugin) {
  plugin.setup(builder);
}

export function getRegisteredThemes(): Theme[] {
  return themes;
}

export function getAssetProvider(): AssetProvider | null {
  return assetProvider;
}

export function getVoucherProvider(): VoucherProvider | null {
  return voucherProvider;
}

export function getAIProvider(): AIProvider | null {
  return aiProvider;
}
