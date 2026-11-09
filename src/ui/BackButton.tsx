import { Icon } from './Icon';

export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="back-btn" onClick={onClick}>
      <Icon name="back" />
      {label}
    </button>
  );
}
