import type { BackgroundOption, CharacterType, PetStatus } from '../types/character';

const ART_REV = '2';

export function characterArtSrc(animalType: CharacterType, status: PetStatus): string {
  return `/buddy/${animalType}-${status}.png?v=${ART_REV}`;
}

export function backdropArtSrc(background: BackgroundOption): string {
  return `/buddy/bg-${background}.png?v=${ART_REV}`;
}
