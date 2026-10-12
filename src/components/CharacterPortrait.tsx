import { DioramaParticles } from './DioramaParticles';
import { backdropArtSrc, characterArtSrc } from '../lib/characterArt';
import type { BackgroundOption, CharacterType, PetStatus } from '../types/character';

type CharacterPortraitProps = {
  animalType: CharacterType;
  status: PetStatus;
  background?: BackgroundOption;
  compact?: boolean;
};

export function CharacterPortrait({
  animalType,
  status,
  background,
  compact = false,
}: CharacterPortraitProps) {
  const classes = [
    'diorama',
    compact ? 'diorama--compact' : '',
    background ? '' : 'diorama--preview',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {background ? (
        <img
          className="diorama__art diorama__backdrop"
          src={backdropArtSrc(background)}
          alt=""
          draggable={false}
        />
      ) : null}
      {background && !compact ? <DioramaParticles scene={background} /> : null}
      <img
        className="diorama__art diorama__pet"
        src={characterArtSrc(animalType, status)}
        alt=""
        draggable={false}
      />
    </div>
  );
}
