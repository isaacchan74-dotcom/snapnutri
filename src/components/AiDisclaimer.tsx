import { AppText } from './AppText';

type AiDisclaimerProps = {
  message?: string;
};

const DEFAULT_MESSAGE =
  'AI estimates for calories, protein, carbs, and fat can be off. Review and edit them before you save.';

/** A small, quiet note for anywhere the AI shows estimated nutrition numbers. */
export function AiDisclaimer({ message = DEFAULT_MESSAGE }: AiDisclaimerProps) {
  return (
    <div className="ai-note" role="note">
      <span className="ai-note__badge" aria-hidden>
        AI
      </span>
      <AppText as="span" variant="caption" color="secondary">
        {message}
      </AppText>
    </div>
  );
}
