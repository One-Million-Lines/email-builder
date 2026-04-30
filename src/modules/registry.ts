import type { EmailModule } from "../core/types";

export type ModuleCategory =
  | "basic"
  | "menu"
  | "header"
  | "content"
  | "feature"
  | "call_to_action"
  | "ecommerce"
  | "transactional"
  | "social"
  | "footer";

export interface ModuleDefinition {
  type: string;
  category: ModuleCategory;
  name: string;
  /** Human + AI readable summary of the module's structure, intent and content slots. Used by AI to choose modules when assembling templates. */
  description: string;
  /** Free-form tags to help AI semantic search: e.g. ["product", "grid", "ecommerce", "3-column"]. */
  tags?: string[];
  thumbnail?: string;
  /** Returns a fresh module JSON with new ids. */
  create: () => EmailModule;
}

class ModuleRegistry {
  private modules = new Map<string, ModuleDefinition>();

  register(def: ModuleDefinition) {
    this.modules.set(def.type, def);
  }

  get(type: string): ModuleDefinition | undefined {
    return this.modules.get(type);
  }

  list(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  byCategory(category: ModuleCategory): ModuleDefinition[] {
    return this.list().filter((m) => m.category === category);
  }
}

export const moduleRegistry = new ModuleRegistry();

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  basic: "Basic",
  menu: "Menu",
  header: "Header",
  content: "Content",
  feature: "Feature",
  call_to_action: "Call to Action",
  ecommerce: "Ecommerce",
  transactional: "Transactional",
  social: "Social",
  footer: "Footer",
};
