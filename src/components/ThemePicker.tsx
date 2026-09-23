import { palettes, useThemeControls } from '../theme';
import { AppText } from './AppText';

export function ThemePicker() {
  const { mode, availableModes, setMode, labels } = useThemeControls();

  return (
    <div className="theme-list" role="radiogroup" aria-label="Color theme">
      {availableModes.map((themeMode) => {
        const selected = themeMode === mode;
        const preview = palettes[themeMode];

        return (
          <button
            key={themeMode}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'theme-option theme-option--selected' : 'theme-option'}
            onClick={() => setMode(themeMode)}
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
            <span className="theme-option__check" aria-hidden>
              {selected ? '✓' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
