import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { THEME_MODES, type ThemeMode } from '../theme/palettes';

type ThemeState = {
  mode: ThemeMode;
  /** False until the persisted choice has been read from disk. */
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      hydrated: false,
      setMode: (mode) => set({ mode }),
      cycleMode: () => {
        const next = (THEME_MODES.indexOf(get().mode) + 1) % THEME_MODES.length;
        set({ mode: THEME_MODES[next] });
      },
    }),
    {
      name: 'snapnutri.theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        useThemeStore.setState({ hydrated: true, mode: state?.mode ?? 'light' });
      },
    },
  ),
);
