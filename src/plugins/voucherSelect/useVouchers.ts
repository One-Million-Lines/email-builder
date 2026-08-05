import { useEffect, useSyncExternalStore } from "react";
import type { Voucher } from "../../core/plugins";
import {
  getVoucherProvider,
  getVoucherCache,
  getVoucherStateVersion,
  subscribeVoucherState,
  loadVouchers,
  type VoucherLoadStatus,
} from "./state";

export interface UseVouchers {
  available: boolean;
  status: VoucherLoadStatus;
  vouchers: Voucher[];
  error?: string;
  reload: () => void;
}

/**
 * Reactive access to the voucher list. Triggers a lazy load the first time it
 * is used (when a voucher block is selected) unless the list is already cached
 * or was preloaded at editor start.
 */
export function useVouchers(): UseVouchers {
  useSyncExternalStore(subscribeVoucherState, getVoucherStateVersion, getVoucherStateVersion);
  const available = getVoucherProvider() !== null;
  const cache = getVoucherCache();

  useEffect(() => {
    if (available && cache.status === "idle") void loadVouchers();
  }, [available, cache.status]);

  return {
    available,
    status: cache.status,
    vouchers: cache.vouchers,
    error: cache.error,
    reload: () => void loadVouchers(true),
  };
}
