import type { MealType } from './meal';

export type PlaceType = 'restaurant' | 'home' | 'other';
export type Place = { name: string; type: PlaceType };

export type Coords = { lat: number; lon: number };

/** A packaged product found by its barcode. Numbers are for one `basis`. */
export type Product = {
  barcode: string;
  name: string;
  brand: string | null;
  /** The label's serving text, e.g. "1 bar (40 g)". */
  servingSize: string | null;
  /** 'serving' = one labelled serving; '100g' when the database has no serving data. */
  basis: 'serving' | '100g';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Everything the user gives us before the AI looks at the meal. */
export type SnapDraft = {
  image?: string;
  /** Photo of the Nutrition Facts label. */
  label?: string;
  product?: Product;
  place?: Place;
  /** GPS read from an uploaded photo. Never stored — only used to list nearby places. */
  photoCoords?: Coords;
  servings: number;
  notes: string;
};

export type SnapState = { day?: string; type?: MealType; retake?: string; draft?: SnapDraft };

export const NOTES_MAX = 1000;
export const PLACE_MAX = 120;

export function emptyDraft(): SnapDraft {
  return { servings: 1, notes: '' };
}
