import { localDayKey, startOfLocalDay } from './dates';
import type { MealRow, MealType } from '../types/meal';
import type { ProfileRow } from '../types/profile';

/** The three numbered meals Home always shows. */
export const MAIN_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
/** Further numbered meals, added one at a time from Home for people who eat more often. */
export const MORE_MEALS: MealType[] = ['Meal4', 'Meal5', 'Meal6'];
export const NUMBERED_MEALS: MealType[] = [...MAIN_MEALS, ...MORE_MEALS];
/** Numbered meals a balanced day asks for. */
export const MEAL_GOAL = 3;
export const EXTRA_MEALS: MealType[] = ['Snack', 'Coffee', 'Drinks'];

/** A macro counts as "Enough" once the day reaches this share of its target. */
const ENOUGH_SHARE = 0.8;
/** Standard vegetable servings for a balanced day. */
export const VEGETABLE_GOAL = 2.5;
/** Meal logs per day that still earn points and XP. */
export const REWARDED_LOGS_PER_DAY = 5;

export type Status = 'Enough' | 'Need more' | 'Not enough data';

export type DaySummary = {
  meals: MealRow[];
  regular: number;
  protein: { grams: number; target: number | null; status: Status; share: number };
  carbs: { grams: number; target: number | null; status: Status; share: number };
  fat: { grams: number; target: number | null; status: Status; share: number };
  vegetables: { servings: number; status: Status; share: number };
  calories: { kcal: number; target: number | null };
  balanced: boolean;
};

export function mealDay(meal: MealRow): string {
  return localDayKey(new Date(meal.logged_at));
}

export function todayKey(): string {
  return localDayKey(new Date());
}

export function mealsOn(meals: MealRow[], day: string): MealRow[] {
  return meals
    .filter((meal) => mealDay(meal) === day)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
}

export function defaultMealType(date = new Date()): MealType {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 10 * 60 + 30) return 'Breakfast';
  if (minutes < 15 * 60) return 'Lunch';
  if (minutes < 17 * 60) return 'Snack';
  return 'Dinner';
}

/** A new meal takes the first numbered slot still free that day, then counts as a snack. */
export function nextMealType(meals: MealRow[], day: string): MealType {
  const used = new Set(mealsOn(meals, day).map(mealTypeOf));
  return MAIN_MEALS.find((type) => !used.has(type)) ?? 'Snack';
}

export function mealTypeOf(meal: MealRow): MealType {
  return meal.meal_type ?? defaultMealType(new Date(meal.logged_at));
}

function macroStatus(grams: number, target: number | null, hasMeals: boolean): Status {
  if (!hasMeals) return 'Not enough data';
  if (target == null || target <= 0) return grams > 0 ? 'Enough' : 'Need more';
  return grams >= target * ENOUGH_SHARE ? 'Enough' : 'Need more';
}

function share(value: number, target: number | null): number {
  if (target == null || target <= 0) return value > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (value / target) * 100));
}

export function summarizeDay(meals: MealRow[], day: string, profile: ProfileRow | null): DaySummary {
  const dayMeals = mealsOn(meals, day);
  const has = dayMeals.length > 0;
  const total = (pick: (meal: MealRow) => number) => dayMeals.reduce((sum, meal) => sum + pick(meal), 0);

  const protein = total((meal) => meal.protein);
  const carbs = total((meal) => meal.carbs);
  const fat = total((meal) => meal.fat);
  const servings = total((meal) => meal.vegetable_servings);
  const types = new Set(dayMeals.map(mealTypeOf));
  const regular = NUMBERED_MEALS.filter((type) => types.has(type)).length;

  const summary: DaySummary = {
    meals: dayMeals,
    regular,
    protein: {
      grams: protein,
      target: profile?.daily_protein_target ?? null,
      status: macroStatus(protein, profile?.daily_protein_target ?? null, has),
      share: share(protein, profile?.daily_protein_target ?? null),
    },
    carbs: {
      grams: carbs,
      target: profile?.daily_carb_target ?? null,
      status: macroStatus(carbs, profile?.daily_carb_target ?? null, has),
      share: share(carbs, profile?.daily_carb_target ?? null),
    },
    fat: {
      grams: fat,
      target: profile?.daily_fat_target ?? null,
      status: macroStatus(fat, profile?.daily_fat_target ?? null, has),
      share: share(fat, profile?.daily_fat_target ?? null),
    },
    vegetables: {
      servings,
      status: has ? (servings >= VEGETABLE_GOAL ? 'Enough' : 'Need more') : 'Not enough data',
      share: share(servings, VEGETABLE_GOAL),
    },
    calories: { kcal: total((meal) => meal.calories), target: profile?.daily_calorie_target ?? null },
    balanced: false,
  };
  summary.balanced =
    regular >= MEAL_GOAL && summary.protein.status === 'Enough' && summary.vegetables.status === 'Enough';
  return summary;
}

