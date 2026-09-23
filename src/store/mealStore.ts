import { create } from 'zustand';

import { createMeal, deleteMeal, fetchMeals, updateMeal } from '../api/meals';
import type { MealInput, MealRow } from '../types/meal';

type MealState = {
  meals: MealRow[];
  loading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  add: (userId: string, input: MealInput) => Promise<MealRow>;
  save: (id: string, input: MealInput) => Promise<MealRow>;
  remove: (id: string) => Promise<void>;
};

function toMealError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Could not load meals.';
  if (message.toLowerCase().includes('could not find the table')) {
    return 'The meals table is not in Supabase yet. Paste supabase/meals.sql into the SQL editor, then refresh.';
  }
  return message;
}

function sortNewest(meals: MealRow[]): MealRow[] {
  return [...meals].sort(
    (left, right) => new Date(right.logged_at).getTime() - new Date(left.logged_at).getTime(),
  );
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  loading: false,
  error: null,

  load: async (userId) => {
    set({ loading: true, error: null });
    try {
      set({ meals: await fetchMeals(userId), loading: false });
    } catch (error) {
      set({
        loading: false,
        error: toMealError(error),
      });
    }
  },

  add: async (userId, input) => {
    try {
      const meal = await createMeal(userId, input);
      set({ meals: sortNewest([meal, ...get().meals.filter((row) => row.id !== meal.id)]) });
      return meal;
    } catch (error) {
      throw new Error(toMealError(error));
    }
  },

  save: async (id, input) => {
    try {
      const meal = await updateMeal(id, input);
      set({ meals: sortNewest(get().meals.map((row) => (row.id === id ? meal : row))) });
      return meal;
    } catch (error) {
      throw new Error(toMealError(error));
    }
  },

  remove: async (id) => {
    try {
      await deleteMeal(id);
      set({ meals: get().meals.filter((row) => row.id !== id) });
    } catch (error) {
      throw new Error(toMealError(error));
    }
  },
}));
