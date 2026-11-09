import { create } from 'zustand';

import type { HeightUnit, WeightUnit } from '../lib/units';
import type { ActivityLevel, Gender, Goal, ProfileMeasurements } from '../types/profile';

export type OnboardingStep = 'intro' | 'form';

type OnboardingDraft = {
  name: string;
  gender: Gender | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  ageText: string;
  cmText: string;
  feetText: string;
  inchesText: string;
  weightText: string;
};

type OnboardingState = OnboardingDraft & {
  step: OnboardingStep;
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  update: (patch: Partial<OnboardingDraft>) => void;
  setStep: (step: OnboardingStep) => void;
  setHeightUnit: (unit: HeightUnit) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  reset: () => void;
  toMeasurements: () => ProfileMeasurements | null;
};

const emptyDraft: OnboardingDraft = {
  name: '',
  gender: null,
  age: null,
  height: null,
  weight: null,
  activityLevel: null,
  goal: null,
  ageText: '',
  cmText: '',
  feetText: '',
  inchesText: '',
  weightText: '',
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...emptyDraft,
  step: 'intro',
  heightUnit: 'ftin',
  weightUnit: 'lb',

  update: (patch) => set(patch),
  setStep: (step) => set({ step }),
  setHeightUnit: (heightUnit) => set({ heightUnit }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  reset: () => set({ ...emptyDraft, step: 'intro' }),

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
