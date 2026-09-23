import {
  borderWidth,
  duration,
  fontFamily,
  fontSize,
  fontWeight,
  iconSize,
  layout,
  letterSpacing,
  opacity,
  radius,
  spacing,
  typography,
} from './tokens';
import { modeAppearance, palettes, type ColorTokens, type ThemeMode } from './palettes';

export type ShadowTokens = {
  none: string;
  soft: string;
  card: string;
  raised: string;
};

function createShadows(colors: ColorTokens, mode: ThemeMode): ShadowTokens {
  const isLight = modeAppearance[mode] === 'light';
  const alpha = isLight ? 0.08 : 0.35;

  return {
    none: 'none',
    soft: `0 2px 6px ${hexToRgba(colors.shadow, alpha * 0.6)}`,
    card: `0 4px 12px ${hexToRgba(colors.shadow, alpha)}`,
    raised: `0 8px 20px ${hexToRgba(colors.shadow, alpha * 1.3)}`,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const value = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type Theme = {
  mode: ThemeMode;
  appearance: 'light' | 'dark';
  colors: ColorTokens;
  shadows: ShadowTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  letterSpacing: typeof letterSpacing;
  borderWidth: typeof borderWidth;
  opacity: typeof opacity;
  iconSize: typeof iconSize;
  duration: typeof duration;
  fontFamily: typeof fontFamily;
  layout: typeof layout;
  typography: typeof typography;
};

function createTheme(mode: ThemeMode): Theme {
  const colors = palettes[mode];

  return {
    mode,
    appearance: modeAppearance[mode],
    colors,
    shadows: createShadows(colors, mode),
    spacing,
    radius,
    fontSize,
    fontWeight,
    letterSpacing,
    borderWidth,
    opacity,
    iconSize,
    duration,
    fontFamily,
    layout,
    typography,
  };
}

export const themes: Record<ThemeMode, Theme> = {
  light: createTheme('light'),
  dark: createTheme('dark'),
  blue: createTheme('blue'),
  sunset: createTheme('sunset'),
  mint: createTheme('mint'),
};
