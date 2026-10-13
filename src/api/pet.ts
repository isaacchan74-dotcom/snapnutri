import { isMissingSchema, previewGet, previewSet } from '../lib/preview';
import { supabase } from '../lib/supabase';
import { toSchemaError } from './profiles';

const TABLE = 'pet_progress';

export type PetProgress = {
  user_id: string;
  happiness: number;
  health: number;
  xp: number;
  points: number;
  accessory: string | null;
  bonus_days: string[];
};

export type PetPatch = Partial<Omit<PetProgress, 'user_id'>>;

function toPet(row: Record<string, unknown>): PetProgress {
  return {
    user_id: String(row.user_id),
    happiness: Number(row.happiness) || 0,
    health: Number(row.health) || 0,
    xp: Number(row.xp) || 0,
    points: Number(row.points) || 0,
    accessory: typeof row.accessory === 'string' && row.accessory ? row.accessory : null,
    bonus_days: Array.isArray(row.bonus_days)
      ? row.bonus_days.filter((day): day is string => typeof day === 'string')
      : [],
  };
}

/** Loads Pika's row, creating it with starter scores on first visit. */
const STARTER = { happiness: 60, health: 60, xp: 0, points: 0, accessory: null, bonus_days: [] };

export async function loadPet(userId: string): Promise<PetProgress> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).maybeSingle();
  if (error && isMissingSchema(error.message)) {
    return toPet({ ...STARTER, ...(previewGet('pets', userId) ?? {}), user_id: userId });
  }
  if (error) throw new Error(toSchemaError(error.message));
  if (data) return toPet(data as Record<string, unknown>);

  const created = await supabase.from(TABLE).insert({ user_id: userId }).select('*').single();
  if (created.error) throw new Error(toSchemaError(created.error.message));
  return toPet(created.data as Record<string, unknown>);
}

export async function savePet(userId: string, patch: PetPatch): Promise<PetProgress> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error && isMissingSchema(error.message)) {
    const saved = previewSet('pets', userId, patch);
    return toPet({ ...STARTER, ...saved, user_id: userId });
  }
  if (error) throw new Error(toSchemaError(error.message));
  return toPet(data as Record<string, unknown>);
}

export async function deletePet(userId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId);
  if (error && !error.message.toLowerCase().includes('could not find the table')) {
    throw new Error(error.message);
  }
}
