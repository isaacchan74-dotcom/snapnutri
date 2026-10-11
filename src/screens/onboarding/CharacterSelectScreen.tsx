import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveCharacter } from '../../api/characters';
import { CharacterSprite } from '../../components/CharacterSprite';
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
        equipped_hat: character?.equipped_hat ?? 'none',
        equipped_outfit: character?.equipped_outfit ?? 'none',
        equipped_background: character?.equipped_background ?? 'studio',
      });
      setCharacter(next);
      navigate('/character', { replace: true });
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save your buddy.';
      setError(
        message.toLowerCase().includes('could not find the table')
          ? 'The characters table is not in Supabase yet. Paste supabase/characters.sql into the SQL editor, then try again.'
          : message,
      );
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Meet your buddy"
      title="Pick a creature"
      subtitle="They’ll ride along for the recaps. You can restyle them anytime."
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
                <CharacterSprite type={creature.value} compact />
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
