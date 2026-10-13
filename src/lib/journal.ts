import { localDayKey, startOfLocalDay } from './dates';
import type { MealRow, MealType } from '../types/meal';
import type { ProfileRow } from '../types/profile';

export const MAIN_MEALS: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
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
  const servings = total((meal) => meal.vegetable_servings);
  const types = new Set(dayMeals.map(mealTypeOf));
  const regular = MAIN_MEALS.filter((type) => types.has(type)).length;

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
    vegetables: {
      servings,
      status: has ? (servings >= VEGETABLE_GOAL ? 'Enough' : 'Need more') : 'Not enough data',
      share: share(servings, VEGETABLE_GOAL),
    },
    calories: { kcal: total((meal) => meal.calories), target: profile?.daily_calorie_target ?? null },
    balanced: false,
  };
  summary.balanced =
    regular === 3 && summary.protein.status === 'Enough' && summary.vegetables.status === 'Enough';
  return summary;
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
