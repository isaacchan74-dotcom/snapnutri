import type { ReactNode } from 'react';

import { AppText } from './AppText';

type ScreenContainerProps = {
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: string;
  eyebrow?: string;
  center?: boolean;
  footer?: ReactNode;
  headerRight?: ReactNode;
};

export function ScreenContainer({
  children,
  title,
  subtitle,
  eyebrow,
  center = false,
  footer,
  headerRight,
}: ScreenContainerProps) {
  const hasHeader = Boolean(title || subtitle || eyebrow || headerRight);

  return (
    <section className="screen">
      <div className={center ? 'screen__scroll screen__scroll--center' : 'screen__scroll'}>
        {hasHeader ? (
          <header className="screen__header">
            <div className="screen__heading">
              {eyebrow ? (
                <AppText variant="label" color="brand">
                  {eyebrow}
                </AppText>
              ) : null}
              {typeof title === 'string' ? (
                <AppText as="h1" variant="title">
                  {title}
                </AppText>
              ) : (
                title
              )}
              {subtitle ? (
                <AppText variant="body" color="secondary">
                  {subtitle}
                </AppText>
              ) : null}
            </div>
            {headerRight}
          </header>
        ) : null}
        <div className="screen__body">{children}</div>
      </div>
      {footer ? <footer className="screen__footer">{footer}</footer> : null}
    </section>
  );
}
