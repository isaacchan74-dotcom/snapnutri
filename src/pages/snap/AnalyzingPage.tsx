import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { analyzeMealPhoto } from '../../api/analyzeMeal';
import { applyUsualPortions, itemsDelta, itemsFromEstimate } from '../../lib/items';
import { loggedAtFor, mealsOn, nextMealType, todayKey } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import { usePetStore } from '../../store/petStore';
import { useUiStore } from '../../store/uiStore';
import type { AnalyzeMealResult } from '../../types/analyze';
import type { MealType } from '../../types/meal';
import type { SnapDraft } from '../../types/snap';
import { useManualMeal } from '../../ui/ManualMeal';

type AnalyzingState = { draft?: SnapDraft; day?: string; type?: MealType };

const round1 = (value: number) => Math.round(value * 10) / 10;

/** A scanned product needs no AI: the label numbers times the servings eaten. */
function productResult(draft: SnapDraft): AnalyzeMealResult | null {
  const product = draft.product;
  if (!product) return null;
  const amount = draft.servings;
  const unit = product.basis === 'serving' ? (amount === 1 ? 'serving' : 'servings') : '× 100 g';
  return {
    needs_retake: false,
    reason: null,
    confidence: 1,
    food_name: product.name,
    description: `${product.brand ? `${product.brand} ` : ''}${product.name}, ${amount} ${unit} from the label.`.slice(0, 200),
    foods: [product.name],
    vegetable_servings: 0,
    calories: Math.round(product.calories * amount),
    protein: round1(product.protein * amount),
    carbs: round1(product.carbs * amount),
    fat: round1(product.fat * amount),
  };
}

export function AnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, day = todayKey(), type } = (location.state as AnalyzingState | null) ?? {};
  const photo = draft?.image;
  const ready = !!draft && (!!photo || !!draft.product);
  const user = useAuthStore((state) => state.user);
  const add = useMealStore((state) => state.add);
  const rewardLog = usePetStore((state) => state.rewardLog);
  const rememberPhoto = useUiStore((state) => state.rememberPhoto);
  const manualMeal = useManualMeal();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!draft || !ready || !user) return;
    setError(null);
    try {
      const result = photo ? await analyzeMealPhoto(photo, draft) : productResult(draft);
      if (!result || result.needs_retake) {
        navigate('/snap', { replace: true, state: { day, type, draft, retake: result?.reason ?? 'That one was hard to read.' } });
        return;
      }
      // Opening the camera straight after a refresh skips Home, so the journal may not be loaded yet.
      if (!useMealStore.getState().meals.length) await useMealStore.getState().load(user.id);
      const known = useMealStore.getState().meals;
      const before = mealsOn(known, day).length;
      const estimated = itemsFromEstimate(result);
      // Home cooking repeats: start from the weights this user corrected last time.
      const usual =
        photo && draft.place?.type !== 'restaurant'
          ? applyUsualPortions(estimated, result.food_name, known)
          : { items: estimated, learned: [] };
      const shift = itemsDelta(estimated, usual.items);
      const adjust = (value: number, by: number) => Math.max(0, Math.round((value + by) * 10) / 10);
      const meal = await add(
        user.id,
        {
          food_name: result.food_name,
          description: result.description || null,
          calories: Math.round(adjust(result.calories, shift.calories)),
          protein: adjust(result.protein, shift.protein),
          carbs: adjust(result.carbs, shift.carbs),
          fat: adjust(result.fat, shift.fat),
          logged_at: loggedAtFor(day),
          meal_type: type ?? nextMealType(known, day),
          foods: result.foods?.length ? result.foods : [result.food_name],
          items: usual.items,
          vegetable_servings: adjust(result.vegetable_servings ?? 0, shift.vegetable_servings),
          reviewed: false,
          place_name: draft.place?.name ?? null,
          notes: draft.notes.trim() || null,
          barcode: draft.product?.barcode ?? null,
        },
        photo,
      );
      if (photo) rememberPhoto(meal.id, photo);
      await rewardLog(before);
      navigate(`/meal/${meal.id}/review`, { replace: true, state: { confidence: result.confidence, learned: usual.learned } });
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : 'Could not look at that photo.');
    }
  }, [add, day, draft, navigate, photo, ready, rememberPhoto, rewardLog, type, user]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  if (!ready) return <Navigate to="/snap" replace />;

  return (
    <>
      <div className="pagehead">
        <h1>{error ? 'Pika got a little stuck.' : photo ? 'Looking at your meal…' : 'Adding your product…'}</h1>
        <p>{error ? 'Nothing was saved yet.' : photo ? 'Finding the little details on your plate.' : 'Reading the numbers from its label.'}</p>
      </div>
      {photo ? <img className="meal-image" src={photo} alt="Your meal" /> : null}
      {error ? (
        <>
          <div className="banner formblock">{error}</div>
          <div className="sticky-actions">
            <button className="btn" onClick={() => void run()}>
              Try again
            </button>
            <button className="btn secondary" onClick={() => navigate('/snap/details', { replace: true, state: { day, type, draft } })}>
              Back to details
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
            <span>{draft?.place || draft?.notes.trim() || draft?.label ? 'Using the details you added' : 'Estimating portions'}</span>
            <span>Preparing your review</span>
          </div>
          <p className="notice formblock">Estimates are a starting point. You get the final say on the next screen.</p>
        </>
      )}
    </>
  );
}
