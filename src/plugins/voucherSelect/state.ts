// Reactive holder for the configured VoucherProvider + a cached voucher list.
//
// The voucher-select UI (the "Select voucher" panel on voucher blocks) only
// appears when a provider has been wired up — via the `voucherPlugin`, the
// `voucherProvider` prop, or `builder.registerVoucherProvider`. The voucher
// list is fetched once and cached: whether the load is triggered lazily when a
// voucher block is first selected, or eagerly at editor start (see the plugin's
// `preload` option), subsequent reads are instant.

import type { Voucher, VoucherProvider } from "../../core/plugins";

type Listener = () => void;

export type VoucherLoadStatus = "idle" | "loading" | "loaded" | "error";

export interface VoucherCache {
  status: VoucherLoadStatus;
  vouchers: Voucher[];
  error?: string;
}

let provider: VoucherProvider | null = null;
let cache: VoucherCache = { status: "idle", vouchers: [] };
let inflight: Promise<Voucher[]> | null = null;

const listeners = new Set<Listener>();
let version = 0;

function emit() {
  version += 1;
  for (const l of listeners) l();
}

/** Set (or clear) the active voucher provider. Resets the cache and notifies. */
export function setVoucherProvider(next: VoucherProvider | null) {
  if (provider === next) return;
  provider = next;
  cache = { status: "idle", vouchers: [] };
  inflight = null;
  emit();
}

/** The active voucher provider, or null when voucher select is not configured. */
export function getVoucherProvider(): VoucherProvider | null {
  return provider;
}

/** Current cached voucher list + load status. */
export function getVoucherCache(): VoucherCache {
  return cache;
}

/**
 * Load the voucher list (once). Concurrent callers share one request; a
 * successful result is cached until the provider changes or `force` is passed.
 */
export function loadVouchers(force = false): Promise<Voucher[]> {
  if (!provider) return Promise.resolve([]);
  if (!force && cache.status === "loaded") return Promise.resolve(cache.vouchers);
  if (inflight) return inflight;

  cache = { status: "loading", vouchers: cache.vouchers };
  emit();

  const p = provider
    .list()
    .then((vouchers) => {
      cache = { status: "loaded", vouchers: Array.isArray(vouchers) ? vouchers : [] };
      inflight = null;
      emit();
      return cache.vouchers;
    })
    .catch((err) => {
      cache = {
        status: "error",
        vouchers: [],
        error: err instanceof Error ? err.message : String(err),
      };
      inflight = null;
      emit();
      return [];
    });

  inflight = p;
  return p;
}

/** Subscribe to provider/cache changes (for `useSyncExternalStore`). */
export const subscribeVoucherState = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Monotonic version; changes whenever the provider or cache changes. */
export const getVoucherStateVersion = (): number => version;
