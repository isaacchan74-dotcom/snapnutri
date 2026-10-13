import type { TextareaHTMLAttributes } from 'react';

import { AppText } from './AppText';

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helper?: string;
  error?: string | null;
};

export function TextAreaField({ label, helper, error, className, id, ...rest }: TextAreaFieldProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="field">
      {label ? (
        <AppText as="label" variant="label" color="secondary">
          {label}
        </AppText>
      ) : null}

      <div
        className={
          error
            ? 'field__control field__control--multiline field__control--error'
            : 'field__control field__control--multiline'
        }
      >
        <textarea
          id={inputId}
          className={['field__input', 'field__input--textarea', className ?? ''].join(' ')}
          {...rest}
        />
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
