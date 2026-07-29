// Module catalog for the AI backend.
//
// The backend must only ever produce modules the editor can actually render.
// To guarantee that, the client sends a *catalog* of every available module —
// built-in modules AND gallery items — including one concrete `sample` of each
// module's JSON. The model picks module `type`s from this catalog and the
// backend assembles the email from the real samples, so the output is always
// valid and visible.

import type { EmailModule } from "../core/types";
import { moduleRegistry } from "../modules/registry";
import { galleryRegistry } from "../gallery/registry";

export interface CatalogEntry {
  type: string;
  category: string;
  name: string;
  description: string;
  tags: string[];
  /** Whether the module comes from a gallery (vs a built-in pack). */
  source: "module" | "gallery";
  /** A concrete, renderable instance of the module (ids included). */
  sample: EmailModule;
}

/**
 * Build the catalog sent to the AI backend. Gallery items are listed first so
 * the model is nudged to prefer freshly added styles, mirroring the sidebar.
 */
export function buildCatalog(): CatalogEntry[] {
  const galleryEntries: CatalogEntry[] = galleryRegistry.list().map((def) => ({
    type: def.type,
    category: def.category,
    name: def.name,
    description: def.description,
    tags: def.tags ?? [],
    source: "gallery",
    sample: def.create(),
  }));

  const galleryTypes = new Set(galleryEntries.map((e) => e.type));

  const moduleEntries: CatalogEntry[] = moduleRegistry
    .list()
    .filter((def) => !galleryTypes.has(def.type))
    .map((def) => ({
      type: def.type,
      category: def.category,
      name: def.name,
      description: def.description,
      tags: def.tags ?? [],
      source: "module",
      sample: def.create(),
    }));

  return [...galleryEntries, ...moduleEntries];
}
