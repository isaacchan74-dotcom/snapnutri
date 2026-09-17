import React from 'react';

import { EmptyState, ScreenContainer } from '../../components';

export function JournalScreen() {
  return (
    <ScreenContainer title="Your journal" subtitle="Every meal you've snapped, in one scroll.">
      <EmptyState
        emoji="📔"
        title="Nothing logged yet"
        message="Your visual food journal will fill up here once the camera is wired in."
        badge="Coming soon"
      />
    </ScreenContainer>
  );
}
