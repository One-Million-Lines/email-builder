import { create } from "zustand";

export interface RecommendationFeed {
  id: string;
  title: string;
}

export type ItemSuggestion = { id: string; name: string };
export type SuggesterFn = (query: string) => Promise<ItemSuggestion[]>;

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
