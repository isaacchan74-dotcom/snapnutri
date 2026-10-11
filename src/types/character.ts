export const CHARACTER_TYPES = ['pika', 'redpanda', 'axolotl'] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const BACKGROUND_OPTIONS = ['blossom', 'meadow', 'bluebell'] as const;
export type BackgroundOption = (typeof BACKGROUND_OPTIONS)[number];

export const PET_STATUSES = ['healthy', 'fed', 'hungry', 'sick'] as const;
export type PetStatus = (typeof PET_STATUSES)[number];

export type CharacterRow = {
  user_id: string;
  character_type: CharacterType;
  equipped_background: BackgroundOption;
  created_at: string;
  updated_at: string;
};

export type CharacterInput = {
  character_type: CharacterType;
  equipped_background: BackgroundOption;
};

export function isCharacterType(value: unknown): value is CharacterType {
  return typeof value === 'string' && (CHARACTER_TYPES as readonly string[]).includes(value);
}

export function isBackgroundOption(value: unknown): value is BackgroundOption {
  return typeof value === 'string' && (BACKGROUND_OPTIONS as readonly string[]).includes(value);
}

export function isCharacterComplete(character: CharacterRow | null): boolean {
  return character != null && isCharacterType(character.character_type);
}
