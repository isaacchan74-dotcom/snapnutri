import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type BannerProps = {
  tone?: 'danger' | 'info' | 'success';
  message: string;
};

/** Inline feedback strip for form errors and confirmations. */
export function Banner({ tone = 'danger', message }: BannerProps) {
  const theme = useTheme();

  const toneMap = {
    danger: { background: theme.colors.dangerSoft, border: theme.colors.danger, emoji: '⚠️' },
    info: { background: theme.colors.primarySoft, border: theme.colors.primary, emoji: 'ℹ️' },
    success: { background: theme.colors.primarySoft, border: theme.colors.success, emoji: '🎉' },
  } as const;

  const skin = toneMap[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: theme.borderWidth.hairline,
        borderColor: skin.border,
        backgroundColor: skin.background,
      }}
    >
      <AppText variant="body">{skin.emoji}</AppText>
      <AppText variant="caption" style={{ flex: 1 }}>
        {message}
      </AppText>
    </View>
  );
}
