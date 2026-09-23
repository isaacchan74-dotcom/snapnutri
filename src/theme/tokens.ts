/**
 * Mode-independent design primitives.
 *
 * These never change between light / dark / blue. Only `palettes.ts` changes.
 * Nothing outside `src/theme` should ever define a raw number or colour.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fontSize = {
  xxs: 11,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 42,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const letterSpacing = {
  tight: '-0.6px',
  normal: '0',
  wide: '0.4px',
  wider: '1.2px',
} as const;

export const borderWidth = {
  none: 0,
  hairline: 1,
  thick: 2,
  chunky: 3,
} as const;

export const opacity = {
  full: 1,
  pressed: 0.82,
  muted: 0.6,
  disabled: 0.4,
  faint: 0.12,
} as const;

export const iconSize = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 44,
} as const;

export const duration = {
  instant: 80,
  fast: 140,
  normal: 220,
  slow: 360,
} as const;

export const fontFamily = {
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.xl,
  screenPaddingVertical: spacing.lg,
  maxContentWidth: 540,
  appFrameWidth: 430,
  tabBarHeight: 64,
  tabBarPaddingTop: spacing.sm,
  inputHeight: 54,
  buttonSm: 40,
  buttonMd: 52,
  buttonLg: 58,
  progressBarHeight: 10,
  avatarSize: 72,
  chartHeight: 200,
} as const;

export const typography = {
  display: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.12,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
  },
  title: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.2,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  heading: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.25,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
  },
  subtitle: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * 1.4,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  bodyStrong: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.45,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.35,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wider,
  },
  metric: {
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * 1.1,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
  },
  button: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.25,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
