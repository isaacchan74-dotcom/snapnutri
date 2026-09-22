import type { InputHTMLAttributes, ReactNode } from 'react';

import { AppText } from './AppText';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string | null;
  trailing?: ReactNode;
};

export function TextField({ label, helper, error, trailing, className, id, ...rest }: TextFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="field">
      {label ? (
        <AppText as="label" variant="label" color="secondary">
          {label}
        </AppText>
      ) : null}

      <div className={error ? 'field__control field__control--error' : 'field__control'}>
        <input id={inputId} className={['field__input', className ?? ''].join(' ')} {...rest} />
        {trailing}
      </div>

      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color="muted">
          {helper}
        </AppText>
      ) : null}
    </div>
  );
}
