import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

export type Segment<T extends string> = {
  value: T;
  label: string;
  emoji?: string;
};

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
};

/** Compact multi-choice control — used for unit toggles and the theme switcher. */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const verticalPadding = size === 'sm' ? theme.spacing.sm : theme.spacing.md;

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: theme.spacing.xxs,
        gap: theme.spacing.xxs,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceMuted,
        borderWidth: theme.borderWidth.hairline,
        borderColor: theme.colors.border,
      }}
    >
      {segments.map((segment) => {
        const selected = segment.value === value;

        return (
          <Pressable
            key={segment.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(segment.value)}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.xs,
              paddingVertical: verticalPadding,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              backgroundColor: selected ? theme.colors.primary : 'transparent',
              opacity: pressed && !selected ? theme.opacity.pressed : theme.opacity.full,
            })}
          >
            {segment.emoji ? (
              <AppText variant="caption" color={selected ? 'onPrimary' : 'secondary'}>
                {segment.emoji}
              </AppText>
            ) : null}
            <AppText
              variant={size === 'sm' ? 'caption' : 'bodyStrong'}
              color={selected ? 'onPrimary' : 'secondary'}
              numberOfLines={1}
            >
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
