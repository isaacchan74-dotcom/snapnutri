-- Let people log more than three numbered meals a day (Meal 4, 5 and 6).
-- Safe to run more than once. Existing rows are unaffected.
alter table public.meals drop constraint if exists meals_meal_type_check;
alter table public.meals
  add constraint meals_meal_type_check
  check (meal_type is null or meal_type in (
    'Breakfast', 'Lunch', 'Dinner', 'Meal4', 'Meal5', 'Meal6', 'Snack', 'Coffee', 'Drinks'
  ));
