import { useState } from 'react';

import { saveCharacter } from '../../api/characters';
import { CharacterSprite } from '../../components/CharacterSprite';
import { AppText, Banner, Card, ScreenContainer } from '../../components';
import { BACKGROUNDS, CREATURES, HATS, OUTFITS } from '../../constants/characterOptions';
import { useAuthStore } from '../../store/authStore';
import type { BackgroundOption, CharacterType, HatOption, OutfitOption } from '../../types/character';

export function CharacterScreen() {
  const user = useAuthStore((state) => state.user);
  const character = useAuthStore((state) => state.character);
  const characterUnavailable = useAuthStore((state) => state.characterUnavailable);
  const setCharacter = useAuthStore((state) => state.setCharacter);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const persist = async (patch: {
    character_type?: CharacterType;
    equipped_hat?: HatOption;
    equipped_outfit?: OutfitOption;
    equipped_background?: BackgroundOption;
  }) => {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const next = await saveCharacter(user.id, {
        character_type: patch.character_type ?? character.character_type,
        equipped_hat: patch.equipped_hat ?? character.equipped_hat,
        equipped_outfit: patch.equipped_outfit ?? character.equipped_outfit,
        equipped_background: patch.equipped_background ?? character.equipped_background,
      });
      setCharacter(next);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save that look.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Buddy"
      title={`${labelFor(character.character_type)} is locked in`}
      subtitle="Hats, fits, backdrops. Styled placeholders now — real art later."
    >
      <div className="stack">
        {error ? <Banner message={error} /> : null}

        <CharacterSprite
          type={character.character_type}
          hat={character.equipped_hat}
          outfit={character.equipped_outfit}
          background={character.equipped_background}
        />

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Creature
          </AppText>
          <Card>
            <ChipRow
              disabled={saving}
              options={CREATURES.map((item) => ({ value: item.value, label: item.label }))}
              selected={character.character_type}
              onSelect={(value) => void persist({ character_type: value })}
            />
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Hat
          </AppText>
          <Card>
            <ChipRow
              disabled={saving}
              options={HATS}
              selected={character.equipped_hat}
              onSelect={(value) => void persist({ equipped_hat: value })}
            />
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Outfit
          </AppText>
          <Card>
            <ChipRow
              disabled={saving}
              options={OUTFITS}
              selected={character.equipped_outfit}
              onSelect={(value) => void persist({ equipped_outfit: value })}
            />
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Backdrop
          </AppText>
          <Card>
            <ChipRow
              disabled={saving}
              options={BACKGROUNDS}
              selected={character.equipped_background}
              onSelect={(value) => void persist({ equipped_background: value })}
            />
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
}

function labelFor(type: CharacterType): string {
  return CREATURES.find((item) => item.value === type)?.label ?? 'Buddy';
}

function ChipRow<T extends string>({
  options,
  selected,
  onSelect,
  disabled,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="chip-row" role="radiogroup">
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? 'chip chip--selected' : 'chip'}
            disabled={disabled}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
