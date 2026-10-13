import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { localDayKey } from '../../lib/dates';
import { formatDay, loggedAtFor, mealDay, mealTypeOf, summarizeDay } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import { usePetStore } from '../../store/petStore';
import { useUiStore } from '../../store/uiStore';
import { MEAL_TYPES, SHARED_OPTIONS, type MealInput, type MealRow, type MealType } from '../../types/meal';
import { Icon } from '../../ui/Icon';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { MealPhoto } from '../../ui/MealPhoto';

const PORTIONS: [number, string][] = [
  [1, 'All'],
  [0.75, '¾'],
  [0.5, '½'],
  [0.25, '¼'],
];

type Working = {
  name: string;
  type: MealType;
  day: string;
  foods: string[];
  portion: number;
  shared: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vegetables: number;
};

function toWorking(meal: MealRow): Working {
  return {
    name: meal.food_name,
    type: mealTypeOf(meal),
    day: mealDay(meal),
    foods: meal.foods.length ? meal.foods : [meal.food_name],
    portion: meal.portion,
    shared: meal.shared_with,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    vegetables: meal.vegetable_servings,
  };
}

const round1 = (value: number) => Math.round(value * 10) / 10;

/** The last two weeks in English, so the picker never follows the phone's language. */
function dayChoices(current: string): { value: string; label: string }[] {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const value = localDayKey(date);
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : formatDay(value);
    return { value, label };
  });
  if (!days.some((day) => day.value === current)) days.push({ value: current, label: formatDay(current) });
  return days;
}

