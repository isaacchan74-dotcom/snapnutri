import type { ReactNode } from 'react';
import { create } from 'zustand';

type Modal = { title: string; body: ReactNode };

type UiState = {
  toast: string | null;
  modal: Modal | null;
  /** Fresh captures, shown instantly while the signed Storage URL loads. */
  localPhotos: Record<string, string>;
  /** Replay the first-run tour even if it was already marked complete. */
  tourReplay: boolean;
  showToast: (text: string) => void;
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
  rememberPhoto: (mealId: string, dataUrl: string) => void;
  startTour: () => void;
  endTour: () => void;
};

let toastTimer: number | undefined;

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  modal: null,
  localPhotos: {},
  tourReplay: false,

  showToast: (text) => {
    window.clearTimeout(toastTimer);
    set({ toast: text });
    toastTimer = window.setTimeout(() => set({ toast: null }), 2800);
  },
  openModal: (title, body) => set({ modal: { title, body } }),
  closeModal: () => set({ modal: null }),
  rememberPhoto: (mealId, dataUrl) =>
    set((state) => ({ localPhotos: { ...state.localPhotos, [mealId]: dataUrl } })),
  startTour: () => set({ tourReplay: true }),
  endTour: () => set({ tourReplay: false }),
}));
