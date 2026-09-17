import { create } from 'zustand';

import type { HeightUnit, WeightUnit } from '../lib/units';
import type { ActivityLevel, Gender, Goal, ProfileMeasurements } from '../types/profile';

type OnboardingDraft = {
  gender: Gender | null;
  age: number | null;
  /** Centimetres. */
  height: number | null;
  /** Kilograms. */
  weight: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
};

type OnboardingState = OnboardingDraft & {
  /** Remembered so the user is not re-toggling units between steps. */
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;

  update: (patch: Partial<OnboardingDraft>) => void;
  setHeightUnit: (unit: HeightUnit) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  reset: () => void;
  /** Null until every answer has been given. */
  toMeasurements: () => ProfileMeasurements | null;
};

const emptyDraft: OnboardingDraft = {
  gender: null,
  age: null,
  height: null,
  weight: null,
  activityLevel: null,
  goal: null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...emptyDraft,
  heightUnit: 'ftin',
  weightUnit: 'lb',

  update: (patch) => set(patch),
  setHeightUnit: (heightUnit) => set({ heightUnit }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  reset: () => set({ ...emptyDraft }),

  toMeasurements: () => {
    const { gender, age, height, weight, activityLevel, goal } = get();
    if (
      gender == null ||
      age == null ||
      height == null ||
      weight == null ||
      activityLevel == null ||
      goal == null
    ) {
      return null;
    }
    return { gender, age, height, weight, activityLevel, goal };
  },
}));
