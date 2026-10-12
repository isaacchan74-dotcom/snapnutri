import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { activeMealPhotoPath } from '../../api/mealPhotos';
import {
  AppText,
  Banner,
  Button,
  EmptyState,
  MealCard,
  PhotoCalendar,
  ScreenContainer,
  SegmentedControl,
} from '../../components';
import { dayHeading, localDayKey, startOfLocalMonth } from '../../lib/dates';
import { useMealPhotoUrls } from '../../lib/useMealPhotoUrls';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import type { MealRow } from '../../types/meal';
import { StatsPanel } from './StatsPanel';

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
  const [month, setMonth] = useState(() => startOfLocalMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState(() => localDayKey(new Date()));
  const photoUrls = useMealPhotoUrls(meals);

  useEffect(() => {
    if (user?.id) void load(user.id);
  }, [load, user?.id]);

  useEffect(() => {
    if (requested === 'stats' || requested === 'meals') {
      setView(requested);
    }
  }, [requested]);

  const dayMeals = useMemo(() => mealsForDay(meals, selectedKey), [meals, selectedKey]);

  const handleSelectDay = (key: string) => {
    const logged = mealsForDay(meals, key);
    setSelectedKey(key);
    if (logged.length === 1) {
      navigate(`/journal/${logged[0].id}`);
    }
  };

  const handleView = (next: JournalView) => {
    setView(next);
    setSearchParams(next === 'stats' ? { view: 'stats' } : {}, { replace: true });
  };

  const handleMonth = (next: Date) => {
    const today = new Date();
    setMonth(startOfLocalMonth(next));
    if (startOfLocalMonth(next).getTime() === startOfLocalMonth(today).getTime()) {
      setSelectedKey(localDayKey(today));
      return;
    }
    const firstLogged = meals.find((meal) => {
      const logged = new Date(meal.logged_at);
      return (
        logged.getFullYear() === next.getFullYear() && logged.getMonth() === next.getMonth()
      );
    });
    setSelectedKey(firstLogged ? localDayKey(new Date(firstLogged.logged_at)) : localDayKey(next));
  };

  return (
    <ScreenContainer
      title="Your journal"
      subtitle={
        view === 'stats'
          ? 'Loud numbers. Honest macros. A week that actually looks like a poster.'
          : 'A month of plates. Tap a day, then tweak the log.'
      }
      headerRight={
        view === 'meals' ? (
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
        ) : (
          <div className="stack">
            <PhotoCalendar
              month={month}
              selectedKey={selectedKey}
              meals={meals}
              photoUrls={photoUrls}
              onSelectDay={handleSelectDay}
              onChangeMonth={handleMonth}
            />

            <section className="stack stack--md">
              <AppText as="h2" variant="label" color="muted">
                {dayHeading(dayFromKey(selectedKey))}
              </AppText>

              {dayMeals.length === 0 ? (
                <EmptyState
                  emoji="🍽️"
                  title={meals.length === 0 ? 'Your journal is empty' : 'Nothing this day'}
                  message={
                    meals.length === 0
                      ? 'Snap a plate or type one in. Photo days light up the calendar.'
                      : 'No plates on this date. Snap one or type it in.'
                  }
                >
                  <Button label="+ Add meal" onClick={() => navigate('/journal/new')} />
                </EmptyState>
              ) : (
                <div className="stack stack--sm">
                  {dayMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      photoUrl={photoUrlFor(meal, photoUrls)}
                      onOpen={() => navigate(`/journal/${meal.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}

function mealsForDay(meals: MealRow[], key: string): MealRow[] {
  return meals.filter((meal) => localDayKey(new Date(meal.logged_at)) === key);
}

function dayFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function photoUrlFor(meal: MealRow, urls: Record<string, string>): string | undefined {
  const path = activeMealPhotoPath(meal);
  return path ? urls[path] : undefined;
}
