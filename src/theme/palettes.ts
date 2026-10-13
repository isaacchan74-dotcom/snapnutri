/**
 * Colour token sets. One entry per theme mode.
 *
 * To restyle the whole app, edit values here — never in a screen or component.
 * Every key must exist in every palette so modes stay swappable.
 */

export const THEME_MODES = ['light', 'dark', 'shuffle'] as const;

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

const light: ColorTokens = {
  background: '#F6EDD8',
  backgroundGradient: 'linear-gradient(165deg, #FFF8EB 0%, #F3E4C8 52%, #E8D4B0 100%)',
  heroGradient: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)',
  surface: '#FFFBF3',
  surfaceMuted: '#F4E6CC',
  surfaceRaised: '#FFFFFF',
  border: '#D9C4A0',
  borderStrong: '#1E3A8A',

  textPrimary: '#1A140C',
  textSecondary: '#5C4A32',
  textMuted: '#8A7358',
  textOnPrimary: '#FFF8EB',
  textOnAccent: '#082018',
  ink: '#1A140C',

  primary: '#1D4ED8',
  primaryPressed: '#1E3A8A',
  primarySoft: '#DCE6FA',

  accent: '#0D9488',
  accentSoft: '#D5F3EE',

  blockBrand: '#1D4ED8',
  blockAccent: '#F59E0B',

  success: '#15803D',
  warning: '#D97706',
  danger: '#DC2626',
  dangerSoft: '#FDE8E8',
  info: '#0284C7',

  protein: '#E11D48',
  carbs: '#0284C7',
  fat: '#D97706',

  tabBarBackground: '#FFF8EB',
  tabBarActive: '#1D4ED8',
  tabBarInactive: '#8A7358',
  tabBarBorder: '#D9C4A0',

  overlay: 'rgba(26, 20, 12, 0.45)',
  shadow: '#1D4ED8',
  skeleton: '#EDE0C8',
};

const dark: ColorTokens = {
  background: '#030712',
  backgroundGradient: 'linear-gradient(165deg, #0B1F3A 0%, #06101F 48%, #020408 100%)',
  heroGradient: 'linear-gradient(135deg, #2563EB 0%, #22D3EE 100%)',
  surface: '#0B1526',
  surfaceMuted: '#122033',
  surfaceRaised: '#1A2D4A',
  border: '#1E3A5F',
  borderStrong: '#38BDF8',

  textPrimary: '#F0F7FF',
  textSecondary: '#93C5FD',
  textMuted: '#60A5FA',
  textOnPrimary: '#041018',
  textOnAccent: '#041018',
  ink: '#020408',

  primary: '#3B82F6',
  primaryPressed: '#1D4ED8',
  primarySoft: '#0B2545',

  accent: '#22D3EE',
  accentSoft: '#083344',

  blockBrand: '#3B82F6',
  blockAccent: '#22D3EE',

  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#FB7185',
  dangerSoft: '#3F1420',
  info: '#38BDF8',

  protein: '#FB7185',
  carbs: '#38BDF8',
  fat: '#FACC15',

  tabBarBackground: '#020617',
  tabBarActive: '#38BDF8',
  tabBarInactive: '#64748B',
  tabBarBorder: '#1E3A5F',

  overlay: 'rgba(2, 4, 8, 0.64)',
  shadow: '#3B82F6',
  skeleton: '#122033',
};

const shuffle: ColorTokens = {
  background: '#07101A',
  backgroundGradient: 'linear-gradient(165deg, #0EA5E9 0%, #7C3AED 54%, #07101A 100%)',
  heroGradient: 'linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)',
  surface: '#102033',
  surfaceMuted: '#173049',
  surfaceRaised: '#1E3A5F',
  border: '#0284C7',
  borderStrong: '#67E8F9',

  textPrimary: '#F0FBFF',
  textSecondary: '#A5F3FC',
  textMuted: '#67E8F9',
  textOnPrimary: '#061018',
  textOnAccent: '#14061C',
  ink: '#040B12',

  primary: '#22D3EE',
  primaryPressed: '#0891B2',
  primarySoft: '#0B2A36',

  accent: '#D946EF',
  accentSoft: '#3B0764',

  blockBrand: '#22D3EE',
  blockAccent: '#D946EF',

  success: '#C8FF00',
  warning: '#FBBF24',
  danger: '#FF4D6D',
  dangerSoft: '#3F1020',
  info: '#38BDF8',

  protein: '#FB7185',
  carbs: '#22D3EE',
  fat: '#FDE047',

  tabBarBackground: '#040B12',
  tabBarActive: '#22D3EE',
  tabBarInactive: '#C4B5FD',
  tabBarBorder: '#1E3A5F',

  overlay: 'rgba(4, 11, 18, 0.62)',
  shadow: '#22D3EE',
  skeleton: '#173049',
};

export const palettes: Record<ThemeMode, ColorTokens> = { light, dark, shuffle };

export const modeAppearance: Record<ThemeMode, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  shuffle: 'dark',
};

export const modeLabels: Record<ThemeMode, { label: string; emoji: string }> = {
  light: { label: 'Light', emoji: '☀️' },
  dark: { label: 'Dark', emoji: '🌙' },
  shuffle: { label: 'Shuffle', emoji: '🎲' },
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}
