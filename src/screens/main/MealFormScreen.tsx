import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchMeal } from '../../api/meals';
import { Banner, Button, ScreenContainer, TextField } from '../../components';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../../lib/dates';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import type { MealInput } from '../../types/meal';

type FormState = {
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  loggedAt: string;
};

const emptyForm = (): FormState => ({
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  loggedAt: toDatetimeLocalValue(new Date()),
});

export function MealFormScreen() {
  const { mealId } = useParams();
  const isEditing = Boolean(mealId);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const meals = useMealStore((state) => state.meals);
  const add = useMealStore((state) => state.add);
  const save = useMealStore((state) => state.save);
  const remove = useMealStore((state) => state.remove);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loadingMeal, setLoadingMeal] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!mealId) {
      setForm(emptyForm());
      setLoadingMeal(false);
      return;
    }

    const cached = meals.find((meal) => meal.id === mealId);
    if (cached) {
      setForm(toForm(cached));
      setLoadingMeal(false);
      return;
    }

    let cancelled = false;
    setLoadingMeal(true);
    void fetchMeal(mealId)
      .then((meal) => {
        if (cancelled) return;
        if (!meal) {
          setError('That meal wandered off. Try adding it again.');
          return;
        }
        setForm(toForm(meal));
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load that meal.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMeal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mealId, meals]);

  const parsed = parseForm(form);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!parsed.ok || !user) return;

    setError(null);
    setSubmitting(true);
    try {
      if (mealId) {
        await save(mealId, parsed.input);
      } else {
        await add(user.id, parsed.input);
      }
      navigate('/journal');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save that meal.');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!mealId) return;
    if (!window.confirm('Delete this meal? It will vanish from your journal and stats.')) return;

    setError(null);
    setDeleting(true);
    try {
      await remove(mealId);
      navigate('/journal');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete that meal.');
      setDeleting(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow={isEditing ? 'Edit meal' : 'New meal'}
      title={isEditing ? 'Tweak the log ✏️' : 'What did you eat? 🍽️'}
      subtitle={
        isEditing
          ? 'Fix a typo or delete it if it was a ghost entry.'
          : 'Name it, count it, done. Date defaults to now.'
      }
      footer={
        <>
          <Button
            label={isEditing ? 'Save changes' : 'Add meal'}
            type="submit"
            form="meal-form"
            loading={submitting}
            disabled={!parsed.ok || submitting || loadingMeal}
          />
          {isEditing ? (
            <Button
              label="Delete meal"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            />
          ) : (
            <Button label="Cancel" variant="ghost" onClick={() => navigate('/journal')} />
          )}
        </>
      }
    >
      <form id="meal-form" className="stack" onSubmit={handleSubmit}>
        {error ? <Banner message={error} /> : null}

        <TextField
          label="Food name"
          value={form.foodName}
          onChange={(event) => setForm((current) => ({ ...current, foodName: event.target.value }))}
          placeholder="Dining hall burrito"
          autoComplete="off"
        />

        <TextField
          label="Calories"
          value={form.calories}
          onChange={(event) => setForm((current) => ({ ...current, calories: event.target.value }))}
          placeholder="520"
          inputMode="numeric"
          type="number"
          min={0}
          step={1}
          error={form.calories ? parsed.fieldErrors.calories : null}
        />

        <div className="row row--grow">
          <TextField
            label="Protein (g)"
            value={form.protein}
            onChange={(event) => setForm((current) => ({ ...current, protein: event.target.value }))}
            placeholder="28"
            inputMode="decimal"
            type="number"
            min={0}
            step={0.1}
            error={form.protein ? parsed.fieldErrors.protein : null}
          />
          <TextField
            label="Carbs (g)"
            value={form.carbs}
            onChange={(event) => setForm((current) => ({ ...current, carbs: event.target.value }))}
            placeholder="54"
            inputMode="decimal"
            type="number"
            min={0}
            step={0.1}
            error={form.carbs ? parsed.fieldErrors.carbs : null}
          />
        </div>

        <TextField
          label="Fat (g)"
          value={form.fat}
          onChange={(event) => setForm((current) => ({ ...current, fat: event.target.value }))}
          placeholder="18"
          inputMode="decimal"
          type="number"
          min={0}
          step={0.1}
          error={form.fat ? parsed.fieldErrors.fat : null}
        />

        <TextField
          label="Logged at"
          value={form.loggedAt}
          onChange={(event) => setForm((current) => ({ ...current, loggedAt: event.target.value }))}
          type="datetime-local"
          error={parsed.fieldErrors.loggedAt}
        />
      </form>
    </ScreenContainer>
  );
}

function toForm(meal: {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}): FormState {
  return {
    foodName: meal.food_name,
    calories: String(meal.calories),
    protein: String(meal.protein),
    carbs: String(meal.carbs),
    fat: String(meal.fat),
    loggedAt: toDatetimeLocalValue(meal.logged_at),
  };
}

type ParsedForm =
  | { ok: true; input: MealInput; fieldErrors: Record<string, string | null> }
  | { ok: false; input: null; fieldErrors: Record<string, string | null> };

function parseForm(form: FormState): ParsedForm {
  const fieldErrors: Record<string, string | null> = {
    calories: numberError(form.calories, true),
    protein: numberError(form.protein, false),
    carbs: numberError(form.carbs, false),
    fat: numberError(form.fat, false),
    loggedAt: form.loggedAt ? null : 'Pick a date and time.',
  };

  const foodName = form.foodName.trim();
  const loggedAt = form.loggedAt ? fromDatetimeLocalValue(form.loggedAt) : '';
  const loggedDate = new Date(loggedAt);
  if (form.loggedAt && Number.isNaN(loggedDate.getTime())) {
    fieldErrors.loggedAt = 'That date looks off.';
  }

  const hasFieldError = Object.values(fieldErrors).some(Boolean);
  if (!foodName || hasFieldError) {
    return { ok: false, input: null, fieldErrors };
  }

  return {
    ok: true,
    fieldErrors,
    input: {
      food_name: foodName,
      calories: Math.round(Number(form.calories)),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      logged_at: loggedAt,
    },
  };
}

function numberError(value: string, integer: boolean): string | null {
  if (value.trim() === '') return 'Required.';
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 'Use 0 or more.';
  if (integer && !Number.isInteger(parsed)) return 'Whole numbers only.';
  return null;
}
