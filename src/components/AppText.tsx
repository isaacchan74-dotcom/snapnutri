import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme';
import type { TypographyVariant } from '../theme';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'accent'
  | 'danger'
  | 'success'
  | 'onPrimary'
  | 'onAccent';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  /** Overrides the weight baked into the variant. */
  weight?: keyof ReturnType<typeof useTheme>['fontWeight'];
};

export function AppText({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const colorMap: Record<TextColor, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    brand: theme.colors.primary,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
    onPrimary: theme.colors.textOnPrimary,
    onAccent: theme.colors.textOnAccent,
  };

  return (
    <Text
      {...rest}
      style={[
        theme.typography[variant],
        { color: colorMap[color] },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: theme.fontWeight[weight] } : null,
        style,
      ]}
    />
  );
}
