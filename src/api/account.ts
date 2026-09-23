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
 * Removes the signed-in user's profile row and every meal they logged.
 * Auth sign-out is left to the caller so the UI can confirm first.
 */
export async function deleteAccountData(userId: string): Promise<void> {
  try {
    await deleteMealsForUser(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (!message.includes('could not find the table')) {
      throw toDeleteError(error, 'Could not delete your meals.');
    }
  }

  try {
    await deleteProfile(userId);
  } catch (error) {
    throw toDeleteError(error, 'Could not delete your profile.');
  }
}
