import type { ActivityLevel, Gender, Goal } from '../types/profile';

type Option<T extends string> = {
  value: T;
  label: string;
  emoji: string;
  description?: string;
};

export const GENDER_OPTIONS: readonly Option<Gender>[] = [
  { value: 'female', label: 'Female', emoji: '♀️' },
  { value: 'male', label: 'Male', emoji: '♂️' },
];

export const ACTIVITY_OPTIONS: readonly Option<ActivityLevel>[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    emoji: '🛋️',
    description: 'Lectures, laptop, repeat. Little to no exercise.',
  },
  {
    value: 'light',
    label: 'Lightly active',
    emoji: '🚶',
    description: 'Walking around campus, 1–2 workouts a week.',
  },
  {
    value: 'moderate',
    label: 'Moderately active',
    emoji: '🏃',
    description: 'Gym or sport 3–5 days a week.',
  },
  {
    value: 'active',
    label: 'Very active',
    emoji: '🏋️',
    description: 'Hard training 6–7 days a week.',
  },
  {
    value: 'very_active',
    label: 'Athlete mode',
    emoji: '🔥',
    description: 'Two-a-days or a physical job on top of training.',
  },
];

export const GOAL_OPTIONS: readonly Option<Goal>[] = [
  {
    value: 'lose',
    label: 'Lose weight',
    emoji: '📉',
    description: 'A steady calorie deficit, no crash dieting.',
  },
  {
    value: 'maintain',
    label: 'Maintain',
    emoji: '⚖️',
    description: 'Stay where you are and eat a bit smarter.',
  },
  {
    value: 'gain',
    label: 'Gain weight',
    emoji: '📈',
    description: 'A calorie surplus to build size and strength.',
  },
];

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly active',
  moderate: 'Moderately active',
  active: 'Very active',
  very_active: 'Athlete mode',
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Lose weight',
  maintain: 'Maintain weight',
  gain: 'Gain weight',
};

/** Age / height / weight bounds used by the onboarding input validation. */
export const INPUT_LIMITS = {
  age: { min: 13, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 250 },
} as const;
