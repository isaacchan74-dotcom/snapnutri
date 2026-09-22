import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/palettes';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'snapnutri.theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
