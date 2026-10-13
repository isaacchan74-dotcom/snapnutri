import { create } from 'zustand';

import { deleteMealPhoto, purgeExpiredMealPhotos, toPhotoError, uploadMealPhoto } from '../api/mealPhotos';
import { createMeal, deleteMeal, fetchMeals, updateMeal } from '../api/meals';
import { toSchemaError } from '../api/profiles';
import type { MealInput, MealInsight, MealRow } from '../types/meal';

type MealState = {
  meals: MealRow[];
  loading: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  add: (userId: string, input: MealInput, photoDataUrl?: string | null) => Promise<MealRow>;
  save: (id: string, input: MealInput) => Promise<MealRow>;
  remove: (id: string) => Promise<void>;
  attachInsight: (id: string, insight: MealInsight) => void;
};

function toMealError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Could not load meals.';
  if (message.toLowerCase().includes('could not find the table')) {
    return 'The meals table is not in Supabase yet. Paste supabase/meals.sql into the SQL editor, then refresh.';
  }
  if (message.toLowerCase().includes('description') && message.toLowerCase().includes('column')) {
    return 'Meal descriptions need a quick database update. Run supabase/goals-and-descriptions.sql in the SQL editor, then try again.';
  }
  return toPhotoError(toSchemaError(message), message);
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
      const meals = await fetchMeals(userId);
      set({ meals: await purgeExpiredMealPhotos(meals), loading: false });
    } catch (error) {
      set({
        loading: false,
        error: toMealError(error),
      });
    }
  },

  add: async (userId, input, photoDataUrl) => {
    let photoPath: string | null = null;
    try {
      if (photoDataUrl) {
        photoPath = await uploadMealPhoto(userId, photoDataUrl);
      }
      const meal = await createMeal(userId, { ...input, photo_path: photoPath });
      set({ meals: sortNewest([meal, ...get().meals.filter((row) => row.id !== meal.id)]) });
      return meal;
    } catch (error) {
      if (photoPath) {
        await deleteMealPhoto(photoPath).catch(() => undefined);
      }
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
    const existing = get().meals.find((meal) => meal.id === id);
    try {
      await deleteMeal(id);
      if (existing?.photo_path) {
        await deleteMealPhoto(existing.photo_path).catch(() => undefined);
      }
      set({ meals: get().meals.filter((row) => row.id !== id) });
    } catch (error) {
      throw new Error(toMealError(error));
    }
  },

  attachInsight: (id, insight) => {
    set({
      meals: get().meals.map((row) => (row.id === id ? { ...row, ai_insight: insight } : row)),
    });
  },
}));
