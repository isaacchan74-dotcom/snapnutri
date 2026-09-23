import { formatMealTime, formatWhole } from '../lib/dates';
import type { MealRow } from '../types/meal';
import { AppText } from './AppText';

type MealCardProps = {
  meal: MealRow;
  onOpen: () => void;
};

export function MealCard({ meal, onOpen }: MealCardProps) {
  return (
    <button type="button" className="meal-card" onClick={onOpen}>
      <span className="meal-card__top">
        <AppText as="span" variant="bodyStrong">
          {meal.food_name}
        </AppText>
        <AppText as="span" variant="caption" color="muted">
          {formatMealTime(meal.logged_at)}
        </AppText>
      </span>
      <span className="meal-card__macros">
        <AppText as="span" variant="bodyStrong" color="brand">
          {formatWhole(meal.calories)} cal
        </AppText>
        <span className="meal-card__chips">
          <span className="macro-chip macro-chip--protein">P {formatWhole(meal.protein)}</span>
          <span className="macro-chip macro-chip--carbs">C {formatWhole(meal.carbs)}</span>
          <span className="macro-chip macro-chip--fat">F {formatWhole(meal.fat)}</span>
        </span>
      </span>
    </button>
  );
}
