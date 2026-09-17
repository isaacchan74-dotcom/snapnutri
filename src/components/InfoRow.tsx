import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type InfoRowProps = {
  label: string;
  value: string;
  /** Hides the divider on the last row of a list. */
  last?: boolean;
};

/** Label-on-the-left / value-on-the-right row used by the Profile details card. */
export function InfoRow({ label, value, last = false }: InfoRowProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: last ? theme.borderWidth.none : theme.borderWidth.hairline,
        borderBottomColor: theme.colors.border,
      }}
    >
      <AppText variant="body" color="secondary">
        {label}
      </AppText>
      <AppText variant="bodyStrong" style={{ flexShrink: 1 }} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}
