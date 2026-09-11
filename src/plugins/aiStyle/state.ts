// Reactive flag: is the AI Style plugin currently registered?
// Same pattern as ai/state.ts — lets the sidebar subscribe without importing
// the full plugin.

let _registered = false;
let _version = 0;
const _subscribers = new Set<() => void>();

export function isStylePluginRegistered(): boolean {
  return _registered;
}

export function getStylePluginVersion(): number {
  return _version;
}

export function setStylePluginRegistered(value: boolean): void {
  if (_registered === value) return;
  _registered = value;
  _version++;
  _subscribers.forEach((cb) => cb());
}

export function subscribeStylePlugin(cb: () => void): () => void {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}
