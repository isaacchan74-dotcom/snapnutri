import { useEffect, useRef } from 'react';

import { useUiStore } from '../store/uiStore';

export function ModalHost() {
  const modal = useUiStore((state) => state.modal);
  const close = useUiStore((state) => state.closeModal);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const timer = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('input,button')?.focus(), 10);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [modal, close]);

  if (!modal) return null;
  return (
    <div className="overlay" onClick={(event) => event.target === event.currentTarget && close()}>
      <section ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label={modal.title}>
        <div className="sheet-top">
          <h2>{modal.title}</h2>
          <button className="iconbtn" aria-label="Close dialog" onClick={close}>
            ×
          </button>
        </div>
        {modal.body}
      </section>
    </div>
  );
}

export function ToastHost() {
  const toast = useUiStore((state) => state.toast);
  return (
    <div role="status" aria-live="polite">
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
