import type { MealRow } from '../types/meal';

export const FOOD_FALLBACK =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22240%22%3E%3Crect%20width%3D%22300%22%20height%3D%22240%22%20rx%3D%2230%22%20fill%3D%22%23ede5d8%22%2F%3E%3Ctext%20x%3D%22150%22%20y%3D%22112%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%22%20font-size%3D%2222%22%20fill%3D%22%23887a6e%22%3EA%20little%20meal%3C%2Ftext%3E%3Ctext%20x%3D%22150%22%20y%3D%22142%22%20text-anchor%3D%22middle%22%20font-family%3D%22Georgia%22%20font-size%3D%2213%22%20fill%3D%22%23887a6e%22%3Ea%20little%20memory%3C%2Ftext%3E%3C%2Fsvg%3E';

type MealPhotoProps = {
  meal: MealRow;
  urls: Record<string, string>;
  className?: string;
};

/** A meal's photo: a fresh local capture, then the signed Storage URL, then the drawn fallback. */
export function MealPhoto({ meal, urls, className = 'thumb' }: MealPhotoProps) {
  const src = urls[meal.id] ?? (meal.photo_path ? urls[meal.photo_path] : undefined) ?? FOOD_FALLBACK;
  return (
    <img
      className={className}
      src={src}
      alt={meal.food_name || 'Meal photo'}
      style={src === FOOD_FALLBACK ? { objectFit: 'contain' } : undefined}
      onError={(event) => {
        const img = event.currentTarget;
        if (img.src !== FOOD_FALLBACK) {
          img.src = FOOD_FALLBACK;
          img.style.objectFit = 'contain';
        }
      }}
    />
  );
}
