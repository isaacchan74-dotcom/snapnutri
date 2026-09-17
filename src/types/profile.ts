export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

/** The measurements the user gives us during onboarding. Always stored metric. */
export type ProfileMeasurements = {
  gender: Gender;
  age: number;
  /** Centimetres. */
  height: number;
  /** Kilograms. */
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

/** What the calculator derives from the measurements. */
export type DailyTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

/** Row shape of `public.profiles` in Supabase. */
export type ProfileRow = {
  id: string;
  email: string | null;
  gender: Gender | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  daily_calorie_target: number | null;
  daily_protein_target: number | null;
  daily_carb_target: number | null;
  daily_fat_target: number | null;
  created_at: string;
};

/**
 * A profile counts as onboarded once every measurement and a calorie target
 * are present. No extra column needed.
 */
export function isProfileComplete(profile: ProfileRow | null): boolean {
  if (!profile) return false;

  return (
    profile.gender != null &&
    profile.age != null &&
    profile.height != null &&
    profile.weight != null &&
    profile.activity_level != null &&
    profile.goal != null &&
    profile.daily_calorie_target != null
  );
}
