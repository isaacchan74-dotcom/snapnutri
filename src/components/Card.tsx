import type { HTMLAttributes, ReactNode } from 'react';

export type CardTone = 'surface' | 'muted' | 'brand' | 'accent';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

export function Card({ tone = 'surface', padding = 'md', className, children, ...rest }: CardProps) {
  const classes = [
    'card',
    tone === 'muted' ? 'card--muted' : '',
    tone === 'brand' ? 'card--brand' : '',
    tone === 'accent' ? 'card--accent' : '',
    padding === 'sm' ? 'card--sm' : '',
    padding === 'lg' ? 'card--lg' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
