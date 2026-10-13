import type { ColorTokens } from './palettes';

const COLOR_KEYS: (keyof ColorTokens)[] = [
  'background',
  'backgroundGradient',
  'heroGradient',
  'surface',
  'surfaceMuted',
  'surfaceRaised',
  'border',
  'borderStrong',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'textOnPrimary',
  'textOnAccent',
  'ink',
  'primary',
  'primaryPressed',
  'primarySoft',
  'accent',
  'accentSoft',
  'blockBrand',
  'blockAccent',
  'success',
  'warning',
  'danger',
  'dangerSoft',
  'info',
  'protein',
  'carbs',
  'fat',
  'tabBarBackground',
  'tabBarActive',
  'tabBarInactive',
  'tabBarBorder',
  'overlay',
  'shadow',
  'skeleton',
];

type Scheme = 'complement' | 'split' | 'triad' | 'analog';

/** Bold dark palette with locked hue relationships and readable contrast. */
export function generateShufflePalette(): ColorTokens {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const palette = buildPalette();
    if (isUsable(palette)) return palette;
  }
  return buildPalette();
}

export function isColorTokens(value: unknown): value is ColorTokens {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return COLOR_KEYS.every((key) => typeof record[key] === 'string' && record[key].length > 3);
}

function buildPalette(): ColorTokens {
  const scheme = pick<Scheme>(['complement', 'split', 'triad', 'analog']);
  const hue = rand(0, 360);
  let accentHue = accentFor(hue, scheme);
  if (hueDistance(hue, accentHue) < 42) {
    accentHue = wrapHue(hue + 168);
  }

  const bgHue = wrapHue(hue + rand(-16, 16));
  const bgSat = rand(42, 64);
  const bgL = rand(5, 9);

  const primarySat = rand(90, 100);
  const primaryL = rand(52, 61);
  const accentSat = rand(88, 100);
  const accentL = rand(54, 64);

  const background = hslToHex(bgHue, bgSat, bgL);
  const surface = hslToHex(bgHue, bgSat + 6, bgL + 8);
  const surfaceMuted = hslToHex(bgHue, bgSat + 2, bgL + 12);
  const surfaceRaised = hslToHex(hue, Math.min(78, bgSat + 18), bgL + 18);
  const primary = hslToHex(hue, primarySat, primaryL);
  const accent = hslToHex(accentHue, accentSat, accentL);
  const ink = hslToHex(bgHue, 40, 5);
  const textPrimary = hslToHex(hue, 16, 97);
  const textSecondary = hslToHex(accentHue, 52, 80);
  const textMuted = hslToHex(hue, 58, 72);
  const textOnPrimary = contrastInk(primary);
  const textOnAccent = contrastInk(accent);
  const tabBarBackground = hslToHex(bgHue, bgSat, Math.max(4, bgL - 2));
  const tabBarActive = betterOn(tabBarBackground, accent, primary);

  return {
    background,
    backgroundGradient: `linear-gradient(165deg, ${hslToHex(hue, 72, 36)} 0%, ${hslToHex(accentHue, 68, 32)} 52%, ${background} 100%)`,
    heroGradient: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
    surface,
    surfaceMuted,
    surfaceRaised,
    border: hslToHex(hue, 68, 36),
    borderStrong: hslToHex(hue, 82, 68),

    textPrimary,
    textSecondary,
    textMuted,
    textOnPrimary,
    textOnAccent,
    ink,

    primary,
    primaryPressed: hslToHex(hue, primarySat, Math.max(36, primaryL - 12)),
    primarySoft: hslToHex(hue, 48, 14),

    accent,
    accentSoft: hslToHex(accentHue, 42, 14),

    blockBrand: primary,
    blockAccent: accent,

    success: hslToHex(wrapHue(108 + rand(-8, 8)), 86, 62),
    warning: hslToHex(wrapHue(42 + rand(-6, 6)), 92, 58),
    danger: hslToHex(wrapHue(352 + rand(-6, 6)), 90, 62),
    dangerSoft: hslToHex(352, 42, 14),
    info: hslToHex(wrapHue(196 + rand(-8, 8)), 86, 64),

    protein: hslToHex(wrapHue(346 + rand(-8, 8)), 90, 64),
    carbs: hslToHex(wrapHue(194 + rand(-8, 8)), 86, 64),
    fat: hslToHex(wrapHue(50 + rand(-6, 6)), 92, 60),

    tabBarBackground,
    tabBarActive,
    tabBarInactive: hslToHex(accentHue, 36, 70),
    tabBarBorder: surfaceRaised,

    overlay: hexToRgba(ink, 0.62),
    shadow: primary,
    skeleton: surfaceMuted,
  };
}

function isUsable(palette: ColorTokens): boolean {
  return (
    contrast(palette.textPrimary, palette.background) >= 7 &&
    contrast(palette.textPrimary, palette.surface) >= 6.2 &&
    contrast(palette.textOnPrimary, palette.primary) >= 4.5 &&
    contrast(palette.textOnAccent, palette.accent) >= 4.5 &&
    contrast(palette.tabBarActive, palette.tabBarBackground) >= 3.2 &&
    hueDistance(hexToHsl(palette.primary).h, hexToHsl(palette.accent).h) >= 40
  );
}

function accentFor(hue: number, scheme: Scheme): number {
  switch (scheme) {
    case 'complement':
      return wrapHue(hue + 180 + rand(-10, 10));
    case 'split':
      return wrapHue(hue + pick([148, 212]) + rand(-6, 6));
    case 'triad':
      return wrapHue(hue + pick([118, 242]) + rand(-8, 8));
    case 'analog':
      return wrapHue(hue + pick([46, -46]));
  }
}

function contrastInk(background: string): string {
  const light = '#FFF7FB';
  const dark = '#120814';
  return contrast(background, light) >= contrast(background, dark) ? light : dark;
}

function betterOn(background: string, a: string, b: string): string {
  return contrast(background, a) >= contrast(background, b) ? a : b;
}

function contrast(a: string, b: string): number {
  const left = relativeLuminance(a);
  const right = relativeLuminance(b);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = wrapHue(h) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  if (sat === 0) return rgbToHex(light * 255, light * 255, light * 255);

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const r = hueToChannel(p, q, hue + 1 / 3);
  const g = hueToChannel(p, q, hue);
  const b = hueToChannel(p, q, hue - 1 / 3);
  return rgbToHex(r * 255, g * 255, b * 255);
}

function hueToChannel(p: number, q: number, t: number): number {
  let tone = t;
  if (tone < 0) tone += 1;
  if (tone > 1) tone -= 1;
  if (tone < 1 / 6) return p + (q - p) * 6 * tone;
  if (tone < 1 / 2) return q;
  if (tone < 2 / 3) return p + (q - p) * (2 / 3 - tone) * 6;
  return p;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace('#', '');
  const value = raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw;
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const light = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: light * 100 };

  const delta = max - min;
  const sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === nr) hue = (ng - nb) / delta + (ng < nb ? 6 : 0);
  else if (max === ng) hue = (nb - nr) / delta + 2;
  else hue = (nr - ng) / delta + 4;
  return { h: hue * 60, s: sat * 100, l: light * 100 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function wrapHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

function hueDistance(a: number, b: number): number {
  const delta = Math.abs(wrapHue(a) - wrapHue(b));
  return Math.min(delta, 360 - delta);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
