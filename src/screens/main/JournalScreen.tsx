import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  AppText,
  Banner,
  Button,
  EmptyState,
  MealCard,
  ScreenContainer,
  SegmentedControl,
} from '../../components';
import { dayHeading, localDayKey } from '../../lib/dates';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import type { MealRow } from '../../types/meal';
import { StatsPanel } from './StatsPanel';

type DayGroup = {
  key: string;
  label: string;
  meals: MealRow[];
};

type JournalView = 'meals' | 'stats';

const VIEWS: { value: JournalView; label: string }[] = [
  { value: 'meals', label: 'Meals' },
  { value: 'stats', label: 'Stats' },
];

export function JournalScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const meals = useMealStore((state) => state.meals);
  const loading = useMealStore((state) => state.loading);
  const error = useMealStore((state) => state.error);
  const load = useMealStore((state) => state.load);
  const requested = searchParams.get('view');
  const [view, setView] = useState<JournalView>(requested === 'stats' ? 'stats' : 'meals');

  useEffect(() => {
    if (user?.id) void load(user.id);
  }, [load, user?.id]);

  useEffect(() => {
    if (requested === 'stats' || requested === 'meals') {
      setView(requested);
    }
  }, [requested]);

  const groups = useMemo(() => groupMeals(meals), [meals]);

  const handleView = (next: JournalView) => {
    setView(next);
    setSearchParams(next === 'stats' ? { view: 'stats' } : {}, { replace: true });
  };

  return (
    <ScreenContainer
      title="Your journal"
      subtitle={
        view === 'stats'
          ? 'Loud numbers. Honest macros. A week that actually looks like a poster.'
          : 'Every bite you log, newest first.'
      }
      headerRight={
        view === 'meals' && meals.length > 0 ? (
          <Button
            label="+ Add"
            size="sm"
            fullWidth={false}
            onClick={() => navigate('/journal/new')}
          />
        ) : null
      }
    >
      <div className="stack">
        <SegmentedControl segments={VIEWS} value={view} onChange={handleView} />

        {error ? <Banner message={error} /> : null}

        {view === 'stats' ? (
          <StatsPanel />
        ) : loading && meals.length === 0 ? (
          <AppText variant="caption" color="muted" align="center">
            Loading your meals…
          </AppText>
        ) : meals.length === 0 ? (
          <EmptyState
            emoji="🍽️"
            title="Your journal is empty"
            message="Snap a plate or type one in. Stats fill in from the same log."
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
      </div>
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
