import { supabase } from '../lib/supabase';
import { isMissingSchema, previewDelete, previewGet, previewSet } from '../lib/preview';
import { isMealType, type MealInput, type MealInsight, type MealRow } from '../types/meal';

const TABLE = 'meals';

export function toMealInsight(value: unknown): MealInsight | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.summary !== 'string' || !row.summary.trim() || !Array.isArray(row.suggestions)) {
    return null;
  }
  return {
    summary: row.summary,
    suggestions: row.suggestions.filter((item): item is string => typeof item === 'string'),
    generated_at: typeof row.generated_at === 'string' ? row.generated_at : '',
  };
}

function toMeal(raw: Record<string, unknown>): MealRow {
  // Before the migration, the extra fields come from the browser instead.
  const row = 'reviewed' in raw ? raw : { ...raw, ...(previewGet('meals', String(raw.id)) ?? {}) };
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    food_name: String(row.food_name),
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    carbs: Number(row.carbs) || 0,
    fat: Number(row.fat) || 0,
    logged_at: String(row.logged_at),
    created_at: String(row.created_at),
    photo_path: typeof row.photo_path === 'string' && row.photo_path ? row.photo_path : null,
    description: typeof row.description === 'string' && row.description ? row.description : null,
    meal_type: isMealType(row.meal_type) ? row.meal_type : null,
    foods: Array.isArray(row.foods) ? row.foods.filter((item): item is string => typeof item === 'string') : [],
    portion: Number(row.portion) || 1,
    shared_with: typeof row.shared_with === 'string' && row.shared_with ? row.shared_with : 'Just me',
    vegetable_servings: Number(row.vegetable_servings) || 0,
    reviewed: row.reviewed !== false,
    ai_insight: toMealInsight(row.ai_insight),
  };
}

/** Columns added by supabase/journal-and-pet.sql. Only sent when set. */
function journalColumns(input: MealInput): Record<string, unknown> {
  const columns: Record<string, unknown> = {};
  if (input.meal_type !== undefined) columns.meal_type = input.meal_type;
  if (input.foods !== undefined) columns.foods = input.foods;
  if (input.portion !== undefined) columns.portion = input.portion;
  if (input.shared_with !== undefined) columns.shared_with = input.shared_with;
  if (input.vegetable_servings !== undefined) columns.vegetable_servings = input.vegetable_servings;
  if (input.reviewed !== undefined) columns.reviewed = input.reviewed;
  return columns;
}

export async function fetchMeals(userId: string): Promise<MealRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toMeal(row as Record<string, unknown>));
}

export async function fetchMeal(id: string): Promise<MealRow | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toMeal(data as Record<string, unknown>) : null;
}

export async function createMeal(userId: string, input: MealInput): Promise<MealRow> {
  try {
    return await insertMeal(userId, input, true);
  } catch (error) {
    if (!(error instanceof Error) || !isMissingSchema(error.message)) throw error;
    const meal = await insertMeal(userId, input, false);
    previewSet('meals', meal.id, journalColumns(input));
    return toMeal({ ...meal, reviewed: undefined, ...journalColumns(input) } as Record<string, unknown>);
  }
}

async function insertMeal(userId: string, input: MealInput, withJournal: boolean): Promise<MealRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      food_name: input.food_name,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      logged_at: input.logged_at,
      ...(input.photo_path ? { photo_path: input.photo_path } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(withJournal ? journalColumns(input) : {}),
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return toMeal(data as Record<string, unknown>);
}

export async function updateMeal(id: string, input: MealInput): Promise<MealRow> {
  try {
    return await patchMeal(id, input, true);
  } catch (error) {
    if (!(error instanceof Error) || !isMissingSchema(error.message)) throw error;
    previewSet('meals', id, journalColumns(input));
    return patchMeal(id, input, false);
  }
}

async function patchMeal(id: string, input: MealInput, withJournal: boolean): Promise<MealRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      food_name: input.food_name,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      logged_at: input.logged_at,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(withJournal ? journalColumns(input) : {}),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return toMeal(data as Record<string, unknown>);
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  previewDelete('meals', id);
}

export async function deleteMealsForUser(userId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}
