import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import { useThemeStore } from '../store/themeStore';
import { applyThemeToDocument } from './applyTheme';
import { isThemeMode, modeLabels, palettes, THEME_MODES, type ColorTokens, type ThemeMode } from './palettes';
import { createTheme, themes, type Theme } from './theme';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  availableModes: readonly ThemeMode[];
  setMode: (mode: ThemeMode) => void;
  reshuffle: () => void;
  previewFor: (mode: ThemeMode) => ColorTokens;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedMode = useThemeStore((state) => state.mode);
  const shufflePalette = useThemeStore((state) => state.shufflePalette);
  const setMode = useThemeStore((state) => state.setMode);
  const reshuffle = useThemeStore((state) => state.reshuffle);
  const mode = isThemeMode(storedMode) ? storedMode : 'light';
  const theme = useMemo(() => {
    if (mode === 'shuffle') {
      return createTheme('shuffle', shufflePalette ?? palettes.shuffle);
    }
    return themes[mode];
  }, [mode, shufflePalette]);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      availableModes: THEME_MODES,
      setMode,
      reshuffle,
      previewFor: (next) => (next === 'shuffle' ? (shufflePalette ?? palettes.shuffle) : palettes[next]),
    }),
    [theme, mode, setMode, reshuffle, shufflePalette],
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
  const { mode, availableModes, setMode, reshuffle, previewFor } = useThemeContext();
  return { mode, availableModes, setMode, reshuffle, previewFor, labels: modeLabels };
}
