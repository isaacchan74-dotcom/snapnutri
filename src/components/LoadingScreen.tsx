import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

/** Shown while the persisted session and theme are being restored. */
export function LoadingScreen({ message = 'Warming up…' }: { message?: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.lg,
        backgroundColor: theme.colors.background,
      }}
    >
      <AppText variant="display">🥑</AppText>
      <ActivityIndicator color={theme.colors.primary} />
      <AppText variant="caption" color="secondary">
        {message}
      </AppText>
    </View>
  );
}
