import React from 'react';

import { AppText, OptionTile } from '../../components';
import { GENDER_OPTIONS } from '../../constants/profileOptions';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function GenderScreen({ navigation }: OnboardingScreenProps<'Gender'>) {
  const gender = useOnboardingStore((state) => state.gender);
  const update = useOnboardingStore((state) => state.update);

  return (
    <OnboardingStep
      step={1}
      title="First up — biological sex"
      subtitle="The calorie formula needs this one. It's the only place we use it."
      onContinue={() => navigation.navigate('Age')}
      continueDisabled={gender == null}
    >
      {GENDER_OPTIONS.map((option) => (
        <OptionTile
          key={option.value}
          label={option.label}
          emoji={option.emoji}
          selected={gender === option.value}
          onPress={() => update({ gender: option.value })}
        />
      ))}

      <AppText variant="caption" color="muted">
        Mifflin-St Jeor, the equation behind your targets, uses a different constant for each.
      </AppText>
    </OnboardingStep>
  );
}
