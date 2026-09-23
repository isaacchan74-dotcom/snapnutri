import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import { useThemeStore } from '../store/themeStore';
import { applyThemeToDocument } from './applyTheme';
import { isThemeMode, modeLabels, THEME_MODES, type ThemeMode } from './palettes';
import { themes, type Theme } from './theme';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  availableModes: readonly ThemeMode[];
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedMode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const mode = isThemeMode(storedMode) ? storedMode : 'light';
  const theme = themes[mode];

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, availableModes: THEME_MODES, setMode }),
    [theme, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return context;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useThemeControls() {
  const { mode, availableModes, setMode } = useThemeContext();
  return { mode, availableModes, setMode, labels: modeLabels };
}
