import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';

type ProgressBarProps = {
  /** 0 to 1. */
  progress: number;
  tone?: 'brand' | 'accent';
};

export function ProgressBar({ progress, tone = 'brand' }: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{
        height: theme.layout.progressBarHeight,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surfaceMuted,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: theme.radius.pill,
          backgroundColor: tone === 'brand' ? theme.colors.primary : theme.colors.accent,
        }}
      />
    </View>
  );
}
