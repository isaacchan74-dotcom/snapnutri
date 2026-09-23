import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppText,
  Banner,
  Button,
  Card,
  ScreenContainer,
  TargetProgress,
  WeeklyCaloriesChart,
} from '../../components';
import { formatWhole, lastLocalDays, localDayKey, weekdayShort } from '../../lib/dates';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import { addMealToTotals, emptyTotals } from '../../types/meal';

export function DashboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const meals = useMealStore((state) => state.meals);
  const loading = useMealStore((state) => state.loading);
  const error = useMealStore((state) => state.error);
  const load = useMealStore((state) => state.load);

  useEffect(() => {
    if (user?.id) void load(user.id);
  }, [load, user?.id]);

  const todayKey = localDayKey(new Date());
  const todayTotals = useMemo(
    () =>
      meals
        .filter((meal) => localDayKey(new Date(meal.logged_at)) === todayKey)
        .reduce(addMealToTotals, emptyTotals()),
    [meals, todayKey],
  );

  const week = useMemo(() => {
    const days = lastLocalDays(7);
    return days.map((day) => {
      const key = localDayKey(day);
      const calories = meals
        .filter((meal) => localDayKey(new Date(meal.logged_at)) === key)
        .reduce((sum, meal) => sum + meal.calories, 0);
      return { label: weekdayShort(day), calories };
    });
  }, [meals]);

  return (
    <ScreenContainer title="Stats" subtitle="Today versus your targets, plus a quiet week view.">
      {error ? <Banner message={error} /> : null}

      <div className="stack">
        <Card tone="brand">
          <div className="metric-block">
            <AppText variant="label" color="secondary">
              Today
            </AppText>
            <AppText variant="metric" color="brand">
              {formatWhole(todayTotals.calories)}
            </AppText>
            <AppText variant="caption" color="secondary">
              {profile?.daily_calorie_target
                ? `of ${formatWhole(profile.daily_calorie_target)} kcal`
                : 'kcal logged'}
            </AppText>
          </div>
        </Card>

        <Card>
          <div className="stack stack--md">
            <TargetProgress
              label="Calories"
              current={todayTotals.calories}
              target={profile?.daily_calorie_target ?? null}
              unit="kcal"
              colorVar="--color-primary"
            />
            <TargetProgress
              label="Protein"
              current={todayTotals.protein}
              target={profile?.daily_protein_target ?? null}
              unit="g"
              colorVar="--color-protein"
            />
            <TargetProgress
              label="Carbs"
              current={todayTotals.carbs}
              target={profile?.daily_carb_target ?? null}
              unit="g"
              colorVar="--color-carbs"
            />
            <TargetProgress
              label="Fat"
              current={todayTotals.fat}
              target={profile?.daily_fat_target ?? null}
              unit="g"
              colorVar="--color-fat"
            />
          </div>
        </Card>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Last 7 days
          </AppText>
          <Card padding="sm">
            {loading && meals.length === 0 ? (
              <AppText variant="caption" color="muted" align="center">
                Crunching the week…
              </AppText>
            ) : (
              <WeeklyCaloriesChart days={week} />
            )}
          </Card>
        </div>

        {meals.length === 0 ? (
          <Button label="Log your first meal" onClick={() => navigate('/journal/new')} />
        ) : null}
      </div>
    </ScreenContainer>
  );
}
