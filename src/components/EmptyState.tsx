import { AppText } from './AppText';

type EmptyStateProps = {
  emoji: string;
  title: string;
  message: string;
  badge?: string;
};

export function EmptyState({ emoji, title, message, badge }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <AppText as="span" variant="title">
          {emoji}
        </AppText>
      </div>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="secondary" align="center">
        {message}
      </AppText>
      {badge ? (
        <div className="empty__badge">
          <AppText as="span" variant="label" color="accent">
            {badge}
          </AppText>
        </div>
      ) : null}
    </div>
  );
}
