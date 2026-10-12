import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={['icon-btn', className ?? ''].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PenIcon() {
  return (
    <svg className="icon-btn__svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4.2L19.4 8.8a1.8 1.8 0 0 0 0-2.5l-1.7-1.7a1.8 1.8 0 0 0-2.5 0L4 15.8V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.6 6.2 17.8 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg className="icon-btn__svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.5-2-3.4-2.4.6a7.7 7.7 0 0 0-1.7-1L15 3.4h-4l-.4 2.3a7.7 7.7 0 0 0-1.7 1l-2.4-.6-2 3.4 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.4 2.4-.6a7.7 7.7 0 0 0 1.7 1l.4 2.3h4l.4-2.3a7.7 7.7 0 0 0 1.7-1l2.4.6 2-3.4-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
