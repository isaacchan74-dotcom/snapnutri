import type { BackgroundOption, CharacterType, HatOption, OutfitOption } from '../types/character';

type CharacterSpriteProps = {
  type: CharacterType;
  hat?: HatOption;
  outfit?: OutfitOption;
  background?: BackgroundOption;
  compact?: boolean;
};

const BODY_VAR: Record<CharacterType, string> = {
  sprout: 'var(--color-accent)',
  spark: 'var(--color-primary)',
  nibble: 'var(--color-fat)',
};

export function CharacterSprite({
  type,
  hat = 'none',
  outfit = 'none',
  background = 'studio',
  compact = false,
}: CharacterSpriteProps) {
  const body = BODY_VAR[type];

  return (
    <div
      className={`character-stage character-stage--${background}${compact ? ' character-stage--compact' : ''}`}
      aria-hidden
    >
      <svg className="character-sprite" viewBox="0 0 160 200" fill="none">
        {outfit === 'cape' ? (
          <path d="M46 92 C18 118 22 168 48 176 C70 150 90 150 112 176 C138 168 142 118 114 92 Z" fill="var(--color-accent)" />
        ) : null}

        <ellipse cx="80" cy="118" rx="48" ry="52" fill={body} />
        {type === 'sprout' ? (
          <path d="M80 68 C78 42 96 30 112 38 C98 46 90 56 86 70 Z" fill="var(--color-success)" />
        ) : null}
        {type === 'spark' ? (
          <path d="M92 36 L78 72 H96 L74 112 L88 78 H70 Z" fill="var(--color-fat)" />
        ) : null}
        {type === 'nibble' ? (
          <path d="M118 108 A18 18 0 0 1 98 132 L118 128 Z" fill="var(--color-surface)" />
        ) : null}

        {outfit === 'hoodie' ? (
          <path d="M42 108 C48 92 112 92 118 108 V148 C110 160 50 160 42 148 Z" fill="var(--color-surface-raised)" />
        ) : null}
        {outfit === 'jersey' ? (
          <>
            <path d="M44 112 H116 V150 C108 160 52 160 44 150 Z" fill="var(--color-primary)" />
            <rect x="72" y="118" width="16" height="28" rx="3" fill="var(--color-ink)" />
          </>
        ) : null}

        <circle cx="64" cy="112" r="7" fill="var(--color-ink)" />
        <circle cx="96" cy="112" r="7" fill="var(--color-ink)" />
        <circle cx="66" cy="110" r="2.2" fill="var(--color-text-primary)" />
        <circle cx="98" cy="110" r="2.2" fill="var(--color-text-primary)" />
        <path d="M70 132 C80 140 90 140 100 132" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />

        {hat === 'beanie' ? (
          <path d="M46 78 C50 52 110 52 114 78 Z" fill="var(--color-primary)" />
        ) : null}
        {hat === 'crown' ? (
          <path d="M48 78 L60 56 L80 70 L100 56 L112 78 Z" fill="var(--color-fat)" />
        ) : null}
        {hat === 'visor' ? (
          <path d="M44 80 H116 V88 H44 Z M116 80 C130 82 132 90 116 90" fill="var(--color-accent)" />
        ) : null}
      </svg>
    </div>
  );
}
