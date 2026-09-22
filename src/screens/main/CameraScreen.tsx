import { EmptyState, ScreenContainer } from '../../components';

export function CameraScreen() {
  return (
    <ScreenContainer title="Snap a meal" subtitle="Point, shoot, and let the AI do the logging.">
      <EmptyState
        emoji="📸"
        title="Camera lands next"
        message="This is where you'll photograph a meal and get an instant nutrition breakdown."
        badge="Coming soon"
      />
    </ScreenContainer>
  );
}
