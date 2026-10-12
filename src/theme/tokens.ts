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
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 36,
  pill: 999,
} as const;

export const fontSize = {
  xxs: 11,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 34,
  xxxl: 48,
  display: 56,
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
  particleBurstMin: 2200,
  particleBurstMax: 4200,
} as const;

/** Chunky 32-bit specks for each diorama backdrop. */
export const dioramaFx = {
  blossom: ['#FF7EB3', '#FFB3D4', '#FF4F8B', '#FFE0EE'],
  meadow: ['#F4F1E4', '#D7E8C6', '#FFFFFF'],
  bluebell: ['#B8E4FF', '#7EC8FF', '#E8F4FF', '#FFFFFF'],
  starGlow: '#FFF8C8',
  starGlowSoft: '#FFE56B',
} as const;

export const fontFamily = {
  sans: '"Outfit", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  headline: '"Archivo Black", "Outfit", ui-sans-serif, sans-serif',
} as const;

/** Pet mood chips stay vivid across themes so status reads at a glance. */
export const petStatus = {
  healthy: '#3DFF7A',
  healthyInk: '#042414',
  healthyGlow: '0 0 22px rgba(61, 255, 122, 0.55)',
  fed: '#FFD23C',
  fedInk: '#3D2800',
  fedGlow: '0 0 22px rgba(255, 210, 60, 0.55)',
  hungry: '#FF7A1A',
  hungryInk: '#2A1200',
  hungryGlow: '0 0 22px rgba(255, 122, 26, 0.5)',
  sick: '#C44B4B',
  sickInk: '#FFF5F5',
  sickGlow: '0 0 18px rgba(196, 75, 75, 0.45)',
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.xl,
  screenPaddingVertical: spacing.lg,
  maxContentWidth: 540,
  appFrameWidth: 430,
  tabBarHeight: 80,
  tabBarPaddingTop: spacing.sm,
  snapTab: 64,
  inputHeight: 54,
  buttonSm: 40,
  buttonMd: 52,
  buttonLg: 58,
  progressBarHeight: 14,
  avatarSize: 72,
  backdropThumb: 52,
  chartHeight: 220,
  characterStage: 260,
  particleScale: 4,
} as const;

export const typography = {
  display: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * 1.02,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
  },
  title: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * 1.05,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
  },
  heading: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * 1.1,
    fontWeight: fontWeight.heavy,
    letterSpacing: letterSpacing.tight,
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
    lineHeight: fontSize.xxxl * 0.95,
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
