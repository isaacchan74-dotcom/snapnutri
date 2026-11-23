import type { MealEstimate } from '../types/analyze';
import type { MealItem, MealRow } from '../types/meal';

const round1 = (value: number) => Math.round(value * 10) / 10;

export type ItemNutrition = Pick<MealItem, 'calories' | 'protein' | 'carbs' | 'fat' | 'vegetable_servings'>;

/** The same food at a different weight. A food with no known weight keeps its numbers. */
export function scaleItem(item: MealItem, grams: number): MealItem {
  if (!item.grams) return { ...item, grams: grams > 0 ? grams : null };
  const ratio = Math.max(0, grams) / item.grams;
  return {
    ...item,
    grams: grams > 0 ? Math.round(grams) : null,
    calories: Math.round(item.calories * ratio),
    protein: round1(item.protein * ratio),
    carbs: round1(item.carbs * ratio),
    fat: round1(item.fat * ratio),
    vegetable_servings: round1(item.vegetable_servings * ratio),
  };
}

/** A food typed in by hand: a name, maybe a weight, and no nutrition of its own. */
export function blankItem(name: string, grams: number | null = null): MealItem {
  return { name, grams, ai_grams: null, calories: 0, protein: 0, carbs: 0, fat: 0, vegetable_servings: 0 };
}

/** The AI's foods as stored items, remembering its first guess at each weight. */
export function itemsFromEstimate(result: MealEstimate): MealItem[] {
  return (result.items ?? []).map((item) => ({ ...item, ai_grams: item.grams }));
}

const words = (text: string) => new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);

/** Same dish, allowing for the AI wording it a little differently each time. */
function sameDish(a: string, b: string): boolean {
  const left = words(a);
  const right = words(b);
  if (!left.size || !right.size) return false;
  const shared = [...left].filter((word) => right.has(word)).length;
  return shared / (left.size + right.size - shared) >= 0.6;
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Home cooking is where a person's own portions repeat; a restaurant sets its own. */
export function isHomeMeal(meal: MealRow): boolean {
  return !meal.place_name || sameName(meal.place_name, 'At Home');
}

/**
 * Starts each food at the weight the user corrected it to the last time they logged this dish
 * at home, instead of the AI's fresh guess. `meals` must be newest first.
 */
export function applyUsualPortions(
  items: MealItem[],
  dishName: string,
  meals: MealRow[],
): { items: MealItem[]; learned: string[] } {
  const past = meals.filter((meal) => meal.reviewed && isHomeMeal(meal) && sameDish(meal.food_name, dishName));
  const learned: string[] = [];
  const next = items.map((item) => {
    for (const meal of past) {
      const before = meal.items.find((old) => sameName(old.name, item.name));
      if (!before) continue;
      // The latest log of this food decides: corrected means use that weight, untouched means trust the AI.
      if (!before.grams || !before.ai_grams || before.grams === before.ai_grams || before.grams === item.grams) return item;
      learned.push(item.name);
      return scaleItem(item, before.grams);
    }
    return item;
  });
  return { items: next, learned };
}

/** How much a meal's totals move when its foods change from `before` to `after`. */
export function itemsDelta(before: MealItem[], after: MealItem[]): ItemNutrition {
  const sum = (items: MealItem[], key: keyof ItemNutrition) => items.reduce((total, item) => total + item[key], 0);
  const diff = (key: keyof ItemNutrition) => sum(after, key) - sum(before, key);
  return {
    calories: diff('calories'),
    protein: diff('protein'),
    carbs: diff('carbs'),
    fat: diff('fat'),
    vegetable_servings: diff('vegetable_servings'),
  };
}
