// Template = a complete EmailDocument factory. Templates are JSON-shaped
// (their `build()` returns the same `EmailDocument` JSON used by the editor),
// but they are written as TypeScript factories so they can:
//   - reuse element helpers (text, image, productGrid, ...)
//   - generate fresh ids on every load (avoiding id collisions)
//   - reference theme tokens like {colors.primary}.
//
// Each template file exports a `TemplateDefinition` and self-registers with
// `templateRegistry.register(def)` via the aggregator in ./index.ts.

import type { EmailDocument } from "../core/types";

export type TemplateCategory =
  | "newsletter"
  | "ecommerce"
  | "abandoned_cart"
  | "product_launch"
  | "onboarding"
  | "event"
  | "transactional"
  | "publishing";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Human + AI readable description. */
  description: string;
  /** Free-form tags for search. */
  tags?: string[];
  /** Optional preview image URL (https or data: URI). */
  thumbnail?: string;
  /** Returns a fresh `EmailDocument` JSON with new ids every call. */
  build: () => EmailDocument;
}

class TemplateRegistry {
  private templates = new Map<string, TemplateDefinition>();

  register(def: TemplateDefinition) {
    this.templates.set(def.id, def);
  }

  get(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  list(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  byCategory(cat: TemplateCategory): TemplateDefinition[] {
    return this.list().filter((t) => t.category === cat);
  }
}

export const templateRegistry = new TemplateRegistry();

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  newsletter: "Newsletter",
  ecommerce: "Ecommerce",
  abandoned_cart: "Abandoned Cart",
  product_launch: "Product Launch",
  onboarding: "Onboarding",
  event: "Event",
  transactional: "Transactional",
  publishing: "Publishing",
};
