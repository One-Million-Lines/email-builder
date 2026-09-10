// Plugin UI slot registry.
//
// When a plugin is registered (via BuilderHandle) it calls registerModulePanel
// or registerProductSearch to place a lazy-loaded React component here.
// Editor components (RightSidebar) read from this store instead of statically
// importing plugin UI files, so plugin code is never loaded unless the plugin
// is actually activated.

import { create } from "zustand";
import type { LazyExoticComponent, ComponentType } from "react";
import type { EmailModule } from "./types";
import type { ProductSearchResult } from "./plugins";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyLazy = LazyExoticComponent<ComponentType<any>>;

/**
 * A panel injected into the right sidebar below the module style controls.
 * Rendered once per selected module when `shouldShow` returns true.
 */
export interface ModulePanelSlot {
  /** Unique string — re-registering the same id replaces the previous entry. */
  id: string;
  /** Return true for the modules where this panel should appear. */
  shouldShow: (mod: EmailModule) => boolean;
  /**
   * Lazy component that receives `{ mod }`. Created once via `React.lazy()`
   * at registration time so it is stable across renders.
   */
  Component: AnyLazy;
}

/** Slot for the product-search modal (element-level, product grids). */
export interface ProductSearchSlot {
  Component: LazyExoticComponent<
    ComponentType<{
      open: boolean;
      onClose: () => void;
      onSave: (result: ProductSearchResult) => void;
      initialQuery?: string;
      title?: string;
    }>
  >;
}

interface PluginSlotState {
  modulePanels: ModulePanelSlot[];
  productSearch: ProductSearchSlot | null;
  registerModulePanel: (slot: ModulePanelSlot) => void;
  registerProductSearch: (slot: ProductSearchSlot) => void;
}

export const usePluginSlotStore = create<PluginSlotState>((set) => ({
  modulePanels: [],
  productSearch: null,
  registerModulePanel: (slot) =>
    set((s) => ({
      modulePanels: [
        ...s.modulePanels.filter((p) => p.id !== slot.id),
        slot,
      ],
    })),
  registerProductSearch: (slot) => set({ productSearch: slot }),
}));
