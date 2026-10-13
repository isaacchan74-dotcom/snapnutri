import { useNavigate } from 'react-router-dom';

import { formatDay, summarizeDay, todayKey, VEGETABLE_GOAL } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useJournalData } from '../../ui/hooks';

export function TrackerPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const { meals } = useJournalData();
  const today = todayKey();
  const s = summarizeDay(meals, today, profile);
  const vegEnough = s.vegetables.status === 'Enough';
  const g = (value: number) => Math.round(value);

  const rings = [
    { name: 'Protein', status: s.protein.status, value: s.protein.share, detail: `${g(s.protein.grams)} / ${s.protein.target ?? '—'} g` },
    { name: 'Vegetables', status: s.vegetables.status, value: s.vegetables.share, detail: `${s.vegetables.servings.toFixed(1)} / ${VEGETABLE_GOAL} servings` },
    { name: 'Carbs', status: s.carbs.status, value: s.carbs.share, detail: `${g(s.carbs.grams)} / ${s.carbs.target ?? '—'} g` },
    { name: 'Meals', status: `${s.regular} / 3 meals`, value: (s.regular / 3) * 100, detail: 'Breakfast · Lunch · Dinner' },
  ];

  return (
    <>
      <header className="pagehead">
        <div className="eyebrow">Today · {formatDay(today, { month: 'short', day: 'numeric' })}</div>
        <h1 style={{ marginTop: 5 }}>Tracker</h1>
        <p>Your nutrition at a glance</p>
      </header>
      <div className="card rings">
        {rings.map((ring) => {
          const low = ring.status === 'Need more' || (ring.name === 'Meals' && s.regular < 3);
          return (
            <button key={ring.name} className="ringbutton" onClick={() => navigate(`/tracker/${ring.name}`)}>
              <div className="ring" style={{ ['--value' as string]: ring.value, ['--color' as string]: `var(--${low ? 'ochre' : 'sage'})` }}>
                <span>{ring.status}</span>
              </div>
              <strong>{ring.name}</strong>
              <small className="small muted" style={{ display: 'block', marginTop: 2 }}>
                {ring.detail}
              </small>
            </button>
          );
        })}
      </div>
      <section className="focus">
        <div className="eyebrow">Today’s focus</div>
        <h3>{vegEnough ? 'Vegetables look good today.' : 'Vegetables need more.'}</h3>
        <p>{vegEnough ? 'A balanced little day so far.' : 'Add a side of greens at your next meal.'}</p>
      </section>
      <section className="card formblock">
        <div className="eyebrow" style={{ marginBottom: 9 }}>
          Balanced day
        </div>
        {[
          [s.regular === 3, '3 meals logged'],
          [s.protein.status === 'Enough', 'Protein enough'],
          [vegEnough, 'Vegetables enough'],
        ].map(([ok, text]) => (
          <div key={String(text)} className="checkline">
            <span className={`checkdot ${ok ? 'done' : ''}`} />
            {text}
          </div>
        ))}
      </section>
      <p className="notice center" style={{ marginTop: 20 }}>
        Nutrition values are estimated from your logged meals.
      </p>
      <button className="link block" onClick={() => navigate('/tracker/Vegetables')}>
        View estimated details
      </button>
    </>
  );
}
