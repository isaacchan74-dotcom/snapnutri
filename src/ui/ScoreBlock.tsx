import type { PetProgress } from '../api/pet';

export function ScoreBlock({ pet, detail = false }: { pet: PetProgress | null; detail?: boolean }) {
  const rows: ['happiness' | 'health', string, string][] = [
    ['happiness', 'Happiness', 'Grows when you check in, log meals, and spend time with Pika.'],
    ['health', 'Health', 'Grows through balanced days and healthy habits.'],
  ];
  return (
    <div className={detail ? 'detail-scores' : 'scores'}>
      {rows.map(([key, label, blurb]) => {
        const value = pet?.[key] ?? 0;
        return (
          <div key={key} className={key}>
            <div className="score-label">
              <span>{label}</span>
              <strong>
                {pet ? value : '—'}
                <span className="muted"> / 100</span>
              </strong>
            </div>
            <div className="bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
              <span style={{ width: `${value}%` }} />
            </div>
            {detail ? <p>{blurb}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
