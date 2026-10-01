import { create } from "zustand";

export interface RecommendationFeed {
  id: string;
  title: string;
}

export type ItemSuggestion = { id: string; name: string };
export type SuggesterFn = (query: string) => Promise<ItemSuggestion[]>;

// ---------------------------------------------------------------------------
// Module-level singleton for category suggester.
// Using a plain variable (not Zustand) avoids the dual-instance issue that
// can occur when npm-linked packages are bundled into separate chunks by Vite.
// ---------------------------------------------------------------------------

let _categorySuggester: SuggesterFn | null = null;

export function getRecommendationCategorySuggester(): SuggesterFn | null {
  return _categorySuggester;
}

interface RecommendationsPluginState {
  /** True when the host app has explicitly registered the recommendations plugin. */
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  /** Available source feeds passed in by the host app. */
  feeds: RecommendationFeed[];
  setFeeds: (feeds: RecommendationFeed[]) => void;
}

export const useRecommendationsStore = create<RecommendationsPluginState>((set) => ({
  enabled: false,
  setEnabled: (v) => set((s) => (s.enabled === v ? s : { enabled: v })),
  feeds: [],
  setFeeds: (feeds) => set({ feeds }),
}));

export function enableRecommendations(): void {
  useRecommendationsStore.getState().setEnabled(true);
}

/**
 * Pass a list of available source feeds to the recommendations panel.
 * When >1 feed is provided the manual-mode "Source feed" field renders as a select dropdown.
 */
export function setRecommendationFeeds(feeds: RecommendationFeed[]): void {
  useRecommendationsStore.getState().setFeeds(feeds);
}

/**
 * Register an async function that returns category suggestions for a search query.
 * Uses a module-level singleton so it works reliably across Vite chunk boundaries.
 */
export function setRecommendationCategorySuggester(fn: SuggesterFn | null): void {
  _categorySuggester = fn;
}
