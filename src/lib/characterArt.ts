import type { BackgroundOption, CharacterType, PetStatus } from '../types/character';

const ART_REV = '3';

const ANIMAL_FILE: Record<CharacterType, string> = {
  pika: 'pika',
  redpanda: 'red_panda',
  axolotl: 'axolotl',
};

const STATUS_FILE: Record<PetStatus, string> = {
  healthy: 'healthy',
  fed: 'fed',
  hungry: 'hungry',
  sick: 'sleepy',
};

const BACKDROP_FILE: Record<BackgroundOption, string> = {
  blossom: 'background_cherry_blossom',
  meadow: 'background_green_meadow',
  bluebell: 'background_blue_flower_field',
};

export function characterArtSrc(animalType: CharacterType, status: PetStatus): string {
  return `/buddy/${ANIMAL_FILE[animalType]}_${STATUS_FILE[status]}.png?v=${ART_REV}`;
}

export function backdropArtSrc(background: BackgroundOption): string {
  return `/buddy/${BACKDROP_FILE[background]}.png?v=${ART_REV}`;
}
