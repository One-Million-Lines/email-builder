import { create } from "zustand";
import type { MergeTag } from "../../core/types";

interface MergeTagsState {
  mergeTags: MergeTag[];
  setMergeTags: (tags: MergeTag[]) => void;
}

export const useMergeTagsStore = create<MergeTagsState>((set) => ({
  mergeTags: [],
  setMergeTags: (tags) => set({ mergeTags: tags }),
}));

export function setMergeTagsGlobal(tags: MergeTag[]): void {
  useMergeTagsStore.getState().setMergeTags(tags);
}
