import type { MealInsight } from '../types/meal';
import { AppText } from './AppText';
import { Button } from './Button';

type MealInsightCardProps = {
  insight: MealInsight | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function MealInsightCard({ insight, loading = false, error = null, onRetry }: MealInsightCardProps) {
  return (
    <section className="insight-card" aria-live="polite" aria-busy={loading}>
      <div className="insight-card__head">
        <span className="ai-note__badge" aria-hidden>
          AI
        </span>
        <AppText as="h2" variant="label" color="brand">
          Quick take
        </AppText>
      </div>

      {insight ? (
        <>
          <AppText variant="body">{insight.summary}</AppText>
          <ul className="insight-card__tips">
            {insight.suggestions.map((tip) => (
              <li key={tip} className="insight-card__tip">
                <AppText as="span" variant="bodyStrong">
                  {tip}
                </AppText>
              </li>
            ))}
          </ul>
        </>
      ) : loading ? (
        <div className="stack stack--sm">
          <span className="insight-card__skeleton" />
          <span className="insight-card__skeleton insight-card__skeleton--short" />
          <AppText variant="caption" color="muted">
            Reading this meal against your goal…
          </AppText>
        </div>
      ) : error ? (
        <div className="stack stack--sm">
          <AppText variant="caption" color="danger">
            {error}
          </AppText>
          {onRetry ? (
            <Button label="Try again" variant="secondary" size="sm" fullWidth={false} onClick={onRetry} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
