/**
 * Colour token sets. One entry per theme mode.
 *
 * To restyle the whole app, edit values here — never in a screen or component.
 * Every key must exist in every palette so modes stay swappable.
 */

export const THEME_MODES = ['volt', 'heat', 'acid'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type ColorTokens = {
  background: string;
  backgroundGradient: string;
  heroGradient: string;
  surface: string;
  surfaceMuted: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  textOnAccent: string;
  ink: string;

  primary: string;
  primaryPressed: string;
  primarySoft: string;

  accent: string;
  accentSoft: string;

  blockBrand: string;
  blockAccent: string;

  success: string;
  warning: string;
  danger: string;
  dangerSoft: string;
  info: string;

  protein: string;
  carbs: string;
  fat: string;

  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  tabBarBorder: string;

  overlay: string;
  shadow: string;
  skeleton: string;
};

const volt: ColorTokens = {
  background: '#16041F',
  backgroundGradient: 'linear-gradient(165deg, #6D28D9 0%, #BE185D 54%, #16041F 100%)',
  heroGradient: 'linear-gradient(135deg, #C026D3 0%, #FB7185 100%)',
  surface: '#2A0A3D',
  surfaceMuted: '#3B0F52',
  surfaceRaised: '#4C1D95',
  border: '#7E22CE',
  borderStrong: '#E879F9',

  textPrimary: '#FFF5FB',
  textSecondary: '#F9A8D4',
  textMuted: '#E879F9',
  textOnPrimary: '#1A0418',
  textOnAccent: '#122000',
  ink: '#120616',

  primary: '#FF2E93',
  primaryPressed: '#DB2777',
  primarySoft: '#4A0D36',

  accent: '#C8FF00',
  accentSoft: '#2A3A00',

  blockBrand: '#FF2E93',
  blockAccent: '#C8FF00',

  success: '#C8FF00',
  warning: '#FFB020',
  danger: '#FF4D6D',
  dangerSoft: '#3F1020',
  info: '#7DD3FC',

  protein: '#FF5C8A',
  carbs: '#7DD3FC',
  fat: '#FDE047',

  tabBarBackground: '#12041A',
  tabBarActive: '#C8FF00',
  tabBarInactive: '#C084FC',
  tabBarBorder: '#4C1D95',

  overlay: 'rgba(10, 2, 16, 0.62)',
  shadow: '#FF2E93',
  skeleton: '#3B0F52',
};

const heat: ColorTokens = {
  background: '#1A0A08',
  backgroundGradient: 'linear-gradient(165deg, #EA580C 0%, #DB2777 56%, #1A0A08 100%)',
  heroGradient: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
  surface: '#3B120C',
  surfaceMuted: '#4C1D12',
  surfaceRaised: '#7C2D12',
  border: '#C2410C',
  borderStrong: '#FB923C',

  textPrimary: '#FFF7ED',
  textSecondary: '#FDBA74',
  textMuted: '#FB7185',
  textOnPrimary: '#1A0A00',
  textOnAccent: '#1A0410',
  ink: '#1A0A08',

  primary: '#FF6B1A',
  primaryPressed: '#C2410C',
  primarySoft: '#4A1608',

  accent: '#FF2E93',
  accentSoft: '#3F1024',

  blockBrand: '#FF6B1A',
  blockAccent: '#FF2E93',

  success: '#C8FF00',
  warning: '#FBBF24',
  danger: '#FF4D6D',
  dangerSoft: '#3F1410',
  info: '#38BDF8',

  protein: '#FB7185',
  carbs: '#38BDF8',
  fat: '#FACC15',

  tabBarBackground: '#140806',
  tabBarActive: '#FF6B1A',
  tabBarInactive: '#F9A8D4',
  tabBarBorder: '#7C2D12',

  overlay: 'rgba(16, 6, 4, 0.62)',
  shadow: '#FF6B1A',
  skeleton: '#4C1D12',
};

const acid: ColorTokens = {
  background: '#081208',
  backgroundGradient: 'linear-gradient(165deg, #3F6212 0%, #14532D 42%, #1E1B4B 100%)',
  heroGradient: 'linear-gradient(135deg, #A3E635 0%, #22C55E 55%, #7C3AED 100%)',
  surface: '#122016',
  surfaceMuted: '#1A2E1C',
  surfaceRaised: '#365314',
  border: '#4D7C0F',
  borderStrong: '#A3E635',

  textPrimary: '#F7FFE8',
  textSecondary: '#D9F99D',
  textMuted: '#A3E635',
  textOnPrimary: '#122000',
  textOnAccent: '#F5F3FF',
  ink: '#081208',

  primary: '#C8FF00',
  primaryPressed: '#84CC16',
  primarySoft: '#1F3308',

  accent: '#A855F7',
  accentSoft: '#2E1064',

  blockBrand: '#C8FF00',
  blockAccent: '#A855F7',

  success: '#86EFAC',
  warning: '#FBBF24',
  danger: '#FF4D6D',
  dangerSoft: '#2A1610',
  info: '#22D3EE',

  protein: '#FB7185',
  carbs: '#22D3EE',
  fat: '#FDE047',

  tabBarBackground: '#06100A',
  tabBarActive: '#C8FF00',
  tabBarInactive: '#A3E635',
  tabBarBorder: '#365314',

  overlay: 'rgba(4, 10, 6, 0.62)',
  shadow: '#C8FF00',
  skeleton: '#1A2E1C',
};

export const palettes: Record<ThemeMode, ColorTokens> = { volt, heat, acid };

export const modeAppearance: Record<ThemeMode, 'light' | 'dark'> = {
  volt: 'dark',
  heat: 'dark',
  acid: 'dark',
};

export const modeLabels: Record<ThemeMode, { label: string; emoji: string }> = {
  volt: { label: 'Volt', emoji: '⚡' },
  heat: { label: 'Heat', emoji: '🔥' },
  acid: { label: 'Acid', emoji: '🍋' },
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}
