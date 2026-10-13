import { calculateDailyTargets } from '../lib/nutrition';
import { isMissingSchema, previewGet, previewSet } from '../lib/preview';
import { supabase } from '../lib/supabase';
import type { DailyTargets, ProfileMeasurements, ProfileRow } from '../types/profile';

const TABLE = 'profiles';

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', userId).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? withPreviewPrefs(data as ProfileRow) : null;
}

/** Before the migration, name and preferences come from the browser. */
function withPreviewPrefs(row: ProfileRow): ProfileRow {
  if ('night_mode' in row) return row;
  return { ...row, ...(previewGet('profiles', row.id) ?? {}) } as ProfileRow;
}

type SaveProfileInput = {
  userId: string;
  email: string | null;
  measurements: ProfileMeasurements;
  targets: DailyTargets;
};

export async function saveProfile({
  userId,
  email,
  measurements,
  targets,
}: SaveProfileInput): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id: userId,
        email,
        gender: measurements.gender,
        age: measurements.age,
        height: measurements.height,
        weight: measurements.weight,
        activity_level: measurements.activityLevel,
        goal: measurements.goal,
        daily_calorie_target: targets.calories,
        daily_protein_target: targets.protein,
        daily_carb_target: targets.carbs,
        daily_fat_target: targets.fat,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();

  if (error) {
    if (error.message.includes('profiles_goal_check')) {
      throw new Error(
        'That goal needs a quick database update. Run supabase/goals-and-descriptions.sql in the SQL editor, then try again.',
      );
    }
    throw new Error(error.message);
  }
  return withPreviewPrefs(data as ProfileRow);
}

/** Name and Profile-tab preferences. Needs supabase/journal-and-pet.sql. */
export async function updateProfilePrefs(
  userId: string,
  patch: Partial<Pick<ProfileRow, 'display_name' | 'night_mode' | 'reminders'>>,
): Promise<ProfileRow> {
  const { data, error } = await supabase.from(TABLE).update(patch).eq('id', userId).select('*').single();

  if (error && isMissingSchema(error.message)) {
    previewSet('profiles', userId, patch);
    const profile = await fetchProfile(userId);
    if (!profile) throw new Error('Could not find your profile.');
    return profile;
  }
  if (error) throw new Error(toSchemaError(error.message));
  return data as ProfileRow;
}

export function toSchemaError(message: string): string {
  const lower = message.toLowerCase();
  if (
    (lower.includes('column') || lower.includes('could not find')) &&
    /display_name|night_mode|reminders|meal_type|foods|portion|shared_with|vegetable_servings|reviewed|pet_progress/.test(lower)
  ) {
    return 'The database needs a quick update. Run supabase/journal-and-pet.sql in the Supabase SQL editor, then refresh.';
  }
  return message;
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', userId);
  if (error) throw new Error(error.message);
}

/**
 * Shared write path for onboarding and Edit Profile.
 * Recalculates BMR → TDEE → calories → macros, then upserts the profiles row.
 */
export async function saveProfileFromMeasurements(input: {
  userId: string;
  email: string | null;
  measurements: ProfileMeasurements;
}): Promise<ProfileRow> {
  const { calories, protein, carbs, fat } = calculateDailyTargets(input.measurements);
  return saveProfile({
    userId: input.userId,
    email: input.email,
    measurements: input.measurements,
    targets: { calories, protein, carbs, fat },
  });
}
