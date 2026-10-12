import { useEffect, useMemo, useRef, useState } from 'react';

import { saveCharacter } from '../../api/characters';
import { CharacterPortrait } from '../../components/CharacterPortrait';
import {
  AppText,
  Banner,
  Card,
  IconButton,
  InfoRow,
  PenIcon,
  PetStatusBadge,
  ScreenContainer,
  TargetProgress,
} from '../../components';
import { BACKGROUNDS, CREATURES } from '../../constants/characterOptions';
import { backdropArtSrc, characterArtSrc } from '../../lib/characterArt';
import { lastLocalDays, localDayKey } from '../../lib/dates';
import { derivePetStatus, loggingStreak, STATUS_COPY } from '../../lib/petStatus';
import { useAuthStore } from '../../store/authStore';
import { useMealStore } from '../../store/mealStore';
import {
  DISPLAY_NAME_MAX,
  normalizeDisplayName,
  type BackgroundOption,
  type CharacterType,
} from '../../types/character';
import { addMealToTotals, emptyTotals } from '../../types/meal';

export function CharacterScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const character = useAuthStore((state) => state.character);
  const characterUnavailable = useAuthStore((state) => state.characterUnavailable);
  const setCharacter = useAuthStore((state) => state.setCharacter);
  const meals = useMealStore((state) => state.meals);
  const loadMeals = useMealStore((state) => state.load);
  const mealError = useMealStore((state) => state.error);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) void loadMeals(user.id);
  }, [loadMeals, user?.id]);

  const todayKey = localDayKey(new Date());
  const todayMeals = useMemo(
    () => meals.filter((meal) => localDayKey(new Date(meal.logged_at)) === todayKey),
    [meals, todayKey],
  );
  const todayTotals = useMemo(
    () => todayMeals.reduce(addMealToTotals, emptyTotals()),
    [todayMeals],
  );
  const weekMealCount = useMemo(() => {
    const keys = new Set(lastLocalDays(7).map((day) => localDayKey(day)));
    return meals.filter((meal) => keys.has(localDayKey(new Date(meal.logged_at)))).length;
  }, [meals]);

  const status = derivePetStatus(meals, profile?.daily_calorie_target ?? null);
  const streak = loggingStreak(meals);
  const statusCopy = STATUS_COPY[status];

  if (characterUnavailable) {
    return (
      <ScreenContainer eyebrow="Buddy" title="Your creature is almost here">
        <Banner message="Paste supabase/characters.sql into the Supabase SQL editor, then refresh." />
      </ScreenContainer>
    );
  }

  if (!character) {
    return (
      <ScreenContainer eyebrow="Buddy" title="No buddy yet">
        <Banner tone="info" message="Pick a creature to unlock this page." />
      </ScreenContainer>
    );
  }

  const buddyName = character.display_name ?? labelFor(character.character_type);

  const persist = async (patch: {
    character_type?: CharacterType;
    equipped_background?: BackgroundOption;
    display_name?: string | null;
  }) => {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const next = await saveCharacter(user.id, {
        character_type: patch.character_type ?? character.character_type,
        equipped_background: patch.equipped_background ?? character.equipped_background,
        ...(patch.display_name !== undefined ? { display_name: patch.display_name } : {}),
      });
      setCharacter(next);
      setRenaming(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save that look.';
      setError(
        message.toLowerCase().includes('display_name')
          ? 'Paste the latest supabase/characters.sql into the SQL editor to unlock nicknames, then refresh.'
          : message,
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (renaming) nameInputRef.current?.focus();
  }, [renaming]);

  const startRename = () => {
    setNameDraft(buddyName);
    setRenaming(true);
  };

  const saveName = () => {
    const nextName = normalizeDisplayName(nameDraft);
    void persist({ display_name: nextName });
  };

  return (
    <ScreenContainer
      eyebrow="Buddy"
      title={
        <div className="buddy-title">
          {renaming ? (
            <form
              className="buddy-title__name"
              onSubmit={(event) => {
                event.preventDefault();
                saveName();
              }}
            >
              <label className="sr-only" htmlFor="buddy-name">
                Buddy name
              </label>
              <input
                id="buddy-name"
                ref={nameInputRef}
                className="buddy-title__input"
                value={nameDraft}
                maxLength={DISPLAY_NAME_MAX}
                disabled={saving}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={() => {
                  if (document.activeElement === nameInputRef.current) return;
                  saveName();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setRenaming(false);
                  }
                }}
              />
            </form>
          ) : (
            <AppText as="h1" variant="title" className="buddy-title__name">
              {buddyName}
              <IconButton
                label="Rename buddy"
                className="icon-btn--inline"
                onClick={startRename}
                disabled={saving}
              >
                <PenIcon />
              </IconButton>
            </AppText>
          )}
          <PetStatusBadge status={status} />
        </div>
      }
      subtitle={statusCopy.blurb}
    >
      <div className="stack">
        {error ? <Banner message={error} /> : null}
        {mealError ? <Banner message={mealError} /> : null}

        <div className="diorama-block">
          <CharacterPortrait
            animalType={character.character_type}
            status={status}
            background={character.equipped_background}
          />
          <div className="backdrop-strip" role="radiogroup" aria-label="Backdrop">
            {BACKGROUNDS.map((backdrop) => {
              const selected = backdrop.value === character.equipped_background;
              return (
                <button
                  key={backdrop.value}
                  type="button"
                  role="radio"
                  aria-label={backdrop.label}
                  aria-checked={selected}
                  className={selected ? 'backdrop-chip backdrop-chip--selected' : 'backdrop-chip'}
                  disabled={saving}
                  onClick={() => void persist({ equipped_background: backdrop.value })}
                >
                  <img
                    className="diorama__art backdrop-chip__art"
                    src={backdropArtSrc(backdrop.value)}
                    alt=""
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="stack stack--md">
          <div className="stack stack--sm">
            <AppText as="h2" variant="heading">
              {`${buddyName}'s Stats`}
            </AppText>
            <AppText variant="caption" color="secondary">
              {`This is ${buddyName}'s fuel log. Meals you snap or type in feed them — skip too many days and they get hungry, even sick.`}
            </AppText>
          </div>
          <Card>
            <div className="metric-block">
              <AppText variant="label" color="secondary">
                Logging streak
              </AppText>
              <AppText variant="metric" color="brand">
                {streak}
              </AppText>
              <AppText variant="caption" color="secondary">
                {streak === 1 ? 'day in a row' : 'days in a row'}
              </AppText>
            </div>
          </Card>
          <Card>
            <InfoRow label="Meals today" value={String(todayMeals.length)} />
            <InfoRow label="Meals this week" value={String(weekMealCount)} last />
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
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Animal
          </AppText>
          <Card>
            <div className="pick-grid" role="radiogroup" aria-label="Animal">
              {CREATURES.map((creature) => {
                const selected = creature.value === character.character_type;
                return (
                  <button
                    key={creature.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={selected ? 'pick-tile pick-tile--selected' : 'pick-tile'}
                    disabled={saving}
                    onClick={() => void persist({ character_type: creature.value })}
                  >
                    <img
                      className="diorama__art pick-tile__art"
                      src={characterArtSrc(creature.value, 'healthy')}
                      alt=""
                      draggable={false}
                    />
                    <AppText as="span" variant="caption">
                      {creature.label}
                    </AppText>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
}

function labelFor(type: CharacterType): string {
  return CREATURES.find((item) => item.value === type)?.label ?? 'Buddy';
}
