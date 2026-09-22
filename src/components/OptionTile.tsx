import { AppText } from './AppText';

type OptionTileProps = {
  label: string;
  description?: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
};

export function OptionTile({ label, description, emoji, selected, onSelect }: OptionTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={selected ? 'option-tile option-tile--selected' : 'option-tile'}
      onClick={onSelect}
    >
      {emoji ? (
        <AppText as="span" variant="heading">
          {emoji}
        </AppText>
      ) : null}

      <span className="option-tile__copy">
        <AppText as="span" variant="bodyStrong">
          {label}
        </AppText>
        {description ? (
          <AppText as="span" variant="caption" color="secondary">
            {description}
          </AppText>
        ) : null}
      </span>

      <span className="option-tile__radio" aria-hidden>
        {selected ? (
          <AppText as="span" variant="caption" color="onPrimary">
            ✓
          </AppText>
        ) : null}
      </span>
    </button>
  );
}
