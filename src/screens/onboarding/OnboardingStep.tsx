import React, { type ReactNode } from 'react';
import { View } from 'react-native';

import { AppText, Button, ProgressBar, ScreenContainer } from '../../components';
import { useTheme } from '../../theme';

/** Number of questions between the welcome and summary screens. */
export const ONBOARDING_STEP_COUNT = 6;

type OnboardingStepProps = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  continueLoading?: boolean;
  footerNote?: string;
};

/** Shared chrome for every onboarding question: progress, copy, one control, one button. */
export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  continueLoading = false,
  footerNote,
}: OnboardingStepProps) {
  const theme = useTheme();

  return (
    <ScreenContainer
      eyebrow={`Step ${step} of ${ONBOARDING_STEP_COUNT}`}
      title={title}
      subtitle={subtitle}
      headerRight={
        <View style={{ width: theme.layout.avatarSize, paddingTop: theme.spacing.sm }}>
          <ProgressBar progress={step / ONBOARDING_STEP_COUNT} />
        </View>
      }
      footer={
        <>
          {footerNote ? (
            <AppText variant="caption" color="muted" align="center">
              {footerNote}
            </AppText>
          ) : null}
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={continueDisabled}
            loading={continueLoading}
          />
        </>
      }
    >
      <View style={{ gap: theme.spacing.md }}>{children}</View>
    </ScreenContainer>
  );
}
