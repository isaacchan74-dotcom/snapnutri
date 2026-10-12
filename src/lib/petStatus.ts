import { localDayKey, startOfLocalDay } from './dates';
import type { PetStatus } from '../types/character';
import type { MealRow } from '../types/meal';

export const STATUS_COPY: Record<PetStatus, { label: string; blurb: string }> = {
  healthy: { label: 'Healthy', blurb: 'Logged today and still chasing the target.' },
  fed: { label: 'Fed', blurb: 'Hit today’s calorie target. Nap earned.' },
  hungry: { label: 'Hungry', blurb: 'Nothing logged today — they remember yesterday, though.' },
  sick: { label: 'Sleepy', blurb: 'Two or more quiet days. A meal would help.' },
};

function mealDayKeys(meals: MealRow[]): Set<string> {
  return new Set(meals.map((meal) => localDayKey(new Date(meal.logged_at))));
}

export function loggingStreak(meals: MealRow[], now = new Date()): number {
  const days = mealDayKeys(meals);
  let streak = 0;
  const cursor = startOfLocalDay(now);

  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Pet mood from real journal days — never a stored field. */
export function derivePetStatus(
  meals: MealRow[],
  calorieTarget: number | null,
  now = new Date(),
): PetStatus {
  const todayKey = localDayKey(now);
  const yesterday = startOfLocalDay(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayMeals = meals.filter((meal) => localDayKey(new Date(meal.logged_at)) === todayKey);
  if (todayMeals.length === 0) {
    return mealDayKeys(meals).has(localDayKey(yesterday)) ? 'hungry' : 'sick';
  }

  const calories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  if (calorieTarget != null && calorieTarget > 0 && calories >= calorieTarget) {
    return 'fed';
  }

  return 'healthy';
}
