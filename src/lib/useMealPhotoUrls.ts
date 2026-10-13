import { useEffect, useMemo, useState } from 'react';

import { activeMealPhotoPath, signMealPhotoUrls } from '../api/mealPhotos';
import type { MealRow } from '../types/meal';

const EMPTY: Record<string, string> = {};

export function useMealPhotoUrls(meals: MealRow[]): Record<string, string> {
  // Callers often pass a fresh array each render, so key everything off the joined paths.
  const pathKey = useMemo(
    () =>
      [...new Set(meals.map(activeMealPhotoPath).filter((path): path is string => Boolean(path)))]
        .sort()
        .join('|'),
    [meals],
  );
  const [urls, setUrls] = useState<Record<string, string>>(EMPTY);

  useEffect(() => {
    if (!pathKey) {
      setUrls(EMPTY);
      return;
    }

    let cancelled = false;
    void signMealPhotoUrls(pathKey.split('|'))
      .then((next) => {
        if (!cancelled) setUrls(next);
      })
      .catch(() => {
        if (!cancelled) setUrls(EMPTY);
      });

    return () => {
      cancelled = true;
    };
  }, [pathKey]);

  return urls;
}
