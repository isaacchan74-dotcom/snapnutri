import { deleteCharacter } from './characters';
import { deleteMealPhotosForUser } from './mealPhotos';
import { deleteMealsForUser } from './meals';
import { deleteProfile } from './profiles';

function toDeleteError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : fallback;
  const lower = message.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('violates')) {
    return new Error(
      'Supabase blocked the delete. Run the latest public.profiles delete policy from supabase/schema.sql, then try again.',
    );
  }
  return error instanceof Error ? error : new Error(fallback);
}

/**
 * Removes the signed-in user's profile, meals, and character.
 * Auth sign-out is left to the caller so the UI can confirm first.
 */
export async function deleteAccountData(userId: string): Promise<void> {
  try {
    await deleteMealPhotosForUser(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (!message.includes('not set up yet') && !message.includes('could not find')) {
      throw toDeleteError(error, 'Could not delete your meal photos.');
    }
  }

  try {
    await deleteMealsForUser(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (!message.includes('could not find the table')) {
      throw toDeleteError(error, 'Could not delete your meals.');
    }
  }

  try {
    await deleteCharacter(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (!message.includes('could not find the table')) {
      throw toDeleteError(error, 'Could not delete your character.');
    }
  }

  try {
    await deleteProfile(userId);
  } catch (error) {
    throw toDeleteError(error, 'Could not delete your profile.');
  }
}
