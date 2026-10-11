import type { BackgroundOption, CharacterType } from '../types/character';

export const CREATURES: {
  value: CharacterType;
  label: string;
  blurb: string;
}[] = [
  { value: 'pika', label: 'Pika', blurb: 'Small, snack-motivated, and unreasonably charming.' },
  { value: 'redpanda', label: 'Red Panda', blurb: 'Here for the leaf, the nap, and the encore.' },
  { value: 'axolotl', label: 'Axolotl', blurb: 'Perpetually smiling. Secretly tracking your protein.' },
];

export const BACKGROUNDS: { value: BackgroundOption; label: string }[] = [
  { value: 'blossom', label: 'Blossom' },
  { value: 'meadow', label: 'Meadow' },
  { value: 'bluebell', label: 'Bluebell' },
];
