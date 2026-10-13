export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Coffee', 'Drinks'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const SHARED_OPTIONS = ['Just me', '2 people', '3 people', '4+ people'] as const;

export type MealRow = {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
  created_at: string;
  photo_path: string | null;
  description: string | null;
  meal_type: MealType | null;
  foods: string[];
  portion: number;
  shared_with: string;
  vegetable_servings: number;
  /** false = a draft the user has not reviewed yet. */
  reviewed: boolean;
  ai_insight: MealInsight | null;
};

/** One-shot AI take on a logged meal. Generated once, then stored on the meal. */
export type MealInsight = {
  summary: string;
  suggestions: string[];
  generated_at: string;
};

export const MEAL_DESCRIPTION_MAX = 280;

export type MealInput = {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
  photo_path?: string | null;
  /** `null` clears it; `undefined` leaves the stored value alone. */
  description?: string | null;
  meal_type?: MealType | null;
  foods?: string[];
  portion?: number;
  shared_with?: string;
  vegetable_servings?: number;
  reviewed?: boolean;
};

export function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && (MEAL_TYPES as readonly string[]).includes(value);
}

export type MealTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function emptyTotals(): MealTotals {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

export function addMealToTotals(totals: MealTotals, meal: MealRow): MealTotals {
  return {
    calories: totals.calories + meal.calories,
    protein: totals.protein + meal.protein,
    carbs: totals.carbs + meal.carbs,
    fat: totals.fat + meal.fat,
  };
}
