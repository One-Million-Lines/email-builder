import { create } from "zustand";

interface RecommendationsPluginState {
  /** True when the host app has explicitly registered the recommendations plugin. */
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

export const useRecommendationsStore = create<RecommendationsPluginState>((set) => ({
  enabled: false,
  setEnabled: (v) => set({ enabled: v }),
}));

export function enableRecommendations(): void {
  useRecommendationsStore.getState().setEnabled(true);
}
