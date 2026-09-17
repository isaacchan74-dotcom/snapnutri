import React, { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type TextFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string | null;
  /** Rendered inside the field on the right, e.g. a "cm" / "kg" unit tag. */
  trailing?: React.ReactNode;
};

export function TextField({
  label,
  helper,
  error,
  trailing,
  onFocus,
  onBlur,
  style,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <AppText variant="label" color="secondary">
          {label.toUpperCase()}
        </AppText>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          height: theme.layout.inputHeight,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          borderWidth: theme.borderWidth.thick,
          borderColor,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <TextInput
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          style={[
            theme.typography.body,
            { flex: 1, color: theme.colors.textPrimary, paddingVertical: theme.spacing.none },
            style,
          ]}
        />
        {trailing}
      </View>

      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color="muted">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}
