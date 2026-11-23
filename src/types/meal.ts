export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Meal4', 'Meal5', 'Meal6', 'Snack', 'Coffee', 'Drinks'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** What the app shows for each stored meal type: the main meals are just numbered. */
export const MEAL_LABELS: Record<MealType, string> = {
  Breakfast: 'Meal 1',
  Lunch: 'Meal 2',
  Dinner: 'Meal 3',
  Meal4: 'Meal 4',
  Meal5: 'Meal 5',
  Meal6: 'Meal 6',
  Snack: 'Snack',
  Coffee: 'Coffee',
  Drinks: 'Drinks',
};

export function mealLabel(type: MealType): string {
  return MEAL_LABELS[type];
}

/** One ingredient on the plate. The nutrition numbers are for `grams` of it. */
export type MealItem = {
  name: string;
  /** null when nobody has weighed or estimated it (older meals, foods typed in by hand). */
  grams: number | null;
  /** What the AI first estimated, kept so we can learn from the user's corrections. */
  ai_grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vegetable_servings: number;
};

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
  /** Where it was eaten, as the user confirmed it before analysis. */
  place_name: string | null;
  /** What the user told the AI about ingredients and preparation. */
  notes: string | null;
  barcode: string | null;
  /** Per-ingredient grams and nutrition. Empty for meals logged before meal-items.sql. */
  items: MealItem[];
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
  place_name?: string | null;
  notes?: string | null;
  barcode?: string | null;
  items?: MealItem[];
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
