import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type OptionTileProps = {
  label: string;
  description?: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
};

/** Single-select row used throughout onboarding. */
export function OptionTile({ label, description, emoji, selected, onPress }: OptionTileProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.lg,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: theme.borderWidth.thick,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
        },
        selected ? theme.shadows.soft : theme.shadows.none,
      ]}
    >
      {emoji ? <AppText variant="heading">{emoji}</AppText> : null}

      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="caption" color="secondary">
            {description}
          </AppText>
        ) : null}
      </View>

      <View
        style={{
          width: theme.iconSize.md,
          height: theme.iconSize.md,
          borderRadius: theme.radius.pill,
          borderWidth: theme.borderWidth.thick,
          borderColor: selected ? theme.colors.primary : theme.colors.borderStrong,
          backgroundColor: selected ? theme.colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <AppText variant="caption" color="onPrimary" weight="heavy">
            ✓
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
