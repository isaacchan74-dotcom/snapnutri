import { useLocation } from 'react-router-dom';

import { AppText, EmptyState, ScreenContainer } from '../../components';

export function CoachScreen() {
  const photo = (useLocation().state as { photo?: string } | null)?.photo;

  return (
    <ScreenContainer
      eyebrow="AI Coach"
      title="In the huddle"
      subtitle="Photo-to-coach is next. Your plate can already ride over from Snap."
    >
      <div className="stack">
        {photo ? (
          <div className="stack stack--md">
            <img className="snap-frame" src={photo} alt="Meal sent to coach" />
            <AppText variant="caption" color="secondary" align="center">
              Got the snap. Coaching notes land here soon.
            </AppText>
          </div>
        ) : (
          <EmptyState
            emoji="🧠"
            title="Coming soon"
            badge="AI Coach"
            message="Ask about a meal, a day, or a vibe. For now, send a plate from Snap and we’ll hold it here."
          />
        )}
      </div>
    </ScreenContainer>
  );
}
