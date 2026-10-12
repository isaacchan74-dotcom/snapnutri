export type MealEstimate = {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
};

export type AnalyzeMealSuccess = MealEstimate & {
  needs_retake: false;
  reason: null;
};

export type AnalyzeMealRetake = {
  needs_retake: true;
  reason: string;
  food_name: null;
  calories: null;
  protein: null;
  carbs: null;
  fat: null;
  confidence: number;
};

export type AnalyzeMealResult = AnalyzeMealSuccess | AnalyzeMealRetake;
