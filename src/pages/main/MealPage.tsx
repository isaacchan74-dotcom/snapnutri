import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { requestMealInsight } from '../../api/mealInsight';

import { formatDay, formatTime, mealDay, mealTypeOf } from '../../lib/journal';
import { useMealStore } from '../../store/mealStore';
import { useUiStore } from '../../store/uiStore';
import { BackHead } from '../../ui/BackHead';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { MealPhoto } from '../../ui/MealPhoto';

export function MealPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const { meals, loading } = useJournalData();
  const remove = useMealStore((state) => state.remove);
  const openModal = useUiStore((state) => state.openModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const showToast = useUiStore((state) => state.showToast);
  const attachInsight = useMealStore((state) => state.attachInsight);
  const meal = meals.find((item) => item.id === mealId);
  const urls = usePhotos(meal ? [meal] : []);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const loadInsight = useCallback(async () => {
    if (!mealId) return;
    setInsightError(null);
    setInsightLoading(true);
    try {
      attachInsight(mealId, await requestMealInsight(mealId));
    } catch (error) {
      setInsightError(error instanceof Error ? error.message : 'Pika could not read this meal just now.');
    } finally {
      setInsightLoading(false);
    }
  }, [attachInsight, mealId]);

  // One AI call per saved meal; the function stores the result, so repeats are free.
  const needsInsight = Boolean(meal && meal.reviewed && !meal.ai_insight);
  useEffect(() => {
    if (needsInsight && !insightLoading && !insightError) void loadInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsInsight]);

  if (!meal) {
    return (
      <>
        <BackHead title="Meal" to="/journal" />
        <p className="muted">{loading ? 'Opening your journal…' : 'That meal wandered off.'}</p>
      </>
    );
  }

  const day = mealDay(meal);
  const foods = meal.foods.length ? meal.foods : [meal.food_name];

  const confirmRemove = () =>
    openModal(
      'Remove this memory?',
      <>
        <p className="muted">This removes the meal and its photo from your journal.</p>
        <button
          className="btn"
          onClick={async () => {
            try {
              await remove(meal.id);
              closeModal();
              navigate(`/journal/${day}`);
              showToast('Meal removed from this day.');
            } catch (error) {
              closeModal();
              showToast(error instanceof Error ? error.message : 'Could not remove that meal.');
            }
          }}
        >
          Remove meal
        </button>
        <button className="btn secondary" onClick={closeModal}>
          Keep it
        </button>
      </>,
    );

  return (
    <>
      <BackHead title={mealTypeOf(meal)} sub={`${formatDay(day)} · ${formatTime(meal.logged_at)}`} to={`/journal/${day}`} />
      <MealPhoto meal={meal} urls={urls} className="meal-image" />
      <h2 style={{ margin: '22px 0 7px' }}>{meal.food_name}</h2>
      <p className="notice">{meal.reviewed ? 'Reviewed by you' : 'AI estimate · not reviewed yet'}</p>
      {meal.description ? <p className="small muted" style={{ marginTop: 6 }}>{meal.description}</p> : null}
      <section className="card formblock">
        <div className="eyebrow">On your plate</div>
        {foods.map((food, index) => (
          <div key={`${food}-${index}`} className="settings-row">
            {food}
          </div>
        ))}
        <p className="small muted" style={{ marginTop: 10 }}>
          Your portion: {Math.round(meal.portion * 100)}% · {meal.shared_with}
        </p>
        <p className="macros-line">
          About {Math.round(meal.calories)} kcal · Protein {meal.protein}g · Carbs {meal.carbs}g · Fat {meal.fat}g
        </p>
      </section>
      {meal.reviewed ? (
        <section className="focus insight" aria-live="polite" aria-busy={insightLoading}>
          <div className="eyebrow">Pika’s take</div>
          {meal.ai_insight ? (
            <>
              <p className="insight-summary">{meal.ai_insight.summary}</p>
              <ul className="insight-tips">
                {meal.ai_insight.suggestions.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </>
          ) : insightError ? (
            <>
              <p>{insightError}</p>
              <button className="link" onClick={() => void loadInsight()}>
                Try again
              </button>
            </>
          ) : (
            <p>Pika is reading this meal against your goal…</p>
          )}
        </section>
      ) : null}
      <button className="btn formblock" onClick={() => navigate(`/meal/${meal.id}/review`)}>
        Edit meal
      </button>
      <button className="btn quiet" onClick={confirmRemove}>
        Remove this record
      </button>
      <button
        className="link block"
        onClick={() => navigate('/coach', { state: { ask: `How does my ${meal.food_name} (${mealTypeOf(meal).toLowerCase()}) fit my day?` } })}
      >
        Ask Pika about this meal ›
      </button>
    </>
  );
}
