import { supabase } from '../lib/supabase';
import type { CharacterInput, CharacterRow } from '../types/character';

const TABLE = 'characters';

function toCharacter(row: Record<string, unknown>): CharacterRow {
  return {
    user_id: String(row.user_id),
    character_type: row.character_type as CharacterRow['character_type'],
    equipped_hat: (row.equipped_hat as CharacterRow['equipped_hat']) ?? 'none',
    equipped_outfit: (row.equipped_outfit as CharacterRow['equipped_outfit']) ?? 'none',
    equipped_background: (row.equipped_background as CharacterRow['equipped_background']) ?? 'studio',
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function fetchCharacter(userId: string): Promise<CharacterRow | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toCharacter(data as Record<string, unknown>) : null;
}

export async function loadCharacter(userId: string): Promise<{
  character: CharacterRow | null;
  unavailable: boolean;
}> {
  try {
    return { character: await fetchCharacter(userId), unavailable: false };
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    if (message.includes('could not find the table')) {
      return { character: null, unavailable: true };
    }
    throw error;
  }
}

export async function saveCharacter(userId: string, input: CharacterInput): Promise<CharacterRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        character_type: input.character_type,
        equipped_hat: input.equipped_hat,
        equipped_outfit: input.equipped_outfit,
        equipped_background: input.equipped_background,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return toCharacter(data as Record<string, unknown>);
}

export async function deleteCharacter(userId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}
