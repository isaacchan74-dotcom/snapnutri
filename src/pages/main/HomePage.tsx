import { Link, useNavigate } from 'react-router-dom';

import { EXTRA_MEALS, MAIN_MEALS, displayName, loggingStreak, mealTypeOf, summarizeDay, todayKey, formatTime } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { levelOf, usePetStore } from '../../store/petStore';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { Icon } from '../../ui/Icon';
import { MealPhoto } from '../../ui/MealPhoto';
import { AccessoryOverlay, Pika } from '../../ui/Pika';
import { ScoreBlock } from '../../ui/ScoreBlock';
import { useStartSnap } from '../../ui/useStartSnap';

function greeting(night: boolean, now = new Date()): string {
  if (night) return 'It’s getting late';
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const pet = usePetStore((state) => state.pet);
  const petError = usePetStore((state) => state.error);
  const { meals, error } = useJournalData();
  const startSnap = useStartSnap();

  const today = todayKey();
  const summary = summarizeDay(meals, today, profile);
  const todays = summary.meals;
  const urls = usePhotos(todays);
  const name = displayName(profile, user?.email);
  const night = Boolean(profile?.night_mode);
  const streak = loggingStreak(meals);
  const level = levelOf(pet?.xp ?? 0);
  const draft = meals.find((meal) => !meal.reviewed);
  const nextMeal = MAIN_MEALS.find((type) => !todays.some((meal) => mealTypeOf(meal) === type));
  const vegEnough = summary.vegetables.status === 'Enough';

  const speech = night
    ? todays.length
      ? 'Pika is getting tired. Let’s wrap up today.'
      : 'Upload a photo, then get some rest.'
    : summary.balanced
      ? `A little care goes a long way. Thanks, ${name}.`
      : `Pika is ready to see what’s for ${nextMeal ? nextMeal.toLowerCase() : 'a snack'}.`;

  return (
    <>
      <div className="topline row between">
        <span className="streak">
          ♧ &nbsp;{streak} day streak
        </span>
        <button className="avatar" aria-label="Open profile" onClick={() => navigate('/profile')}>
          {name.charAt(0).toUpperCase()}
        </button>
      </div>
      <p className="greeting">
        {greeting(night)}, {name}.
      </p>
      <h1>How’s today going?</h1>

      {error || petError ? <div className="banner formblock">{error ?? petError}</div> : null}

      <section className="card hero">
        <Link className="petlink" to="/pet">
          Pika ›
        </Link>
        <button className="pika-button" aria-label="Open Pika details" onClick={() => navigate('/pet')}>
          <Pika happy={summary.balanced} />
          <AccessoryOverlay accessory={pet?.accessory ?? null} />
        </button>
        <div className="speech">{speech}</div>
        <ScoreBlock pet={pet} />
        <div className="level-mini">
          <span>LEVEL {level.level}</span>
          <div className="bar">
            <span style={{ width: `${level.share}%` }} />
          </div>
          <span>
            {level.toNext} XP to level {level.level + 1}
          </span>
        </div>
      </section>

      {night && todays.length ? (
        <button className="btn" onClick={() => navigate(`/journal/${today}`)}>
          <Icon name="Journal" />
          Review today
        </button>
      ) : (
        <button className="btn" onClick={() => startSnap({ day: today })}>
          <Icon name="Snap" />
          Snap your meal
        </button>
      )}
      {draft ? (
        <button className="link" onClick={() => navigate(`/meal/${draft.id}/review`)}>
          Continue your unfinished meal ›
        </button>
      ) : null}

      <section className="card meal-list">
        <div className="eyebrow">Today</div>
        {MAIN_MEALS.map((type) => {
          const meal = todays.find((item) => mealTypeOf(item) === type);
          return (
            <button
              key={type}
              className="meal-row"
              onClick={() => (meal ? navigate(`/meal/${meal.id}`) : startSnap({ day: today, type }))}
            >
              {meal ? <MealPhoto meal={meal} urls={urls} /> : <span className="plusbox">+</span>}
              <span className="meta">
                <strong>{type}</strong>
                <small>{meal ? `${formatTime(meal.logged_at)} · ${meal.food_name}` : 'A little moment for your journal'}</small>
              </span>
              <span className={`chip ${meal ? '' : 'amber'}`}>{meal ? (meal.reviewed ? 'Logged' : 'Draft') : 'Add meal'}</span>
            </button>
          );
        })}
        <div className="extras">
          {EXTRA_MEALS.map((type) => (
            <button key={type} onClick={() => startSnap({ day: today, type })}>
              {type} {todays.some((meal) => mealTypeOf(meal) === type) ? '· Logged' : '+'}
            </button>
          ))}
        </div>
      </section>

      <section className="focus">
        <div className="eyebrow">Today’s focus</div>
        <h3>Vegetables {vegEnough ? 'look good today.' : 'need more.'}</h3>
        <p>{vegEnough ? 'A balanced little finish to your day.' : 'Add a side of greens at your next meal.'}</p>
      </section>
    </>
  );
}
