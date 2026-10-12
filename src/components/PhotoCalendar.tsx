import { activeMealPhotoPath } from '../api/mealPhotos';
import {
  isSameLocalDay,
  isSameLocalMonth,
  localDayKey,
  monthGrid,
  monthHeading,
  shiftLocalMonth,
  startOfLocalMonth,
  weekdayLetters,
} from '../lib/dates';
import type { MealRow } from '../types/meal';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

type PhotoCalendarProps = {
  month: Date;
  selectedKey: string;
  meals: MealRow[];
  photoUrls: Record<string, string>;
  onSelectDay: (key: string) => void;
  onChangeMonth: (month: Date) => void;
};

type DayMark = 'photo' | 'dot' | 'empty';

export function PhotoCalendar({
  month,
  selectedKey,
  meals,
  photoUrls,
  onSelectDay,
  onChangeMonth,
}: PhotoCalendarProps) {
  const today = new Date();
  const currentMonth = startOfLocalMonth(today);
  const canGoForward = month.getTime() < currentMonth.getTime();
  const marks = dayMarks(meals, photoUrls);

  return (
    <section className="photo-cal">
      <div className="photo-cal__nav">
        <IconButton label="Previous month" onClick={() => onChangeMonth(shiftLocalMonth(month, -1))}>
          <ChevronIcon direction="left" />
        </IconButton>
        <AppText as="h2" variant="heading">
          {monthHeading(month)}
        </AppText>
        <IconButton
          label="Next month"
          onClick={() => onChangeMonth(shiftLocalMonth(month, 1))}
          disabled={!canGoForward}
        >
          <ChevronIcon direction="right" />
        </IconButton>
      </div>

      <div className="photo-cal__week">
        {weekdayLetters().map((letter, index) => (
          <AppText key={`${letter}-${index}`} as="span" variant="label" color="muted" align="center">
            {letter}
          </AppText>
        ))}
      </div>

      <div className="photo-cal__grid">
        {monthGrid(month).map((day) => {
          const key = localDayKey(day);
          const mark = marks.get(key) ?? { kind: 'empty' as const };
          const inMonth = isSameLocalMonth(day, month);
          const selected = key === selectedKey;
          const todayCell = isSameLocalDay(day, today);

          return (
            <button
              key={key}
              type="button"
              className={[
                'photo-cal__day',
                inMonth ? '' : 'photo-cal__day--outside',
                selected ? 'photo-cal__day--selected' : '',
                todayCell ? 'photo-cal__day--today' : '',
                mark.kind === 'photo' ? 'photo-cal__day--photo' : '',
                mark.kind === 'dot' ? 'photo-cal__day--logged' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={dayLabel(day, mark.kind, selected)}
              aria-pressed={selected}
              onClick={() => onSelectDay(key)}
            >
              {mark.kind === 'photo' && mark.url ? (
                <img className="photo-cal__thumb" src={mark.url} alt="" />
              ) : null}
              <span className="photo-cal__num">{day.getDate()}</span>
              {mark.kind === 'dot' ? <span className="photo-cal__dot" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function dayMarks(meals: MealRow[], photoUrls: Record<string, string>) {
  const marks = new Map<string, { kind: DayMark; url?: string }>();

  meals.forEach((meal) => {
    const key = localDayKey(new Date(meal.logged_at));
    const path = activeMealPhotoPath(meal);
    const url = path ? photoUrls[path] : undefined;
    const existing = marks.get(key);

    if (url) {
      if (existing?.kind !== 'photo') marks.set(key, { kind: 'photo', url });
      return;
    }

    if (!existing) marks.set(key, { kind: 'dot' });
  });

  return marks;
}

function dayLabel(day: Date, mark: DayMark, selected: boolean): string {
  const date = day.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  const suffix = mark === 'photo' ? ', photo logged' : mark === 'dot' ? ', meal logged' : ', no meals';
  return `${date}${suffix}${selected ? ', selected' : ''}`;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="icon-btn__svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M14.5 6.5 9 12l5.5 5.5' : 'M9.5 6.5 15 12l-5.5 5.5'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
