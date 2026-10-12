import { STATUS_COPY } from '../lib/petStatus';
import type { PetStatus } from '../types/character';

type PetStatusBadgeProps = {
  status: PetStatus;
  size?: 'md' | 'lg';
};

export function PetStatusBadge({ status, size = 'md' }: PetStatusBadgeProps) {
  const copy = STATUS_COPY[status];
  const classes = ['status-pill', `status-pill--${status}`, size === 'lg' ? 'status-pill--lg' : ''];

  return <span className={classes.filter(Boolean).join(' ')}>{copy.label}</span>;
}
