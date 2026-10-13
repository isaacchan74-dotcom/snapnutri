import { useNavigate, useParams } from 'react-router-dom';

import { mealTypeOf, summarizeDay, todayKey } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import type { MealRow } from '../../types/meal';
import { BackHead } from '../../ui/BackHead';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { MealPhoto } from '../../ui/MealPhoto';

const NUTRIENTS = ['Protein', 'Vegetables', 'Carbs', 'Meals'] as const;
type Nutrient = (typeof NUTRIENTS)[number];

export function NutrientPage() {
  const { nutrient: raw } = useParams();
  const nutrient: Nutrient = (NUTRIENTS as readonly string[]).includes(raw ?? '') ? (raw as Nutrient) : 'Vegetables';
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const { meals } = useJournalData();
  const s = summarizeDay(meals, todayKey(), profile);
  const urls = usePhotos(s.meals);

  const value = {
    Protein: `${Math.round(s.protein.grams)} g`,
    Vegetables: `${s.vegetables.servings.toFixed(1)} servings`,
    Carbs: `${Math.round(s.carbs.grams)} g`,
    Meals: `${s.regular} meals`,
  }[nutrient];
  const status = {
    Protein: s.protein.status,
    Vegetables: s.vegetables.status,
    Carbs: s.carbs.status,
    Meals: `${s.regular} of 3 logged`,
  }[nutrient];
  const target = {
    Protein: s.protein.target ? `Your daily guide is about ${s.protein.target} g.` : '',
    Vegetables: 'A balanced day has about 2½ servings.',
    Carbs: s.carbs.target ? `Your daily guide is about ${s.carbs.target} g.` : '',
    Meals: 'Breakfast, lunch and dinner.',
  }[nutrient];
  const perMeal = (meal: MealRow) =>
    ({
      Protein: `${meal.protein} g`,
      Vegetables: `${meal.vegetable_servings} servings`,
      Carbs: `${meal.carbs} g`,
      Meals: mealTypeOf(meal),
    })[nutrient];

  return (
    <>
      <BackHead title={nutrient} to="/tracker" />
      <section className="card">
        <div className="eyebrow">Estimated today</div>
        <div className="data-value">Approximately {value}</div>
        <span className={`chip ${status === 'Need more' ? 'amber' : ''}`}>{status}</span>
        <p className="notice" style={{ marginTop: 18 }}>
          {target}
        </p>
      </section>
      <section className="card formblock">
        <div className="eyebrow">From your journal</div>
        {s.meals.length ? (
          s.meals.map((meal) => (
            <button key={meal.id} className="meal-row" onClick={() => navigate(`/meal/${meal.id}`)}>
              <MealPhoto meal={meal} urls={urls} />
              <span className="meta">
                <strong>{mealTypeOf(meal)}</strong>
                <small>
                  {meal.food_name} · {perMeal(meal)}
                </small>
              </span>
              <span>›</span>
            </button>
          ))
        ) : (
          <p className="small muted" style={{ marginTop: 10 }}>
            Nothing logged yet today.
          </p>
        )}
      </section>
      <p className="notice center" style={{ marginTop: 20 }}>
        Estimates may change if you edit a meal.
      </p>
    </>
  );
}
