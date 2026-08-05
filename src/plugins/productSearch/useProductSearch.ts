import { useSyncExternalStore } from "react";
import {
  getProductProvider,
  subscribeProductProvider,
  getProductProviderVersion,
} from "./state";

/** Hook: is a product-search provider currently configured? Reactive. */
export function useProductSearchAvailable(): boolean {
  useSyncExternalStore(
    subscribeProductProvider,
    getProductProviderVersion,
    getProductProviderVersion
  );
  return getProductProvider() !== null;
}
