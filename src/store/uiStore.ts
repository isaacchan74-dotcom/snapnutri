import type { ReactNode } from 'react';
import { create } from 'zustand';

type Modal = { title: string; body: ReactNode };

type UiState = {
  toast: string | null;
  modal: Modal | null;
  /** Fresh captures, shown instantly while the signed Storage URL loads. */
  localPhotos: Record<string, string>;
  showToast: (text: string) => void;
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
  rememberPhoto: (mealId: string, dataUrl: string) => void;
};

let toastTimer: number | undefined;

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  modal: null,
  localPhotos: {},

  showToast: (text) => {
    window.clearTimeout(toastTimer);
    set({ toast: text });
    toastTimer = window.setTimeout(() => set({ toast: null }), 2800);
  },
  openModal: (title, body) => set({ modal: { title, body } }),
  closeModal: () => set({ modal: null }),
  rememberPhoto: (mealId, dataUrl) =>
    set((state) => ({ localPhotos: { ...state.localPhotos, [mealId]: dataUrl } })),
}));
