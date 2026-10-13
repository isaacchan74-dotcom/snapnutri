import { useNavigate, useParams } from 'react-router-dom';

import { formatDay, formatTime, mealTypeOf, summarizeDay, todayKey } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { BackHead } from '../../ui/BackHead';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { Icon } from '../../ui/Icon';
import { useManualMeal } from '../../ui/ManualMeal';
import { MealPhoto } from '../../ui/MealPhoto';
import { PIKA_HAPPY } from '../../ui/Pika';
import { useStartSnap } from '../../ui/useStartSnap';

export function DayPage() {
  const { day = todayKey() } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const { meals } = useJournalData();
  const startSnap = useStartSnap();
  const manualMeal = useManualMeal();
  const summary = summarizeDay(meals, day, profile);
  const dayMeals = summary.meals;
  const urls = usePhotos(dayMeals);
  const vegEnough = summary.vegetables.status === 'Enough';

  return (
    <>
      <BackHead
        title={formatDay(day, { month: 'long', day: 'numeric' })}
        sub={formatDay(day, { weekday: 'long', year: 'numeric' })}
        label="Back to monthly calendar"
        onBack={() => navigate('/journal', { state: { selected: day } })}
      />
      {dayMeals.length ? (
        <>
          <section className="card">
            <div className="eyebrow">{day === todayKey() ? 'Today' : 'This day'} at a glance</div>
            <p style={{ marginTop: 8 }}>
              {dayMeals.length} {dayMeals.length === 1 ? 'meal' : 'meals'}, a few little memories.
            </p>
            <p className="small muted" style={{ marginTop: 5 }}>
              Protein · {summary.protein.status} &nbsp; Vegetables · {summary.vegetables.status}
            </p>
          </section>
          <div className="journal-grid">
            {dayMeals.map((meal) => (
              <button key={meal.id} className="polaroid" onClick={() => navigate(`/meal/${meal.id}`)}>
                <span className="tape" />
                <MealPhoto meal={meal} urls={urls} className="photo-fallback" />
                <strong>{meal.food_name}</strong>
                <small>
                  {mealTypeOf(meal)} · {formatTime(meal.logged_at)}
                  {!meal.reviewed ? ' · Unreviewed' : ''}
                </small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <section className="center">
          <img className="empty-art" src={PIKA_HAPPY} alt="Pika waiting beside your journal" />
          <h2>A little space for a memory.</h2>
          <p className="muted small" style={{ marginTop: 10 }}>
            Add something from this day.
            <br />A photo is all you need to begin.
          </p>
        </section>
      )}
      <button className="emptycard" onClick={() => startSnap({ day })}>
        <span>
          <Icon name="Snap" />
          <h3 style={{ marginTop: 9 }}>{dayMeals.length ? 'Add another little moment' : 'Upload a photo'}</h3>
          <p>{dayMeals.length ? 'A meal, a snack, your favorite coffee.' : 'Pika will estimate what’s on the plate.'}</p>
        </span>
      </button>
      <button className="link block" onClick={() => manualMeal(day)}>
        Add manually
      </button>
      {dayMeals.length ? (
        <section className="focus">
          <div className="eyebrow">A gentle note</div>
          <h3>{vegEnough ? 'Vegetables look good.' : 'A little more green tomorrow.'}</h3>
          <p>{vegEnough ? 'You made room for a little balance.' : 'A side of greens is an easy place to start.'}</p>
        </section>
      ) : null}
    </>
  );
}
