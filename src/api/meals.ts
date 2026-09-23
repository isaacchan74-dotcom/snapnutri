import { supabase } from '../lib/supabase';
import type { MealInput, MealRow } from '../types/meal';

const TABLE = 'meals';

function toMeal(row: Record<string, unknown>): MealRow {
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
  };
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
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return toMeal(data as Record<string, unknown>);
}

export async function updateMeal(id: string, input: MealInput): Promise<MealRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      food_name: input.food_name,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
      logged_at: input.logged_at,
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
}
