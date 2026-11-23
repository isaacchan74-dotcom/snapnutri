import { supabase } from '../lib/supabase';
import { isMissingSchema, previewDelete, previewGet, previewSet } from '../lib/preview';
import { isMealType, type MealInput, type MealInsight, type MealItem, type MealRow } from '../types/meal';

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

export function toMealItems(value: unknown): MealItem[] {
  if (!Array.isArray(value)) return [];
  const num = (input: unknown) => Math.max(0, Number(input) || 0);
  const grams = (input: unknown) => (input == null || !(Number(input) > 0) ? null : Number(input));
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .filter((item) => typeof item.name === 'string' && item.name.trim())
    .map((item) => ({
      name: String(item.name).trim().slice(0, 60),
      grams: grams(item.grams),
      ai_grams: grams(item.ai_grams),
      calories: num(item.calories),
      protein: num(item.protein),
      carbs: num(item.carbs),
      fat: num(item.fat),
      vegetable_servings: num(item.vegetable_servings),
    }));
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
    place_name: typeof row.place_name === 'string' && row.place_name ? row.place_name : null,
    notes: typeof row.notes === 'string' && row.notes ? row.notes : null,
    barcode: typeof row.barcode === 'string' && row.barcode ? row.barcode : null,
    items: toMealItems(row.items),
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

/** Columns added by supabase/meal-details.sql. Only sent when the user gave them. */
function detailColumns(input: MealInput): Record<string, unknown> {
  const columns: Record<string, unknown> = {};
  if (input.place_name) columns.place_name = input.place_name;
  if (input.notes) columns.notes = input.notes;
  if (input.barcode) columns.barcode = input.barcode;
  return columns;
}

/** True when Supabase rejected the column that meal-items.sql adds. */
function isMissingItems(message: string): boolean {
  const lower = message.toLowerCase();
  return /\bitems\b/.test(lower) && /column|schema cache|does not exist/.test(lower);
}

/** True when Supabase rejected a column that meal-details.sql adds. */
function isMissingDetails(message: string): boolean {
  const lower = message.toLowerCase();
  return /place_name|notes|barcode/.test(lower) && /column|schema cache|does not exist/.test(lower);
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
    return await createWithDetails(userId, input);
  } catch (error) {
    if (!(error instanceof Error) || !isMissingItems(error.message)) throw error;
    // Before meal-items.sql is run, the meal still saves — just without per-ingredient grams.
    return createWithDetails(userId, { ...input, items: undefined });
  }
}

async function createWithDetails(userId: string, input: MealInput): Promise<MealRow> {
  try {
    return await createWithJournal(userId, input);
  } catch (error) {
    if (!(error instanceof Error) || !isMissingDetails(error.message)) throw error;
    // Before meal-details.sql is run, the meal still saves — just without place, notes and barcode.
    return createWithJournal(userId, { ...input, place_name: null, notes: null, barcode: null });
  }
}

async function createWithJournal(userId: string, input: MealInput): Promise<MealRow> {
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
      ...detailColumns(input),
      ...(input.items?.length ? { items: input.items } : {}),
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return toMeal(data as Record<string, unknown>);
}

export async function updateMeal(id: string, input: MealInput): Promise<MealRow> {
  try {
    return await updateWithJournal(id, input);
  } catch (error) {
    if (!(error instanceof Error) || !isMissingItems(error.message)) throw error;
    return updateWithJournal(id, { ...input, items: undefined });
  }
}

async function updateWithJournal(id: string, input: MealInput): Promise<MealRow> {
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
      ...(input.items !== undefined ? { items: input.items } : {}),
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
