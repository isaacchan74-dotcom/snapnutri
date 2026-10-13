import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { localDayKey } from '../../lib/dates';
import { mealDay, mealsOn, todayKey } from '../../lib/journal';
import { useUiStore } from '../../store/uiStore';
import type { MealRow } from '../../types/meal';
import { useJournalData, usePhotos } from '../../ui/hooks';
import { Icon } from '../../ui/Icon';
import { MealPhoto } from '../../ui/MealPhoto';

export function JournalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { meals } = useJournalData();
  const openModal = useUiStore((state) => state.openModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const showToast = useUiStore((state) => state.showToast);
  const today = todayKey();
  const selected = (location.state as { selected?: string } | null)?.selected ?? today;
  const [month, setMonth] = useState(() => {
    const [year, mon] = selected.split('-').map(Number);
    return new Date(year, mon - 1, 1);
  });

  const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const monthMeals = meals.filter((meal) => mealDay(meal).startsWith(key));
  const urls = usePhotos(monthMeals);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = month.getDay();
  const activeDays = new Set(monthMeals.map(mealDay)).size;
  const favorites = [...new Map(monthMeals.filter((meal) => meal.photo_path || urls[meal.id]).map((meal) => [meal.food_name, meal])).values()].slice(0, 3);
  const monthName = month.toLocaleDateString('en-US', { month: 'long' });

  const download = () => {
    const sorted = [...monthMeals].sort((a, b) => a.logged_at.localeCompare(b.logged_at));
    const text =
      `SnapNutri · ${key}\n${monthMeals.length} meals · ${activeDays} active days\n\n` +
      sorted.map((meal: MealRow) => `${mealDay(meal)} · ${meal.meal_type ?? 'Meal'}: ${meal.food_name}`).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `SnapNutri-${key}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    closeModal();
    showToast('Your monthly summary is ready.');
  };

  const share = () =>
    openModal(
      'A month worth keeping',
      <>
        <p className="muted">
          {monthName}: {monthMeals.length} meals across {activeDays} days.
        </p>
        <p className="notice formblock">Take a screenshot of your calendar, or download a little journal summary to keep.</p>
        <button className="btn" onClick={download}>
          Download monthly summary
        </button>
        <button className="btn secondary" onClick={closeModal}>
          Back to calendar
        </button>
      </>,
    );

  return (
    <>
      <header className="calendar-head row between">
        <div>
          <div className="eyebrow">Your little collection</div>
          <h1 className="calendar-title">Journal</h1>
        </div>
        <button className="iconbtn" aria-label="Share monthly journal" onClick={share}>
          <Icon name="share" />
        </button>
      </header>

      <section className="card calendar" aria-label="Monthly calendar">
        <div className="month-row">
          <button className="iconbtn" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            ‹
          </button>
          <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button className="iconbtn" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            ›
          </button>
        </div>
        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="days">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = localDayKey(new Date(month.getFullYear(), month.getMonth(), i + 1));
            const dayMeals = mealsOn(meals, day);
            const last = dayMeals[dayMeals.length - 1];
            return (
              <button
                key={day}
                className={`day ${!last ? 'empty' : ''} ${selected === day ? 'selected' : ''} ${day === today ? 'today' : ''}`}
                aria-label={`${day}: ${dayMeals.length} ${dayMeals.length === 1 ? 'meal' : 'meals'}${day === today ? ', today' : ''}`}
                aria-pressed={selected === day}
                onClick={() => navigate(`/journal/${day}`)}
              >
                <span className="num">{i + 1}</span>
                {last ? <MealPhoto meal={last} urls={urls} className="sticker" /> : null}
                {dayMeals.length > 1 ? <span className="count">{dayMeals.length}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="calendar-note">Little meals, collected day by day.</div>
      </section>

      <div className="summaries">
        <section className="card summary">
          <div className="eyebrow">This month</div>
          <div style={{ marginTop: 9 }}>
            <span className="big">{monthMeals.length}</span>
            <span className="small muted">meals logged</span>
          </div>
          <p className="subcount">
            <strong>{activeDays}</strong> active days
          </p>
        </section>
        <section className="card summary">
          <div className="eyebrow">Monthly favorites</div>
          <div className="favorite-stack">
            {favorites.length ? (
              favorites.map((meal) => <MealPhoto key={meal.id} meal={meal} urls={urls} className="sticker" />)
            ) : (
              <span className="muted small">Your favorites will find a home here.</span>
            )}
          </div>
        </section>
      </div>
      <p className="month-message">“A month of taking care, in your own way.”</p>
      <button className="link block" onClick={() => navigate(`/journal/${today}`)}>
        Open today’s page ›
      </button>
    </>
  );
}
