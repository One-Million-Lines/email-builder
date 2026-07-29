// Module catalog for the AI backend.
//
// The backend must only ever produce modules the editor can actually render.
// To guarantee that, the client sends a *catalog* of every available module —
// all built-in modules — including one concrete `sample` of each module's JSON.
// The model picks module `type`s from this catalog and the backend assembles
// the email from the real samples, so the output is always valid and visible.

import type { EmailModule } from "../core/types";
import { moduleRegistry } from "../modules/registry";

export interface CatalogEntry {
  type: string;
  category: string;
  name: string;
  description: string;
  tags: string[];
  source: "module";
  /** A concrete, renderable instance of the module (ids included). */
  sample: EmailModule;
}

/**
 * Build the catalog sent to the AI backend.
 */
export function buildCatalog(): CatalogEntry[] {
  return moduleRegistry.list().map((def) => ({
    type: def.type,
    category: def.category,
    name: def.name,
    description: def.description,
    tags: def.tags ?? [],
    source: "module" as const,
    sample: def.create(),
  }));
}
