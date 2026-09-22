import { AppText } from './AppText';

type BannerProps = {
  tone?: 'danger' | 'info' | 'success';
  message: string;
};

export function Banner({ tone = 'danger', message }: BannerProps) {
  const emoji = tone === 'success' ? '🎉' : tone === 'info' ? 'ℹ️' : '⚠️';

  return (
    <div className={tone === 'danger' ? 'banner' : `banner banner--${tone}`} role="status">
      <AppText as="span" variant="body">
        {emoji}
      </AppText>
      <AppText as="span" variant="caption">
        {message}
      </AppText>
    </div>
  );
}
