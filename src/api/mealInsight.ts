import { supabase } from '../lib/supabase';
import type { MealInsight } from '../types/meal';
import { toMealInsight } from './meals';

/**
 * Asks the Edge Function for the one-shot summary + suggestions on a saved meal.
 * The function stores the result on the meal, so repeat calls return that copy.
 */
export async function requestMealInsight(mealId: string): Promise<MealInsight> {
  const { data, error } = await supabase.functions.invoke<MealInsight | { error?: string }>(
    'analyze-meal',
    {
      body: {
        mode: 'insight',
        meal_id: mealId,
        timezone_offset_minutes: new Date().getTimezoneOffset(),
      },
    },
  );

  if (error) {
    const fromBody = await readErrorBody(error);
    throw new Error(friendlyInsightError(fromBody || error.message));
  }

  const insight = toMealInsight(data);
  if (!insight) {
    throw new Error('The AI came back empty on that meal.');
  }
  return insight;
}

async function readErrorBody(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown }).context;
  if (context instanceof Response) {
    try {
      const body = (await context.clone().json()) as { error?: unknown };
      return typeof body.error === 'string' ? body.error : null;
    } catch {
      return null;
    }
  }
  return null;
}

function friendlyInsightError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('authorization') || lower.includes('jwt')) {
    return 'Your session expired. Log in again to get the AI take.';
  }
  if (lower.includes('meal-insights.sql')) {
    return message;
  }
  return message || 'Could not get the AI take on this meal.';
}
