// Reactive holder for the configured AI provider.
//
// The editor's AI chat panel only appears when a provider has been wired up
// (via the `aiProvider` prop, the `aiAssistantPlugin`, or `builder.setAIProvider`).
// Because providers are configured imperatively, this small reactive store lets
// React components show/hide the panel the moment a provider is (un)set.

import type { AIProvider } from "../core/aiActions";

type Listener = () => void;

let provider: AIProvider | null = null;
const listeners = new Set<Listener>();
let version = 0;

function emit() {
  version += 1;
  for (const l of listeners) l();
}

/** Set (or clear) the active AI provider. Notifies subscribers. */
export function setAIProvider(next: AIProvider | null) {
  if (provider === next) return;
  provider = next;
  emit();
}

/** The active AI provider, or null when AI is not configured. */
export function getAIProvider(): AIProvider | null {
  return provider;
}

/** Subscribe to provider changes (for `useSyncExternalStore`). */
export const subscribeAIProvider = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Monotonic version; changes whenever the provider is set or cleared. */
export const getAIProviderVersion = (): number => version;
