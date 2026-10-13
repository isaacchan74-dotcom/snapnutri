import { useEffect, useMemo } from 'react';

import { useMealPhotoUrls } from '../lib/useMealPhotoUrls';
import { useAuthStore } from '../store/authStore';
import { useMealStore } from '../store/mealStore';
import { usePetStore } from '../store/petStore';
import { useUiStore } from '../store/uiStore';
import type { MealRow } from '../types/meal';

/** Loads meals and Pika once per signed-in user. */
export function useJournalData() {
  const user = useAuthStore((state) => state.user);
  const meals = useMealStore((state) => state.meals);
  const load = useMealStore((state) => state.load);
  const loading = useMealStore((state) => state.loading);
  const error = useMealStore((state) => state.error);
  const petUser = usePetStore((state) => state.userId);
  const loadPet = usePetStore((state) => state.load);

  useEffect(() => {
    if (!user) return;
    if (petUser !== user.id) {
      void load(user.id);
      void loadPet(user.id);
    }
  }, [user, petUser, load, loadPet]);

  return { meals, loading, error };
}

/** Signed photo URLs keyed by path, plus fresh captures keyed by meal id. */
export function usePhotos(meals: MealRow[]): Record<string, string> {
  const signed = useMealPhotoUrls(meals);
  const local = useUiStore((state) => state.localPhotos);
  return useMemo(() => ({ ...signed, ...local }), [signed, local]);
}
