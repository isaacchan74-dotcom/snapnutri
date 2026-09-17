import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { AppText } from './AppText';

type ScreenContainerProps = {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Small all-caps line above the title, e.g. "STEP 2 OF 6". */
  eyebrow?: string;
  /** Wraps content in a ScrollView. Turn off for full-bleed screens like Camera. */
  scroll?: boolean;
  /** Applies the standard screen gutters. */
  padded?: boolean;
  /** Vertically centres content — handy for single-question onboarding steps. */
  center?: boolean;
  /** Pinned to the bottom, outside the scroll area. */
  footer?: ReactNode;
  headerRight?: ReactNode;
  edges?: readonly Edge[];
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({
  children,
  title,
  subtitle,
  eyebrow,
  scroll = true,
  padded = true,
  center = false,
  footer,
  headerRight,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: ScreenContainerProps) {
  const theme = useTheme();

  const gutters: ViewStyle = padded
    ? {
        paddingHorizontal: theme.layout.screenPaddingHorizontal,
        paddingTop: theme.layout.screenPaddingVertical,
      }
    : {};

  const header =
    title || subtitle || eyebrow || headerRight ? (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          {eyebrow ? (
            <AppText variant="label" color="brand">
              {eyebrow.toUpperCase()}
            </AppText>
          ) : null}
          {title ? <AppText variant="title">{title}</AppText> : null}
          {subtitle ? (
            <AppText variant="body" color="secondary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {headerRight}
      </View>
    ) : null;

  const body = (
    <View style={[{ flex: 1, justifyContent: center ? 'center' : 'flex-start' }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={edges}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              gutters,
              {
                flexGrow: 1,
                paddingBottom: theme.spacing.xxl,
                maxWidth: theme.layout.maxContentWidth,
                width: '100%',
                alignSelf: 'center',
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {header}
            {body}
          </ScrollView>
        ) : (
          <View
            style={[
              gutters,
              {
                flex: 1,
                maxWidth: theme.layout.maxContentWidth,
                width: '100%',
                alignSelf: 'center',
              },
            ]}
          >
            {header}
            {body}
          </View>
        )}

        {footer ? (
          <View
            style={{
              paddingHorizontal: theme.layout.screenPaddingHorizontal,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
              gap: theme.spacing.md,
              backgroundColor: theme.colors.background,
              borderTopWidth: theme.borderWidth.hairline,
              borderTopColor: theme.colors.border,
              maxWidth: theme.layout.maxContentWidth,
              width: '100%',
              alignSelf: 'center',
            }}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
