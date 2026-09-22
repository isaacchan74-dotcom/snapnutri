import { EmptyState, ScreenContainer } from '../../components';

export function DashboardScreen() {
  return (
    <ScreenContainer title="Dashboard" subtitle="Progress, streaks, and how the week is going.">
      <EmptyState
        emoji="📊"
        title="Charts are on the way"
        message="Once meals are logging, this is where your calories and macros get graphed."
        badge="Coming soon"
      />
    </ScreenContainer>
  );
}
