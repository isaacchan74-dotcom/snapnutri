import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isThemeMode, type ColorTokens, type ThemeMode } from '../theme/palettes';
import { generateShufflePalette, isColorTokens } from '../theme/shufflePalette';

type ThemeState = {
  mode: ThemeMode;
  shufflePalette: ColorTokens | null;
  setMode: (mode: ThemeMode) => void;
  reshuffle: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      shufflePalette: null,
      setMode: (mode) => {
        if (mode !== 'shuffle') {
          set({ mode });
          return;
        }
        set({
          mode,
          shufflePalette: get().shufflePalette ?? generateShufflePalette(),
        });
      },
      reshuffle: () => {
        set({ mode: 'shuffle', shufflePalette: generateShufflePalette() });
      },
    }),
    {
      name: 'snapnutri.theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ mode: state.mode, shufflePalette: state.shufflePalette }),
      merge: (persisted, current) => {
        const stored = persisted as { mode?: unknown; shufflePalette?: unknown } | undefined;
        return {
          ...current,
          mode: isThemeMode(stored?.mode) ? stored.mode : current.mode,
          shufflePalette: isColorTokens(stored?.shufflePalette)
            ? stored.shufflePalette
            : current.shufflePalette,
        };
      },
    },
  ),
);
