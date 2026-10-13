import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatDay, loggedAtFor, mealsOn } from '../lib/journal';
import { useAuthStore } from '../store/authStore';
import { useMealStore } from '../store/mealStore';
import { usePetStore } from '../store/petStore';
import { useUiStore } from '../store/uiStore';
import { MEAL_TYPES, type MealType } from '../types/meal';

function ManualMealForm({ day, type }: { day: string; type: MealType }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const add = useMealStore((state) => state.add);
  const rewardLog = usePetStore((state) => state.rewardLog);
  const closeModal = useUiStore((state) => state.closeModal);
  const showToast = useUiStore((state) => state.showToast);
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<MealType>(type);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const name = title.trim();
    if (!name || !user) return;
    setBusy(true);
    try {
      const before = mealsOn(useMealStore.getState().meals, day).length;
      const meal = await add(user.id, {
        food_name: name,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        logged_at: loggedAtFor(day),
        meal_type: mealType,
        foods: [name],
        reviewed: false,
      });
      await rewardLog(before);
      closeModal();
      navigate(`/meal/${meal.id}/review`);
      showToast('A little moment added to your journal.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not add that meal.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label className="formlabel" htmlFor="manualTitle">
        What did you have?
      </label>
      <input
        id="manualTitle"
        className="field"
        maxLength={80}
        placeholder="e.g. avocado toast"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="formblock">
        <label className="formlabel" htmlFor="manualType">
          Meal
        </label>
        <select id="manualType" className="field" value={mealType} onChange={(event) => setMealType(event.target.value as MealType)}>
          {MEAL_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <p className="notice formblock">{formatDay(day)} · You’ll add a rough estimate next.</p>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" disabled={busy || !title.trim()}>
        Add to journal
      </button>
    </form>
  );
}

export function useManualMeal() {
  const openModal = useUiStore((state) => state.openModal);
  return (day: string, type: MealType = 'Dinner') =>
    openModal('Add a little moment', <ManualMealForm day={day} type={type} />);
}