/** The one thing most worth doing next, worked out from what was actually eaten that day. */
export function dayFocus(s: DaySummary): { title: string; body: string } {
  if (!s.meals.length) {
    return { title: 'Nothing logged yet today.', body: 'Snap your first meal and Pika will work out what to aim for next.' };
  }
  const r = Math.round;
  const top = (pick: (meal: MealRow) => number) => s.meals.reduce((best, meal) => (pick(meal) > pick(best) ? meal : best));
  const kcal = s.calories.kcal;
  const kcalTarget = s.calories.target;
  const mealsLeft = Math.max(0, MEAL_GOAL - s.regular);
  const spread = (amount: string) =>
    mealsLeft > 1 ? `roughly ${amount} at each of your next ${mealsLeft} meals` : `try to fit ${amount} into your next meal or a snack`;

  if (kcalTarget && kcal > kcalTarget * 1.1) {
    const biggest = top((meal) => meal.calories);
    return {
      title: `About ${r(kcal - kcalTarget)} kcal over today’s guide.`,
      body: `${biggest.food_name} was the biggest part at ${r(biggest.calories)} kcal. Keep what’s left light: lean protein and vegetables.`,
    };
  }

  const proteinLow = s.protein.status === 'Need more' && s.protein.target != null;
  const vegLow = s.vegetables.status === 'Need more';
  if (proteinLow && (!vegLow || s.protein.share <= s.vegetables.share)) {
    const target = s.protein.target ?? 0;
    const gap = r(target - s.protein.grams);
    const best = top((meal) => meal.protein);
    const source = best.protein > 0 ? ` Most so far came from ${best.food_name} (${r(best.protein)} g).` : '';
    return {
      title: `Protein: ${r(s.protein.grams)} of ${target} g so far.`,
      body: `About ${gap} g to go — ${spread(`${r(gap / Math.max(1, mealsLeft))} g`)}.${source}`,
    };
  }
  if (vegLow) {
    const gap = Math.round((VEGETABLE_GOAL - s.vegetables.servings) * 10) / 10;
    const best = top((meal) => meal.vegetable_servings);
    const source = best.vegetable_servings > 0 ? ` ${best.food_name} gave you ${best.vegetable_servings} so far.` : ' None of today’s meals had any yet.';
    return {
      title: `Vegetables: ${s.vegetables.servings.toFixed(1)} of ${VEGETABLE_GOAL} servings.`,
      body: `About ${gap} more to go — a cup of leafy greens or half a cup of cooked vegetables is one serving.${source}`,
    };
  }

  const left = kcalTarget ? kcalTarget - kcal : null;
  return {
    title: `On track: ${r(s.protein.grams)} g protein, ${s.vegetables.servings.toFixed(1)} vegetable servings.`,
    body:
      left == null
        ? `${r(kcal)} kcal logged so far today.`
        : left > 0
          ? `${r(kcal)} kcal logged, about ${r(left)} kcal left in today’s guide.`
          : `${r(kcal)} kcal logged — you’ve reached today’s calorie guide.`,
  };
}

export function loggingStreak(meals: MealRow[], now = new Date()): number {
  const days = new Set(meals.map(mealDay));
  let streak = 0;
  const cursor = startOfLocalDay(now);
  // Today does not break the streak until it is over.
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** `YYYY-MM-DD` + the current clock time, so a back-dated log keeps a sensible time. */
export function loggedAtFor(day: string, now = new Date()): string {
  if (day === localDayKey(now)) return now.toISOString();
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, now.getHours(), now.getMinutes()).toISOString();
}

export function dateFromKey(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, 12);
}

export function formatDay(day: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string {
  return dateFromKey(day).toLocaleDateString('en-US', options);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function displayName(profile: ProfileRow | null, email: string | null | undefined): string {
  const name = profile?.display_name?.trim();
  if (name) return name;
  const local = email?.split('@')[0] ?? '';
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'friend';
}
