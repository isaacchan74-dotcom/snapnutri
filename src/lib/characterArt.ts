import type { BackgroundOption, CharacterType, PetStatus } from '../types/character';

export function characterArtSrc(animalType: CharacterType, status: PetStatus): string {
  return `/buddy/${animalType}-${status}.png`;
}

export function backdropArtSrc(background: BackgroundOption): string {
  return `/buddy/bg-${background}.png`;
}
