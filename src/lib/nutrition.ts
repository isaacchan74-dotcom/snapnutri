import type {
  ActivityLevel,
  DailyTargets,
  Gender,
  Goal,
  ProfileMeasurements,
} from '../types/profile';

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

/**
 * How each goal bends the targets.
 * - calorieFactor: multiplier on TDEE (below 1 = deficit, above 1 = surplus)
 * - proteinPerKg: grams of protein per kg of bodyweight
 * - fatShare: share of calories from fat; carbs take whatever is left
 */
type GoalPlan = { calorieFactor: number; proteinPerKg: number; fatShare: number };

export const GOAL_PLANS: Record<Goal, GoalPlan> = {
  // Steady deficit, protein high enough to protect muscle.
  lose: { calorieFactor: 0.8, proteinPerKg: 2.0, fatShare: 0.27 },
  maintain: { calorieFactor: 1, proteinPerKg: 1.6, fatShare: 0.27 },
  // Surplus with high protein to build muscle.
  gain: { calorieFactor: 1.12, proteinPerKg: 2.0, fatShare: 0.25 },
  // Mild deficit, the highest protein, moderate fat.
  recomp: { calorieFactor: 0.92, proteinPerKg: 2.3, fatShare: 0.25 },
  // Small surplus, lower fat share so carbs run high for training.
  athletic: { calorieFactor: 1.08, proteinPerKg: 1.7, fatShare: 0.22 },
  // Maintenance with a balanced split and a bit more fat.
  health: { calorieFactor: 1, proteinPerKg: 1.4, fatShare: 0.3 },
};

const MINIMUM_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
};

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

export function calculateBmr({
  gender,
  age,
  height,
  weight,
}: Pick<ProfileMeasurements, 'gender' | 'age' | 'height' | 'weight'>): number {
  return 10 * weight + 6.25 * height - 5 * age + GENDER_BMR_OFFSET[gender];
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateCalorieTarget(tdee: number, goal: Goal, gender: Gender): number {
  return Math.max(MINIMUM_CALORIES[gender], tdee * GOAL_PLANS[goal].calorieFactor);
}

export function calculateMacroTargets(
  calories: number,
  weightKg: number,
  goal: Goal,
): Omit<DailyTargets, 'calories'> {
  const plan = GOAL_PLANS[goal];
  const proteinCap = (calories * 0.4) / CALORIES_PER_GRAM.protein;
  const protein = Math.min(weightKg * plan.proteinPerKg, proteinCap);

  const fatFloor = weightKg * 0.5;
  const fat = Math.max(fatFloor, (calories * plan.fatShare) / CALORIES_PER_GRAM.fat);

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
