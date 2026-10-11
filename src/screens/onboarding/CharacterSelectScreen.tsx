import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveCharacter } from '../../api/characters';
import { CharacterPortrait } from '../../components/CharacterPortrait';
import { AppText, Banner, Button, ScreenContainer } from '../../components';
import { CREATURES } from '../../constants/characterOptions';
import { useAuthStore } from '../../store/authStore';
import type { CharacterType } from '../../types/character';

export function CharacterSelectScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const character = useAuthStore((state) => state.character);
  const characterUnavailable = useAuthStore((state) => state.characterUnavailable);
  const setCharacter = useAuthStore((state) => state.setCharacter);
  const [picked, setPicked] = useState<CharacterType | null>(character?.character_type ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user || !picked) return;

    setError(null);
    setSaving(true);
    try {
      const next = await saveCharacter(user.id, {
        character_type: picked,
        equipped_background: character?.equipped_background ?? 'blossom',
      });
      setCharacter(next);
      navigate('/character', { replace: true });
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save your buddy.';
      setError(
        message.toLowerCase().includes('could not find the table') ||
          message.toLowerCase().includes('violates')
          ? 'Run the latest supabase/characters.sql in the SQL editor, then try again.'
          : message,
      );
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Meet your buddy"
      title="Pick a creature"
      subtitle="Pika, Red Panda, or Axolotl. You can swap later — mood follows your food log."
      footer={
        <Button
          label="That’s the one"
          onClick={handleSave}
          loading={saving}
          disabled={!picked || saving}
        />
      }
    >
      <div className="stack">
        {characterUnavailable ? (
          <Banner message="Paste supabase/characters.sql into the Supabase SQL editor, then pick a buddy." />
        ) : null}
        {error ? <Banner message={error} /> : null}
        <div className="character-grid">
          {CREATURES.map((creature) => {
            const selected = picked === creature.value;
            return (
              <button
                key={creature.value}
                type="button"
                className={selected ? 'character-pick character-pick--selected' : 'character-pick'}
                onClick={() => setPicked(creature.value)}
                aria-pressed={selected}
              >
                <CharacterPortrait animalType={creature.value} status="healthy" compact />
                <div className="stack stack--sm">
                  <AppText variant="heading">{creature.label}</AppText>
                  <AppText variant="caption" color="secondary">
                    {creature.blurb}
                  </AppText>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </ScreenContainer>
  );
}
