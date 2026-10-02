// Global state for the AI Image Generate plugin.
// Keeps the registered provider instance and notifies subscribers when it changes.

import type { AIImageProvider } from "./index";

let _provider: AIImageProvider | null = null;
let _version = 0;
const _subscribers = new Set<() => void>();

export function getAIImageProvider(): AIImageProvider | null {
  return _provider;
}

export function setAIImageProvider(p: AIImageProvider): void {
  _provider = p;
  _version++;
  _subscribers.forEach((cb) => cb());
}

export function getAIImageProviderVersion(): number {
  return _version;
}

export function subscribeAIImageProvider(cb: () => void): () => void {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}
