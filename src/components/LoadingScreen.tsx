import { AppText } from './AppText';

export function LoadingScreen({ message = 'Warming up…' }: { message?: string }) {
  return (
    <div className="loading">
      <AppText as="span" variant="display">
        🥑
      </AppText>
      <span className="spinner" aria-hidden />
      <AppText variant="caption" color="secondary">
        {message}
      </AppText>
    </div>
  );
}
