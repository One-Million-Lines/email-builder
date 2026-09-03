// Plugin API. Plugins can add modules, themes, AI providers, asset providers.
import type { ModuleDefinition } from "../modules/registry";
import { moduleRegistry } from "../modules/registry";
import type { Theme, MergeTag } from "./types";
import type { AIProvider } from "./aiActions";
import { setAIProvider as setReactiveAIProvider } from "../ai/state";
import { setProductProvider as setReactiveProductProvider } from "../plugins/productSearch/state";
import { setVoucherProvider as setReactiveVoucherProvider } from "../plugins/voucherSelect/state";
import { setMergeTagsGlobal } from "../plugins/mergeTags/state";

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
  registerVoucherProvider: (provider: VoucherProvider) => void;
  setAIProvider: (provider: AIProvider) => void;
  /** Configure the list of merge tags available in the text element sidebar. */
  registerMergeTags: (tags: MergeTag[]) => void;
}

export type PluginType =
  | "modules"
  | "themes"
  | "asset-provider"
  | "product-provider"
  | "voucher-provider"
  | "ai-provider";

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
  },
  registerVoucherProvider: (p) => {
    voucherProvider = p;
    setReactiveVoucherProvider(p);
  },
  setAIProvider: (p) => {
    aiProvider = p;
    setReactiveAIProvider(p);
  },
  registerMergeTags: (tags) => setMergeTagsGlobal(tags),
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