export function ReviewPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const confidence = (location.state as { confidence?: number } | null)?.confidence;
  const profile = useAuthStore((state) => state.profile);
  const { meals, loading } = useJournalData();
  const save = useMealStore((state) => state.save);
  const rewardBalancedDay = usePetStore((state) => state.rewardBalancedDay);
  const openModal = useUiStore((state) => state.openModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const showToast = useUiStore((state) => state.showToast);
  const meal = meals.find((item) => item.id === mealId);
  const urls = usePhotos(meal ? [meal] : []);
  const [work, setWork] = useState<Working | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meal && !work) setWork(toWorking(meal));
  }, [meal, work]);

  if (!meal || !work) {
    return <p className="muted">{loading ? 'Opening your meal…' : 'That meal wandered off.'}</p>;
  }

  const set = (patch: Partial<Working>) => setWork({ ...work, ...patch });
  const leaveTo = meal.reviewed ? `/meal/${meal.id}` : '/home';

  const toInput = (reviewed: boolean): MealInput => {
    const time = new Date(meal.logged_at);
    const foods = work.foods.map((food) => food.trim()).filter(Boolean);
    return {
      food_name: work.name.trim() || foods[0] || 'A little meal',
      calories: Math.max(0, Math.round(work.calories)),
      protein: Math.max(0, round1(work.protein)),
      carbs: Math.max(0, round1(work.carbs)),
      fat: Math.max(0, round1(work.fat)),
      logged_at: work.day === mealDay(meal) ? meal.logged_at : loggedAtFor(work.day, time),
      meal_type: work.type,
      foods,
      portion: work.portion,
      shared_with: work.shared,
      vegetable_servings: Math.max(0, round1(work.vegetables)),
      reviewed,
    };
  };

  const saveDraft = async () => {
    closeModal();
    try {
      await save(meal.id, toInput(false));
      navigate(leaveTo);
      showToast('Draft saved. Your photo stays in the journal.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save the draft.');
    }
  };

  const saveMeal = async () => {
    const input = toInput(true);
    if (!input.foods?.length) {
      showToast('Add at least one food first.');
      return;
    }
    setSaving(true);
    try {
      await save(meal.id, input);
      const day = work.day;
      const summary = summarizeDay(useMealStore.getState().meals, day, profile);
      const newBonus = summary.balanced ? await rewardBalancedDay(day) : false;
      navigate(`/meal/${meal.id}/result`, { replace: true, state: { newBonus } });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save that meal.');
      setSaving(false);
    }
  };

  const leavePrompt = () =>
    openModal(
      'Save your changes for later?',
      <>
        <p className="muted">Your photo and the original estimate are already in your journal.</p>
        <button className="btn" onClick={() => void saveDraft()}>
          Save draft
        </button>
        <button
          className="btn secondary"
          onClick={() => {
            closeModal();
            navigate(leaveTo);
          }}
        >
          Discard changes
        </button>
        <button className="btn quiet" onClick={closeModal}>
          Keep editing
        </button>
      </>,
    );

  const choosePortion = (portion: number) => {
    const scale = portion / (work.portion || 1);
    set({
      portion,
      calories: Math.round(work.calories * scale),
      protein: round1(work.protein * scale),
      carbs: round1(work.carbs * scale),
      fat: round1(work.fat * scale),
      vegetables: round1(work.vegetables * scale),
    });
  };

  const addFood = () => {
    let draft = '';
    openModal(
      'Add another food',
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setWork((current) => (current ? { ...current, foods: [...current.foods, draft.trim()] } : current));
          closeModal();
        }}
      >
        <label className="formlabel" htmlFor="foodName">
          Food name
        </label>
        <input id="foodName" className="field" placeholder="e.g. avocado" maxLength={60} onChange={(event) => (draft = event.target.value)} />
        <button className="btn">Add food</button>
      </form>,
    );
  };

  const unsure = confidence != null && confidence < 0.75;
  const number = (key: 'calories' | 'protein' | 'carbs' | 'fat' | 'vegetables', label: string) => (
    <label>
      <span className="formlabel">{label}</span>
      <input
        className="field"
        inputMode="decimal"
        aria-label={label}
        value={String(work[key])}
        onChange={(event) => set({ [key]: Number(event.target.value.replace(/[^\d.]/g, '')) || 0 })}
      />
    </label>
  );

  return (
    <>
      <div className="backhead">
        <button className="iconbtn" aria-label="Leave meal review" onClick={leavePrompt}>
          <Icon name="back" />
        </button>
        <div>
          <h1>Review your meal</h1>
          <p className="day-date">A few details, in your own time.</p>
        </div>
      </div>
      <MealPhoto meal={meal} urls={urls} className="meal-image" />
      <p className="notice" style={{ margin: '9px 0 15px' }}>
        Already added to your journal. You can adjust anything below.
      </p>
      <div className="formrow">
        <label>
          <span className="formlabel">Meal</span>
          <select className="field" aria-label="Meal category" value={work.type} onChange={(event) => set({ type: event.target.value as MealType })}>
            {MEAL_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="formlabel">Date</span>
          <select className="field" aria-label="Meal date" value={work.day} onChange={(event) => set({ day: event.target.value })}>
            {dayChoices(work.day).map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="card formblock">
        <div className="eyebrow">On your plate</div>
        <label className="food-row" style={{ display: 'block' }}>
          <span className="formlabel">Name in your journal</span>
          <input className="field" maxLength={80} value={work.name} onChange={(event) => set({ name: event.target.value })} />
        </label>
        {work.foods.map((food, index) => (
          <div key={index} className="food-row">
            <details open={index === 0}>
              <summary>{food || 'New food'}</summary>
              {index === 0 && unsure ? <p>We’re not fully sure. Fix the name if it’s off.</p> : null}
              <div className="food-input">
                <input
                  className="field"
                  aria-label={`Food ${index + 1}`}
                  maxLength={60}
                  value={food}
                  onChange={(event) => set({ foods: work.foods.map((item, i) => (i === index ? event.target.value : item)) })}
                />
              </div>
              <button className="link" onClick={() => set({ foods: work.foods.filter((_, i) => i !== index) })}>
                Remove food
              </button>
            </details>
          </div>
        ))}
        <button className="link" onClick={addFood}>
          + Add another food or enter manually
        </button>
      </section>

      <section className="card formblock">
        <h3>How much did you have?</h3>
        <p className="notice" style={{ margin: '5px 0 12px' }}>
          An estimate is perfectly okay.
        </p>
        <label>
          <span className="formlabel">Was this meal shared?</span>
          <select aria-label="People sharing" className="field" value={work.shared} onChange={(event) => set({ shared: event.target.value })}>
            {SHARED_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <p className="formlabel" style={{ marginTop: 13 }}>
          My portion
        </p>
        <div className="segmented">
          {PORTIONS.map(([value, label]) => (
            <button key={value} aria-label={`Portion ${label}`} className={work.portion === value ? 'chosen' : ''} onClick={() => choosePortion(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="numbers formblock">
          <p className="numbers-title">Pika’s estimate · about {Math.round(work.calories)} kcal for your portion</p>
          <div className="estimate">
            {number('calories', 'kcal')}
            {number('protein', 'Protein g')}
            {number('carbs', 'Carbs g')}
            {number('fat', 'Fat g')}
          </div>
          <div className="formblock" style={{ marginTop: 10 }}>
            {number('vegetables', 'Vegetable servings')}
          </div>
        </div>
      </section>

      <div className="sticky-actions">
        <button className={`btn ${saving ? 'loading' : ''}`} disabled={saving} onClick={() => void saveMeal()}>
          {saving ? 'Saving…' : 'Save meal'}
        </button>
        <button className="btn quiet" onClick={() => void saveDraft()}>
          Save as draft
        </button>
      </div>
    </>
  );
}
