import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leading,
  disabled,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    fullWidth ? '' : 'btn--inline',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="spinner" aria-hidden />
      ) : (
        <>
          {leading}
          <AppText as="span" variant="button" color={variant === 'primary' ? 'onPrimary' : variant === 'danger' ? 'danger' : 'primary'}>
            {label}
          </AppText>
        </>
      )}
    </button>
  );
}
