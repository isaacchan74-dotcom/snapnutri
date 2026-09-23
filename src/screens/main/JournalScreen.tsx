import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppText,
  Banner,
  Button,
  EmptyState,
  MealCard,
  ScreenContainer,
} from '../../components';
import { dayHeading, localDayKey } from '../../lib/dates';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import type { MealRow } from '../../types/meal';

type DayGroup = {
  key: string;
  label: string;
  meals: MealRow[];
};

export function JournalScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const meals = useMealStore((state) => state.meals);
  const loading = useMealStore((state) => state.loading);
  const error = useMealStore((state) => state.error);
  const load = useMealStore((state) => state.load);

  useEffect(() => {
    if (user?.id) void load(user.id);
  }, [load, user?.id]);

  const groups = useMemo(() => groupMeals(meals), [meals]);

  return (
    <ScreenContainer
      title="Your journal"
      subtitle="Every bite you log, newest first."
      headerRight={
        meals.length > 0 ? (
          <Button
            label="+ Add"
            size="sm"
            fullWidth={false}
            onClick={() => navigate('/journal/new')}
          />
        ) : null
      }
    >
      {error ? <Banner message={error} /> : null}

      {loading && meals.length === 0 ? (
        <AppText variant="caption" color="muted" align="center">
          Loading your meals…
        </AppText>
      ) : meals.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="Your journal is empty"
          message="Log a dining-hall plate or a late-night snack. Camera magic comes later — typing works today."
        >
          <Button label="+ Add meal" onClick={() => navigate('/journal/new')} />
        </EmptyState>
      ) : (
        <div className="stack">
          {groups.map((group) => (
            <section key={group.key} className="stack stack--md">
              <AppText as="h2" variant="label" color="muted">
                {group.label}
              </AppText>
              <div className="stack stack--sm">
                {group.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onOpen={() => navigate(`/journal/${meal.id}`)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}

function groupMeals(meals: MealRow[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  meals.forEach((meal) => {
    const date = new Date(meal.logged_at);
    const key = localDayKey(date);
    const existing = groups.get(key);
    if (existing) {
      existing.meals.push(meal);
      return;
    }
    groups.set(key, { key, label: dayHeading(date), meals: [meal] });
  });

  return [...groups.values()];
}
