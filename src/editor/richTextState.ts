/**
 * Minimal shared state for coordinating the floating RichTextToolbar with
 * individual contenteditable TextRender elements in the Canvas.
 *
 * Architecture:
 *  - TextRender sets `activeEl` on focus and clears it on blur
 *  - RichTextToolbar reads `activeEl` to decide visibility and applies
 *    execCommand / insertHTML while the element holds focus
 */
import { create } from "zustand";

interface RichTextState {
  /** The currently focused contenteditable element, or null. */
  activeEl: HTMLElement | null;
  setActiveEl: (el: HTMLElement | null) => void;
}

export const useRichTextStore = create<RichTextState>((set) => ({
  activeEl: null,
  setActiveEl: (el) => set({ activeEl: el }),
}));
