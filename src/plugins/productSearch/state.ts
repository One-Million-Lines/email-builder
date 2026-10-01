// Reactive holder for the configured SuggesterProvider.
//
// The provider is stored on globalThis so it is shared across all module
// instances — Vite dev-server evaluates the same source file in separate lazy
// chunks, and a plain `let` variable would be duplicated. globalThis is always
// the same object in the browser.

import type { SuggesterProvider } from "../../core/plugins";

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

/** Subscribe to provider changes (for `useSyncExternalStore`). */
export const subscribeSuggesterProvider = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const PROV_KEY = "__omlSuggesterProvider";
const VER_KEY  = "__omlSuggesterProviderVersion";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const G = globalThis as any;

/** Set (or clear) the active suggester provider. Notifies subscribers. */
export function setSuggesterProvider(next: SuggesterProvider | null): void {
  G[PROV_KEY] = next ?? null;
  G[VER_KEY]  = ((G[VER_KEY] as number | undefined) ?? 0) + 1;
  emit();
}

/** The active suggester provider, or null when not configured. */
export function getSuggesterProvider(): SuggesterProvider | null {
  return (G[PROV_KEY] as SuggesterProvider | null | undefined) ?? null;
}

/** Monotonic version counter; changes whenever the provider is set or cleared. */
export const getSuggesterProviderVersion = (): number =>
  (G[VER_KEY] as number | undefined) ?? 0;
