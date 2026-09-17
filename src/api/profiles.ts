import { supabase } from '../lib/supabase';
import type { DailyTargets, ProfileMeasurements, ProfileRow } from '../types/profile';

const TABLE = 'profiles';

/** Returns null when the row does not exist yet (brand new signup). */
export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();

  if (error) throw new Error(error.message);
  return data;
}

type SaveProfileInput = {
  userId: string;
  email: string | null;
  measurements: ProfileMeasurements;
  targets: DailyTargets;
};

/** Writes onboarding answers and computed targets in one upsert. */
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
    .single<ProfileRow>();

  if (error) throw new Error(error.message);
  return data;
}
