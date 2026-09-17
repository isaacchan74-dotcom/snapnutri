import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Card } from './Card';

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  /** Colour of the accent stripe — defaults to the brand colour. */
  accentColor?: string;
};

/** Small labelled number block, used for the daily targets on Profile. */
export function StatTile({ label, value, unit, accentColor }: StatTileProps) {
  const theme = useTheme();

  return (
    <Card padding="sm" elevation="soft" style={{ flex: 1, minWidth: theme.layout.avatarSize }}>
      <View style={{ gap: theme.spacing.xs }}>
        <View
          style={{
            width: theme.spacing.xxl,
            height: theme.borderWidth.chunky,
            borderRadius: theme.radius.pill,
            backgroundColor: accentColor ?? theme.colors.primary,
          }}
        />
        <AppText variant="label" color="muted" numberOfLines={1}>
          {label.toUpperCase()}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xxs }}>
          <AppText variant="heading">{value}</AppText>
          {unit ? (
            <AppText variant="caption" color="secondary">
              {unit}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
