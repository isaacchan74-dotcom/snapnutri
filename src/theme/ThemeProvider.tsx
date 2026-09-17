import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useThemeStore } from '../store/themeStore';
import { themes, type Theme } from './theme';
import { modeLabels, THEME_MODES, type ThemeMode } from './palettes';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  availableModes: readonly ThemeMode[];
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const cycleMode = useThemeStore((state) => state.cycleMode);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: themes[mode],
      mode,
      availableModes: THEME_MODES,
      setMode,
      cycleMode,
    }),
    [mode, setMode, cycleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={themes[mode].appearance === 'light' ? 'dark' : 'light'} />
      {children}
    </ThemeContext.Provider>
  );
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return context;
}

/** The only way components should read style values. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/** For the Profile theme switcher. */
export function useThemeControls() {
  const { mode, availableModes, setMode, cycleMode } = useThemeContext();
  return { mode, availableModes, setMode, cycleMode, labels: modeLabels };
}
