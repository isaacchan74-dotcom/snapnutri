import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { analyzeMealPhoto } from '../../api/analyzeMeal';
import { defaultMealType, loggedAtFor, mealsOn, todayKey } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import { usePetStore } from '../../store/petStore';
import { useUiStore } from '../../store/uiStore';
import type { MealType } from '../../types/meal';
import { useManualMeal } from '../../ui/ManualMeal';

type AnalyzingState = { photo?: string; day?: string; type?: MealType };

export function AnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { photo, day = todayKey(), type } = (location.state as AnalyzingState | null) ?? {};
  const user = useAuthStore((state) => state.user);
  const add = useMealStore((state) => state.add);
  const rewardLog = usePetStore((state) => state.rewardLog);
  const rememberPhoto = useUiStore((state) => state.rememberPhoto);
  const manualMeal = useManualMeal();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!photo || !user) return;
    setError(null);
    try {
      const result = await analyzeMealPhoto(photo);
      if (result.needs_retake) {
        navigate('/snap', { replace: true, state: { day, type, retake: result.reason } });
        return;
      }
      const before = mealsOn(useMealStore.getState().meals, day).length;
      const meal = await add(
        user.id,
        {
          food_name: result.food_name,
          description: result.description || null,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          logged_at: loggedAtFor(day),
          meal_type: type ?? defaultMealType(),
          foods: result.foods?.length ? result.foods : [result.food_name],
          vegetable_servings: result.vegetable_servings ?? 0,
          reviewed: false,
        },
        photo,
      );
      rememberPhoto(meal.id, photo);
      await rewardLog(before);
      navigate(`/meal/${meal.id}/review`, { replace: true, state: { confidence: result.confidence } });
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : 'Could not look at that photo.');
    }
  }, [add, day, navigate, photo, rememberPhoto, rewardLog, type, user]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  if (!photo) return <Navigate to="/snap" replace />;

  return (
    <>
      <div className="pagehead">
        <h1>{error ? 'Pika got a little stuck.' : 'Looking at your meal…'}</h1>
        <p>{error ? 'Nothing was saved yet.' : 'Finding the little details on your plate.'}</p>
      </div>
      <img className="meal-image" src={photo} alt="Your meal" />
      {error ? (
        <>
          <div className="banner formblock">{error}</div>
          <div className="sticky-actions">
            <button className="btn" onClick={() => void run()}>
              Try again
            </button>
            <button className="btn secondary" onClick={() => navigate('/snap', { replace: true, state: { day, type } })}>
              Take another photo
            </button>
            <button className="btn quiet" onClick={() => manualMeal(day, type)}>
              Add manually
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="analysis-bar" />
          <div className="stack small muted">
            <span>Finding foods</span>
            <span>Estimating portions</span>
            <span>Preparing your review</span>
          </div>
          <p className="notice formblock">Estimates are a starting point. You get the final say on the next screen.</p>
        </>
      )}
    </>
  );
}
