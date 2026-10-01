// Reactive holder for the configured ProductProvider.
//
// The product-search UI (the "Find product" button and modal) only appears
// when a provider has been wired up — via the `productSearchPlugin`, the
// `productProvider` prop, or `builder.registerProductProvider`. Because
// providers are configured imperatively, this small reactive store lets React
// components show/hide the search UI the moment a provider is (un)set.

import type { ProductProvider } from "../../core/plugins";

type Listener = () => void;

let provider: ProductProvider | null = null;
const listeners = new Set<Listener>();
let version = 0;

function emit() {
  version += 1;
  for (const l of listeners) l();
}

/** Set (or clear) the active product provider. Notifies subscribers. */
export function setProductProvider(next: ProductProvider | null) {
  if (provider === next) return;
  provider = next;
  emit();
}

/** The active product provider, or null when product search is not configured. */
export function getProductProvider(): ProductProvider | null {
  return provider;
}

/** Subscribe to provider changes (for `useSyncExternalStore`). */
export const subscribeProductProvider = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Monotonic version; changes whenever the provider is set or cleared. */
export const getProductProviderVersion = (): number => version;

// ---------------------------------------------------------------------------
// Category provider — stored on globalThis so it survives across module
// instances when Vite dev-server or bundlers evaluate the same source in
// separate chunks. globalThis is always the same object in the browser,
// guaranteeing setCategoryProvider and getCategoryProvider share one slot.
// ---------------------------------------------------------------------------

/** A single category result from the backend. */
export interface CategoryResult {
  id: string;
  name: string;
}

/** Minimal interface for a category search backend. */
export interface CategoryProvider {
  search: (query: string) => Promise<CategoryResult[]>;
}

const CAT_KEY = "__omlCategoryProvider";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const G = globalThis as any;

/** Set (or clear) the active category provider. */
export function setCategoryProvider(next: CategoryProvider | null): void {
  G[CAT_KEY] = next ?? null;
}

/** The active category provider, or null when not configured. */
export function getCategoryProvider(): CategoryProvider | null {
  return (G[CAT_KEY] as CategoryProvider | null | undefined) ?? null;
}
