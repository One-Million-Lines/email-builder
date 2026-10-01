import { useSyncExternalStore } from "react";
import {
  getSuggesterProvider,
  subscribeSuggesterProvider,
  getSuggesterProviderVersion,
} from "./state";

/** Hook: is a suggester provider currently configured? Reactive. */
export function useSuggesterAvailable(): boolean {
  useSyncExternalStore(
    subscribeSuggesterProvider,
    getSuggesterProviderVersion,
    getSuggesterProviderVersion
  );
  return getSuggesterProvider() !== null;
}
