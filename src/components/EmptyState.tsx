import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type EmptyStateProps = {
  emoji: string;
  title: string;
  message: string;
  /** Short "coming soon" tag shown under the message. */
  badge?: string;
};

/** Placeholder body for the screens that get built in later stages. */
export function EmptyState({ emoji, title, message, badge }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xxl }}>
      <View
        style={{
          width: theme.layout.avatarSize,
          height: theme.layout.avatarSize,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText variant="title">{emoji}</AppText>
      </View>

      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="secondary" align="center">
        {message}
      </AppText>

      {badge ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.accentSoft,
            borderWidth: theme.borderWidth.hairline,
            borderColor: theme.colors.accent,
          }}
        >
          <AppText variant="label" color="accent">
            {badge.toUpperCase()}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
