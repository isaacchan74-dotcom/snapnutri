export type MealEstimate = {
  food_name: string;
  /** One short sentence about what the AI sees. May be empty. */
  description?: string;
  /** Visible items, most prominent first. Older function deploys omit it. */
  foods?: string[];
  vegetable_servings?: number;
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
  description?: null;
  calories: null;
  protein: null;
  carbs: null;
  fat: null;
  confidence: number;
};

export type AnalyzeMealResult = AnalyzeMealSuccess | AnalyzeMealRetake;
