/**
 * Colour token sets. One entry per theme mode.
 *
 * To restyle the whole app, edit values here — never in a screen or component.
 * Every key must exist in every palette so modes stay swappable.
 */

export const THEME_MODES = ['light', 'dark', 'blue'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export type ColorTokens = {
  background: string;
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

  primary: string;
  primaryPressed: string;
  primarySoft: string;

  accent: string;
  accentSoft: string;

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
  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF1F5',
  surfaceRaised: '#FFFFFF',
  border: '#E1E7EE',
  borderStrong: '#C9D3DE',

  textPrimary: '#141A21',
  textSecondary: '#566073',
  textMuted: '#909BAA',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#3A2200',

  primary: '#56C32A',
  primaryPressed: '#47A420',
  primarySoft: '#E7F7DE',

  accent: '#FF9F1C',
  accentSoft: '#FFF1DC',

  success: '#2FA96A',
  warning: '#E8A020',
  danger: '#E04B4B',
  dangerSoft: '#FDE8E8',
  info: '#3B82F6',

  protein: '#FF6B6B',
  carbs: '#4D96FF',
  fat: '#FFC145',

  tabBarBackground: '#FFFFFF',
  tabBarActive: '#56C32A',
  tabBarInactive: '#98A3B3',
  tabBarBorder: '#E1E7EE',

  overlay: 'rgba(15, 20, 26, 0.45)',
  shadow: '#0B1220',
  skeleton: '#E4E9EF',
};

const dark: ColorTokens = {
  background: '#0E1318',
  surface: '#171E25',
  surfaceMuted: '#212A33',
  surfaceRaised: '#1B232B',
  border: '#2A343E',
  borderStrong: '#3A4753',

  textPrimary: '#F1F5F9',
  textSecondary: '#A7B3C1',
  textMuted: '#6F7D8C',
  textOnPrimary: '#08150B',
  textOnAccent: '#2A1A00',

  primary: '#63D633',
  primaryPressed: '#52B928',
  primarySoft: '#1B2F14',

  accent: '#FFB454',
  accentSoft: '#3A2A12',

  success: '#3FC486',
  warning: '#F3B13C',
  danger: '#F06A6A',
  dangerSoft: '#3A1D1D',
  info: '#5C9DFF',

  protein: '#FF8585',
  carbs: '#6FAAFF',
  fat: '#FFD066',

  tabBarBackground: '#151C23',
  tabBarActive: '#63D633',
  tabBarInactive: '#6F7D8C',
  tabBarBorder: '#242E38',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  skeleton: '#232D37',
};

const blue: ColorTokens = {
  background: '#081C33',
  surface: '#0F2A49',
  surfaceMuted: '#163657',
  surfaceRaised: '#123050',
  border: '#1E4571',
  borderStrong: '#2C5C8F',

  textPrimary: '#EAF3FF',
  textSecondary: '#A6C3E4',
  textMuted: '#6F92BB',
  textOnPrimary: '#04203C',
  textOnAccent: '#20180A',

  primary: '#31A0FF',
  primaryPressed: '#2183DA',
  primarySoft: '#123B61',

  accent: '#FFD166',
  accentSoft: '#3B3218',

  success: '#3FD49B',
  warning: '#FFC552',
  danger: '#FF7A7A',
  dangerSoft: '#3D1F2B',
  info: '#7BB8FF',

  protein: '#FF8FA3',
  carbs: '#5FC8FF',
  fat: '#FFD98A',

  tabBarBackground: '#0C2543',
  tabBarActive: '#31A0FF',
  tabBarInactive: '#6F92BB',
  tabBarBorder: '#1A3E66',

  overlay: 'rgba(3, 14, 26, 0.65)',
  shadow: '#02101F',
  skeleton: '#16375A',
};

export const palettes: Record<ThemeMode, ColorTokens> = { light, dark, blue };

export const modeAppearance: Record<ThemeMode, 'light' | 'dark'> = {
  light: 'light',
  dark: 'dark',
  blue: 'dark',
};

export const modeLabels: Record<ThemeMode, { label: string; emoji: string }> = {
  light: { label: 'Light', emoji: '☀️' },
  dark: { label: 'Dark', emoji: '🌙' },
  blue: { label: 'Blue', emoji: '🌊' },
};
