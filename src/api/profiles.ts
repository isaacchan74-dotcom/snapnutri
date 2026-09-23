import { calculateDailyTargets } from '../lib/nutrition';
import { supabase } from '../lib/supabase';
import type { DailyTargets, ProfileMeasurements, ProfileRow } from '../types/profile';

const TABLE = 'profiles';

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', userId).maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProfileRow | null;
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

  if (error) throw new Error(error.message);
  return data as ProfileRow;
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
