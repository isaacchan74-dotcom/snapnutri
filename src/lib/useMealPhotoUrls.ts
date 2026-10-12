import { useEffect, useMemo, useState } from 'react';

import { activeMealPhotoPath, signMealPhotoUrls } from '../api/mealPhotos';
import type { MealRow } from '../types/meal';

export function useMealPhotoUrls(meals: MealRow[]): Record<string, string> {
  const paths = useMemo(
    () =>
      [...new Set(meals.map(activeMealPhotoPath).filter((path): path is string => Boolean(path)))].sort(),
    [meals],
  );
  const pathKey = paths.join('|');
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (paths.length === 0) {
      setUrls({});
      return;
    }

    let cancelled = false;
    void signMealPhotoUrls(paths)
      .then((next) => {
        if (!cancelled) setUrls(next);
      })
      .catch(() => {
        if (!cancelled) setUrls({});
      });

    return () => {
      cancelled = true;
    };
  }, [pathKey, paths]);

  return urls;
}
