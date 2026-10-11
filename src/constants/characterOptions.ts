import type { BackgroundOption, CharacterType, HatOption, OutfitOption } from '../types/character';

export const CREATURES: {
  value: CharacterType;
  label: string;
  blurb: string;
}[] = [
  { value: 'sprout', label: 'Sprout', blurb: 'Plant-powered. Judges your fiber, kindly.' },
  { value: 'spark', label: 'Spark', blurb: 'A snack-sized lightning bolt with opinions.' },
  { value: 'nibble', label: 'Nibble', blurb: 'Here for the crumbs and the encore.' },
];

export const HATS: { value: HatOption; label: string }[] = [
  { value: 'none', label: 'No hat' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'crown', label: 'Crown' },
  { value: 'visor', label: 'Visor' },
];

export const OUTFITS: { value: OutfitOption; label: string }[] = [
  { value: 'none', label: 'Classic' },
  { value: 'hoodie', label: 'Hoodie' },
  { value: 'cape', label: 'Cape' },
  { value: 'jersey', label: 'Jersey' },
];

export const BACKGROUNDS: { value: BackgroundOption; label: string }[] = [
  { value: 'studio', label: 'Studio' },
  { value: 'stage', label: 'Stage' },
  { value: 'garden', label: 'Garden' },
];
