import type {
  ActivityLevel,
  DailyTargets,
  Gender,
  Goal,
  ProfileMeasurements,
} from '../types/profile';

/** Standard Mifflin-St Jeor sex constants. */
const GENDER_BMR_OFFSET: Record<Gender, number> = {
  male: 5,
  female: -161,
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Calorie change applied to TDEE, as a fraction. */
const GOAL_CALORIE_FACTOR: Record<Goal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.12,
};

/** Grams of protein per kg of bodyweight — higher when cutting to protect muscle. */
const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 2.0,
  maintain: 1.6,
  gain: 1.8,
};

/** Share of daily calories from fat. */
const FAT_CALORIE_SHARE = 0.27;

/** Safety floor so an aggressive deficit never produces an unsafe target. */
const MINIMUM_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
};

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

/** Mifflin-St Jeor resting energy expenditure, in kcal/day. */
export function calculateBmr({
  gender,
  age,
  height,
  weight,
}: Pick<ProfileMeasurements, 'gender' | 'age' | 'height' | 'weight'>): number {
  return 10 * weight + 6.25 * height - 5 * age + GENDER_BMR_OFFSET[gender];
}

/** BMR scaled by the activity multiplier. */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/** TDEE adjusted for the user's goal, then clamped to a safe minimum. */
export function calculateCalorieTarget(tdee: number, goal: Goal, gender: Gender): number {
  return Math.max(MINIMUM_CALORIES[gender], tdee * GOAL_CALORIE_FACTOR[goal]);
}

/**
 * Splits a calorie target into macros.
 *
 * Protein is anchored to bodyweight, fat to a share of calories, and carbs
 * take whatever is left. Protein and fat are capped so carbs never go negative.
 */
export function calculateMacroTargets(
  calories: number,
  weightKg: number,
  goal: Goal,
): Omit<DailyTargets, 'calories'> {
  const proteinCap = (calories * 0.4) / CALORIES_PER_GRAM.protein;
  const protein = Math.min(weightKg * GOAL_PROTEIN_PER_KG[goal], proteinCap);

  const fatFloor = weightKg * 0.5;
  const fat = Math.max(fatFloor, (calories * FAT_CALORIE_SHARE) / CALORIES_PER_GRAM.fat);

  const remainingCalories =
    calories - protein * CALORIES_PER_GRAM.protein - fat * CALORIES_PER_GRAM.fat;
  const carbs = Math.max(0, remainingCalories / CALORIES_PER_GRAM.carbs);

  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

export type TargetBreakdown = DailyTargets & {
  bmr: number;
  tdee: number;
};

/** End-to-end: measurements in, daily targets out. All values rounded. */
export function calculateDailyTargets(measurements: ProfileMeasurements): TargetBreakdown {
  const bmr = calculateBmr(measurements);
  const tdee = calculateTdee(bmr, measurements.activityLevel);
  const calories = calculateCalorieTarget(tdee, measurements.goal, measurements.gender);
  const macros = calculateMacroTargets(calories, measurements.weight, measurements.goal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    ...macros,
  };
}
