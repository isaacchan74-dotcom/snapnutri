import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import { AppText, type TextColor } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  /** Rendered before the label — an emoji or icon element. */
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette: Record<
    ButtonVariant,
    { background: string; pressed: string; border: string; text: TextColor }
  > = {
    primary: {
      background: theme.colors.primary,
      pressed: theme.colors.primaryPressed,
      border: theme.colors.primary,
      text: 'onPrimary',
    },
    secondary: {
      background: theme.colors.surfaceMuted,
      pressed: theme.colors.border,
      border: theme.colors.border,
      text: 'primary',
    },
    ghost: {
      background: 'transparent',
      pressed: theme.colors.surfaceMuted,
      border: 'transparent',
      text: 'secondary',
    },
    danger: {
      background: theme.colors.dangerSoft,
      pressed: theme.colors.danger,
      border: theme.colors.danger,
      text: 'danger',
    },
  };

  const skin = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: theme.layout.buttonHeight[size],
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.lg,
          borderWidth: theme.borderWidth.thick,
          borderColor: skin.border,
          backgroundColor: pressed ? skin.pressed : skin.background,
          opacity: isDisabled ? theme.opacity.disabled : theme.opacity.full,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        variant === 'primary' && !pressed ? theme.shadows.soft : theme.shadows.none,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.colors.textOnPrimary : theme.colors.textSecondary}
        />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <AppText variant="button" color={skin.text} numberOfLines={1}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
