import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type CardTone = 'surface' | 'muted' | 'brand' | 'accent' | 'danger';
export type CardElevation = 'none' | 'soft' | 'card' | 'raised';

type CardProps = ViewProps & {
  tone?: CardTone;
  elevation?: CardElevation;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  tone = 'surface',
  elevation = 'card',
  padding = 'md',
  bordered = true,
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();

  const toneMap: Record<CardTone, { background: string; border: string }> = {
    surface: { background: theme.colors.surface, border: theme.colors.border },
    muted: { background: theme.colors.surfaceMuted, border: theme.colors.border },
    brand: { background: theme.colors.primarySoft, border: theme.colors.primary },
    accent: { background: theme.colors.accentSoft, border: theme.colors.accent },
    danger: { background: theme.colors.dangerSoft, border: theme.colors.danger },
  };

  const paddingMap = {
    none: theme.spacing.none,
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  } as const;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: toneMap[tone].background,
          borderRadius: theme.radius.lg,
          borderWidth: bordered ? theme.borderWidth.hairline : theme.borderWidth.none,
          borderColor: toneMap[tone].border,
          padding: paddingMap[padding],
        },
        theme.shadows[elevation],
        style,
      ]}
    />
  );
}
