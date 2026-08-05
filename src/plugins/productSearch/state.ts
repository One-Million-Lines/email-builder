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
