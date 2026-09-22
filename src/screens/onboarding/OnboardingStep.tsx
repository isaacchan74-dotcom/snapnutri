import type { ReactNode } from 'react';

import { AppText, Button, ProgressBar, ScreenContainer } from '../../components';

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
  return (
    <ScreenContainer
      eyebrow={`Step ${step} of ${ONBOARDING_STEP_COUNT}`}
      title={title}
      subtitle={subtitle}
      headerRight={<ProgressBar progress={step / ONBOARDING_STEP_COUNT} />}
      footer={
        <>
          {footerNote ? (
            <AppText variant="caption" color="muted" align="center">
              {footerNote}
            </AppText>
          ) : null}
          <Button
            label={continueLabel}
            onClick={onContinue}
            disabled={continueDisabled}
            loading={continueLoading}
          />
        </>
      }
    >
      <div className="stack stack--md">{children}</div>
    </ScreenContainer>
  );
}
