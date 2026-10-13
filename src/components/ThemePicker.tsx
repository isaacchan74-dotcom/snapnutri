import { useThemeControls } from '../theme';
import { AppText } from './AppText';

export function ThemePicker() {
  const { mode, availableModes, setMode, reshuffle, previewFor, labels } = useThemeControls();

  return (
    <div className="theme-list" role="radiogroup" aria-label="Color theme">
      {availableModes.map((themeMode) => {
        const selected = themeMode === mode;
        const preview = previewFor(themeMode);
        const isShuffle = themeMode === 'shuffle';

        return (
          <div
            key={themeMode}
            className={selected ? 'theme-option theme-option--selected' : 'theme-option'}
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              className="theme-option__pick"
              onClick={() => (isShuffle && selected ? reshuffle() : setMode(themeMode))}
            >
              <span className="theme-option__swatches" aria-hidden>
                <span className="theme-option__dot" style={{ background: preview.background }} />
                <span className="theme-option__dot" style={{ background: preview.primary }} />
                <span className="theme-option__dot" style={{ background: preview.accent }} />
              </span>
              <span className="theme-option__copy">
                <AppText as="span" variant="bodyStrong">
                  {labels[themeMode].emoji} {labels[themeMode].label}
                </AppText>
              </span>
            </button>
            {isShuffle ? (
              <button
                type="button"
                className="theme-option__shuffle"
                aria-label="Shuffle a new palette"
                onClick={() => reshuffle()}
              >
                <ShuffleIcon />
              </button>
            ) : (
              <span className="theme-option__check" aria-hidden>
                {selected ? '✓' : ''}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ShuffleIcon() {
  return (
    <svg className="theme-option__shuffle-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h3.2c.6 0 1.1.3 1.5.8L12 12"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17h3.2c.6 0 1.1-.3 1.5-.8L14 8.2c.4-.5.9-.8 1.5-.8H20"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m17 4 3 3-3 3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14 15.8 15.5 17.2c.4.5.9.8 1.5.8H20"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m17 14 3 3-3 3" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
