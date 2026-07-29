// Gallery registry.
//
// A "gallery" is a named collection of extra, ready-to-drop modules ("styles"
// or new elements) that embedders can add on top of the built-in modules.
// Gallery items are grouped by the same `ModuleCategory` as regular modules
// and are surfaced at the TOP of each category panel in the left sidebar, so
// freshly loaded elements are always the first thing a user sees.
//
// Unlike `moduleRegistry`, this registry is reactive: the sidebar subscribes to
// it so galleries can be loaded dynamically at runtime (e.g. fetched from a
// backend) and appear without a manual refresh.

import type { ModuleDefinition, ModuleCategory } from "../modules/registry";

/**
 * A single gallery entry. It is a normal {@link ModuleDefinition} (so it can be
 * dropped into the canvas exactly like a built-in module) plus bookkeeping that
 * ties it back to the gallery it came from.
 */
export interface GalleryItem extends ModuleDefinition {
  /** Id of the {@link GalleryDefinition} this item belongs to. */
  galleryId: string;
  /** Optional short label shown as a badge (defaults to "New"). */
  badge?: string;
}

/**
 * A gallery: a themed pack of modules spanning one or more categories.
 * Register whole galleries via {@link galleryRegistry.registerGallery} or the
 * `galleryPlugin()` factory.
 */
export interface GalleryDefinition {
  id: string;
  name: string;
  description?: string;
  /** Modules provided by this gallery (any category). */
  items: ModuleDefinition[];
  /** Badge shown on every item of this gallery (defaults to "New"). */
  badge?: string;
}

type Listener = () => void;

class GalleryRegistry {
  private galleries = new Map<string, GalleryDefinition>();
  /** Insertion-ordered items so "newest on top" is deterministic. */
  private items: GalleryItem[] = [];
  private listeners = new Set<Listener>();
  private version = 0;

  /** Register (or replace) a whole gallery. Safe to call at runtime. */
  registerGallery(def: GalleryDefinition) {
    // Replacing an existing gallery id first removes its previous items.
    if (this.galleries.has(def.id)) this.removeGallery(def.id, false);
    this.galleries.set(def.id, def);
    for (const item of def.items) {
      this.items.push({ ...item, galleryId: def.id, badge: def.badge });
    }
    this.emit();
  }

  /** Register a single item into a gallery (creating the gallery if needed). */
  registerItem(galleryId: string, item: ModuleDefinition, badge?: string) {
    if (!this.galleries.has(galleryId)) {
      this.galleries.set(galleryId, { id: galleryId, name: galleryId, items: [] });
    }
    const gallery = this.galleries.get(galleryId)!;
    gallery.items.push(item);
    this.items.push({ ...item, galleryId, badge: badge ?? gallery.badge });
    this.emit();
  }

  /** Remove a gallery and all of its items. */
  removeGallery(galleryId: string, emit = true) {
    this.galleries.delete(galleryId);
    this.items = this.items.filter((i) => i.galleryId !== galleryId);
    if (emit) this.emit();
  }

  /** Every gallery item, newest galleries last (kept in insertion order). */
  list(): GalleryItem[] {
    return this.items;
  }

  /** Gallery items for a single category (top-of-list candidates). */
  byCategory(category: ModuleCategory): GalleryItem[] {
    return this.items.filter((i) => i.category === category);
  }

  /** Registered galleries (metadata only). */
  listGalleries(): GalleryDefinition[] {
    return Array.from(this.galleries.values());
  }

  /** Look up a gallery item by module type. */
  get(type: string): GalleryItem | undefined {
    return this.items.find((i) => i.type === type);
  }

  // ---- Reactive subscription (for React `useSyncExternalStore`) ----

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Monotonic version; changes whenever the gallery set changes. */
  getSnapshot = (): number => this.version;

  private emit() {
    this.version += 1;
    for (const l of this.listeners) l();
  }
}

export const galleryRegistry = new GalleryRegistry();
