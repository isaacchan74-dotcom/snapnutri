import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { mealDay, mealTypeOf, summarizeDay } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useJournalData } from '../../ui/hooks';
import { Pika } from '../../ui/Pika';

export function ResultPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const newBonus = Boolean((location.state as { newBonus?: boolean } | null)?.newBonus);
  const profile = useAuthStore((state) => state.profile);
  const { meals } = useJournalData();
  const meal = meals.find((item) => item.id === mealId);

  if (!meal) return <p className="muted">Saving your meal…</p>;

  const day = mealDay(meal);
  const summary = summarizeDay(meals, day, profile);
  const vegEnough = summary.vegetables.status === 'Enough';

  return (
    <>
      <div className="center">
        <div className="pet-portrait joy" style={{ height: 180 }}>
          <Pika happy />
        </div>
        <div className="eyebrow">A moment, saved</div>
        <h1 style={{ margin: '10px 0' }}>{mealTypeOf(meal)} logged.</h1>
        <p className="muted">{vegEnough ? 'You made room for a little green.' : 'Another little memory in your journal.'}</p>
      </div>
      <section className="reward">
        <h3>{newBonus ? 'A balanced day — Pika is glowing.' : vegEnough ? 'Vegetables reached enough.' : 'Your journal is growing.'}</h3>
        <p>{newBonus ? '+80 points · +35 XP · Health +6 for a balanced day' : 'Meal saved with your latest adjustments.'}</p>
      </section>
      <section className="card">
        <p>{summary.regular === 3 ? 'Three meals logged today.' : `${summary.regular} of 3 meals logged.`}</p>
        <p className="notice" style={{ marginTop: 8 }}>
          Protein · {summary.protein.status}
          <br />
          Vegetables · {summary.vegetables.status}
          <br />
          Estimated from your logged meals
        </p>
      </section>
      <div className="sticky-actions">
        <button className="btn" onClick={() => navigate(`/journal/${day}`)}>
          View this day
        </button>
        <button className="btn secondary" onClick={() => navigate('/home')}>
          Back to Home
        </button>
        <button className="link" onClick={() => navigate('/tracker')}>
          See nutrition details
        </button>
      </div>
    </>
  );
}
