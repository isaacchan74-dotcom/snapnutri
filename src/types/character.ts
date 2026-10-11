export const CHARACTER_TYPES = ['sprout', 'spark', 'nibble'] as const;
export type CharacterType = (typeof CHARACTER_TYPES)[number];

export const HAT_OPTIONS = ['none', 'beanie', 'crown', 'visor'] as const;
export type HatOption = (typeof HAT_OPTIONS)[number];

export const OUTFIT_OPTIONS = ['none', 'hoodie', 'cape', 'jersey'] as const;
export type OutfitOption = (typeof OUTFIT_OPTIONS)[number];

export const BACKGROUND_OPTIONS = ['studio', 'stage', 'garden'] as const;
export type BackgroundOption = (typeof BACKGROUND_OPTIONS)[number];

export type CharacterRow = {
  user_id: string;
  character_type: CharacterType;
  equipped_hat: HatOption;
  equipped_outfit: OutfitOption;
  equipped_background: BackgroundOption;
  created_at: string;
  updated_at: string;
};

export type CharacterInput = {
  character_type: CharacterType;
  equipped_hat: HatOption;
  equipped_outfit: OutfitOption;
  equipped_background: BackgroundOption;
};

export function isCharacterType(value: unknown): value is CharacterType {
  return typeof value === 'string' && (CHARACTER_TYPES as readonly string[]).includes(value);
}

export function isCharacterComplete(character: CharacterRow | null): boolean {
  return character != null && isCharacterType(character.character_type);
}
