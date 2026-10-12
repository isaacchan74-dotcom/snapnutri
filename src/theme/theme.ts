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
  petStatus,
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

function createShadows(colors: ColorTokens): ShadowTokens {
  return {
    none: 'none',
    soft: `0 0 18px ${hexToRgba(colors.shadow, 0.28)}`,
    card: `0 10px 28px ${hexToRgba(colors.shadow, 0.22)}`,
    raised: `0 16px 40px ${hexToRgba(colors.shadow, 0.32)}`,
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
  petStatus: typeof petStatus;
};

function createTheme(mode: ThemeMode): Theme {
  const colors = palettes[mode];

  return {
    mode,
    appearance: modeAppearance[mode],
    colors,
    shadows: createShadows(colors),
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
    petStatus,
  };
}

export const themes: Record<ThemeMode, Theme> = {
  volt: createTheme('volt'),
  heat: createTheme('heat'),
  acid: createTheme('acid'),
};
