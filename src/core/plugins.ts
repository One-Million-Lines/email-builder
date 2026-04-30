// Plugin API. Plugins can add modules, themes, AI providers, asset providers.
import type { ModuleDefinition } from "../modules/registry";
import { moduleRegistry } from "../modules/registry";
import type { Theme } from "./types";
import type { AIProvider } from "./aiActions";

export interface AssetProvider {
  upload: (file: File) => Promise<{ url: string; alt?: string }>;
}

export interface BuilderHandle {
  registerModule: (def: ModuleDefinition) => void;
  registerTheme: (theme: Theme) => void;
  registerAssetProvider: (provider: AssetProvider) => void;
  setAIProvider: (provider: AIProvider) => void;
}

export type PluginType = "modules" | "themes" | "asset-provider" | "ai-provider";

export interface Plugin {
  name: string;
  type: PluginType;
  setup: (builder: BuilderHandle) => void;
}

const themes: Theme[] = [];
let assetProvider: AssetProvider | null = null;
let aiProvider: AIProvider | null = null;

export const builder: BuilderHandle = {
  registerModule: (def) => moduleRegistry.register(def),
  registerTheme: (t) => themes.push(t),
  registerAssetProvider: (p) => {
    assetProvider = p;
  },
  setAIProvider: (p) => {
    aiProvider = p;
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

export function getAIProvider(): AIProvider | null {
  return aiProvider;
}
