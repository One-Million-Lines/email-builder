// Plugin API. Plugins can add modules, themes, AI providers, asset providers.
import { lazy } from "react";
import type React from "react";
import type { ModuleDefinition } from "../modules/registry";
import { moduleRegistry } from "../modules/registry";
import type { Theme, MergeTag } from "./types";
import type { AIProvider } from "./aiActions";
import { setAIProvider as setReactiveAIProvider } from "../ai/state";
import { setProductProvider as setReactiveProductProvider, setCategoryProvider as setReactiveCategoryProvider } from "../plugins/productSearch/state";
import { setVoucherProvider as setReactiveVoucherProvider } from "../plugins/voucherSelect/state";
import { setMergeTagsGlobal } from "../plugins/mergeTags/state";
import { enableRecommendations } from "../plugins/recommendations/state";
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

export interface AssetProvider {
  upload: (file: File) => Promise<{ url: string; alt?: string }>;
}

/**
 * A single product returned by a {@link ProductProvider} search. Field names
 * match the builder's `Product` model so results drop straight into a card.
 */
export interface ProductSearchResult {
  name: string;
  finalPrice: string;
  oldPrice?: string;
  description?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
  stars?: number;
  /** Optional external identifier echoed back from the backend. */
  sku?: string;
}

export interface ProductProvider {
  /** Look up a single product for a free-text query. Resolves null if none. */
  search: (query: string) => Promise<ProductSearchResult | null>;
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

export interface BuilderHandle {
  registerModule: (def: ModuleDefinition) => void;
  registerTheme: (theme: Theme) => void;
  registerAssetProvider: (provider: AssetProvider) => void;
  registerProductProvider: (provider: ProductProvider) => void;
  registerCategoryProvider: (provider: import("../plugins/productSearch/state").CategoryProvider) => void;
  registerVoucherProvider: (provider: VoucherProvider) => void;
  setAIProvider: (provider: AIProvider) => void;
  registerMergeTags: (tags: MergeTag[]) => void;
  registerLeftSidebarPanel: (slot: import("./pluginSlots").LeftSidebarPanelSlot) => void;
  registerRecommendationsPlugin: () => void;
}

export type PluginType =
  | "modules"
  | "themes"
  | "asset-provider"
  | "product-provider"
  | "category-provider"
  | "voucher-provider"
  | "ai-provider"
  | "ai-style";

export interface Plugin {
  name: string;
  type: PluginType;
  setup: (builder: BuilderHandle) => void;
}

const themes: Theme[] = [];
let assetProvider: AssetProvider | null = null;
let productProvider: ProductProvider | null = null;
let voucherProvider: VoucherProvider | null = null;
let aiProvider: AIProvider | null = null;

export const builder: BuilderHandle = {
  registerModule: (def) => moduleRegistry.register(def),
  registerTheme: (t) => themes.push(t),
  registerAssetProvider: (p) => {
    assetProvider = p;
  },
  registerProductProvider: (p) => {
    productProvider = p;
    setReactiveProductProvider(p);
    // Register the product-search modal as a lazy slot so RightSidebar
    // never statically imports the plugin file.
    usePluginSlotStore.getState().registerProductSearch({
      Component: ProductSearchModalSlot,
    });
  },
  registerCategoryProvider: (p) => {
    setReactiveCategoryProvider(p);
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

export function getProductProvider(): ProductProvider | null {
  return productProvider;
}

export function getVoucherProvider(): VoucherProvider | null {
  return voucherProvider;
}

export function getAIProvider(): AIProvider | null {
  return aiProvider;
}
