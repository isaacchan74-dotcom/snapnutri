import type { Theme } from './theme';

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function px(value: number): string {
  return `${value}px`;
}

/**
 * Pushes every token onto `:root` as a CSS custom property.
 * Components then style themselves with `var(--…)` — never raw values.
 */
export function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;

  root.dataset.theme = theme.mode;
  root.dataset.appearance = theme.appearance;
  root.style.colorScheme = theme.appearance;

  setVars(root, theme.colors, 'color');
  setVars(root, theme.shadows, 'shadow');
  setVars(root, theme.letterSpacing, 'tracking');
  setVars(root, theme.fontWeight, 'weight');
  setVars(root, theme.fontFamily, 'font');

  setNumeric(root, theme.spacing, 'space', px);
  setNumeric(root, theme.radius, 'radius', px);
  setNumeric(root, theme.fontSize, 'font', px);
  setNumeric(root, theme.borderWidth, 'border', px);
  setNumeric(root, theme.iconSize, 'icon', px);
  setNumeric(root, theme.duration, 'duration', (value) => `${value}ms`);
  setNumeric(root, theme.opacity, 'opacity', String);
  setNumeric(root, theme.layout, 'layout', px);

  Object.entries(theme.typography).forEach(([name, style]) => {
    root.style.setProperty(`--type-${kebab(name)}-size`, px(style.fontSize));
    root.style.setProperty(`--type-${kebab(name)}-leading`, px(style.lineHeight));
    root.style.setProperty(`--type-${kebab(name)}-weight`, style.fontWeight);
    root.style.setProperty(`--type-${kebab(name)}-tracking`, style.letterSpacing);
  });
}

function setVars(root: HTMLElement, record: Record<string, string>, prefix: string): void {
  Object.entries(record).forEach(([key, value]) => {
    root.style.setProperty(`--${prefix}-${kebab(key)}`, value);
  });
}

function setNumeric(
  root: HTMLElement,
  record: Record<string, number>,
  prefix: string,
  format: (value: number) => string,
): void {
  Object.entries(record).forEach(([key, value]) => {
    root.style.setProperty(`--${prefix}-${kebab(key)}`, format(value));
  });
}
