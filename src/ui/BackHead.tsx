import { useNavigate } from 'react-router-dom';

import { Icon } from './Icon';

type BackHeadProps = {
  title: string;
  sub?: string;
  to?: string;
  label?: string;
  onBack?: () => void;
};

export function BackHead({ title, sub, to, label = 'Back', onBack }: BackHeadProps) {
  const navigate = useNavigate();
  return (
    <div className="backhead">
      <button
        className="iconbtn"
        aria-label={label}
        onClick={() => (onBack ? onBack() : to ? navigate(to) : navigate(-1))}
      >
        <Icon name="back" />
      </button>
      <div>
        <h1>{title}</h1>
        {sub ? <p className="day-date">{sub}</p> : null}
      </div>
    </div>
  );
}
