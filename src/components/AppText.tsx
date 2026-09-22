import type { ReactNode } from 'react';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'accent'
  | 'danger'
  | 'success'
  | 'onPrimary'
  | 'onAccent';

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'metric'
  | 'button';

type AppTextProps = {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'label';
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center';
  className?: string;
  children: ReactNode;
};

const variantClass: Record<TypographyVariant, string> = {
  display: 'text--display',
  title: 'text--title',
  heading: 'text--heading',
  subtitle: 'text--subtitle',
  body: 'text--body',
  bodyStrong: 'text--body-strong',
  caption: 'text--caption',
  label: 'text--label',
  metric: 'text--metric',
  button: 'text--button',
};

const colorClass: Record<TextColor, string> = {
  primary: 'text--primary',
  secondary: 'text--secondary',
  muted: 'text--muted',
  brand: 'text--brand',
  accent: 'text--accent',
  danger: 'text--danger',
  success: 'text--success',
  onPrimary: 'text--on-primary',
  onAccent: 'text--on-accent',
};

export function AppText({
  as: Tag = 'p',
  variant = 'body',
  color = 'primary',
  align,
  className,
  children,
}: AppTextProps) {
  const classes = [
    'text',
    variantClass[variant],
    colorClass[color],
    align === 'center' ? 'text--center' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
