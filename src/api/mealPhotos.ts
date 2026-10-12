import { dataUrlToJpegBlob } from '../lib/image';
import { supabase } from '../lib/supabase';
import type { MealRow } from '../types/meal';

export const MEAL_PHOTOS_BUCKET = 'meal-photos';
export const MEAL_PHOTO_TTL_DAYS = 60;
export const MEAL_PHOTO_TTL_MS = MEAL_PHOTO_TTL_DAYS * 24 * 60 * 60 * 1000;
const SIGNED_URL_SECONDS = 60 * 60;

export function isMealPhotoExpired(meal: Pick<MealRow, 'created_at'>, now = Date.now()): boolean {
  return now - new Date(meal.created_at).getTime() >= MEAL_PHOTO_TTL_MS;
}

export function activeMealPhotoPath(meal: MealRow): string | null {
  if (!meal.photo_path || isMealPhotoExpired(meal)) return null;
  return meal.photo_path;
}

export async function uploadMealPhoto(userId: string, dataUrl: string): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).upload(path, dataUrlToJpegBlob(dataUrl), {
    contentType: 'image/jpeg',
    upsert: false,
    cacheControl: '3600',
  });

  if (error) throw new Error(toPhotoError(error.message, 'Could not save that photo.'));
  return path;
}

export async function deleteMealPhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).remove([path]);
  if (error) throw new Error(toPhotoError(error.message, 'Could not delete that photo.'));
}

export async function deleteMealPhotosForUser(userId: string): Promise<void> {
  const names: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).list(userId, {
      limit: 100,
      offset,
    });
    if (error) {
      if (isMissingBucket(error.message)) return;
      throw new Error(toPhotoError(error.message, 'Could not delete your meal photos.'));
    }
    if (!data?.length) break;
    names.push(...data.map((file) => `${userId}/${file.name}`));
    if (data.length < 100) break;
    offset += data.length;
  }

  if (names.length === 0) return;

  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).remove(names);
  if (error) throw new Error(toPhotoError(error.message, 'Could not delete your meal photos.'));
}

export async function signMealPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(MEAL_PHOTOS_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_SECONDS);

  if (error) {
    if (isMissingBucket(error.message)) return {};
    throw new Error(toPhotoError(error.message, 'Could not load meal photos.'));
  }

  const urls: Record<string, string> = {};
  (data ?? []).forEach((row, index) => {
    const path = row.path || unique[index];
    if (row.signedUrl && path) urls[path] = row.signedUrl;
  });
  return urls;
}

export async function purgeExpiredMealPhotos(meals: MealRow[]): Promise<MealRow[]> {
  const expired = meals.filter((meal) => meal.photo_path && isMealPhotoExpired(meal));
  if (expired.length === 0) return meals;

  const paths = expired
    .map((meal) => meal.photo_path)
    .filter((path): path is string => Boolean(path));

  const { error: storageError } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).remove(paths);
  if (storageError && !isMissingBucket(storageError.message)) {
    throw new Error(toPhotoError(storageError.message, 'Could not clear expired photos.'));
  }

  const { error } = await supabase
    .from('meals')
    .update({ photo_path: null })
    .in(
      'id',
      expired.map((meal) => meal.id),
    );

  if (error && !isMissingPhotoColumn(error.message)) {
    throw new Error(toPhotoError(error.message, 'Could not clear expired photos.'));
  }

  const expiredIds = new Set(expired.map((meal) => meal.id));
  return meals.map((meal) => (expiredIds.has(meal.id) ? { ...meal, photo_path: null } : meal));
}

export function toPhotoError(message: string, fallback: string): string {
  const lower = message.toLowerCase();
  if (isMissingBucket(lower) || isMissingPhotoColumn(lower)) {
    return 'Meal photos are not set up yet. Paste supabase/meal-photos.sql into the SQL editor, then refresh.';
  }
  return message || fallback;
}

function isMissingBucket(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('bucket') && (lower.includes('not found') || lower.includes('not exist'));
}

function isMissingPhotoColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('photo_path') && (lower.includes('column') || lower.includes('schema'));
}
