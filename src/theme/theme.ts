import type { ViewStyle } from 'react-native';

import {
  borderWidth,
  duration,
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
import {
  modeAppearance,
  palettes,
  type ColorTokens,
  type ThemeMode,
} from './palettes';

export type ShadowTokens = {
  none: ViewStyle;
  soft: ViewStyle;
  card: ViewStyle;
  raised: ViewStyle;
};

/**
 * Shadows depend on the palette, so they are built per mode.
 * Dark-ish modes get a deeper, lower-opacity shadow so cards stay readable.
 */
function createShadows(colors: ColorTokens, mode: ThemeMode): ShadowTokens {
  const isLight = modeAppearance[mode] === 'light';
  const shadowOpacity = isLight ? 0.08 : 0.35;

  return {
    none: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    soft: {
      shadowColor: colors.shadow,
      shadowOpacity: shadowOpacity * 0.6,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    card: {
      shadowColor: colors.shadow,
      shadowOpacity,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    raised: {
      shadowColor: colors.shadow,
      shadowOpacity: shadowOpacity * 1.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  };
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
    layout,
    typography,
  };
}

/** Pre-built so a theme switch is a reference swap, not a rebuild. */
export const themes: Record<ThemeMode, Theme> = {
  light: createTheme('light'),
  dark: createTheme('dark'),
  blue: createTheme('blue'),
};
