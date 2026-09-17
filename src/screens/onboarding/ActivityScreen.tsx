import React from 'react';

import { OptionTile } from '../../components';
import { ACTIVITY_OPTIONS } from '../../constants/profileOptions';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function ActivityScreen({ navigation }: OnboardingScreenProps<'Activity'>) {
  const activityLevel = useOnboardingStore((state) => state.activityLevel);
  const update = useOnboardingStore((state) => state.update);

  return (
    <OnboardingStep
      step={5}
      title="How much do you move?"
      subtitle="Be honest — walking to the dining hall counts for less than you'd hope."
      onContinue={() => navigation.navigate('Goal')}
      continueDisabled={activityLevel == null}
    >
      {ACTIVITY_OPTIONS.map((option) => (
        <OptionTile
          key={option.value}
          label={option.label}
          description={option.description}
          emoji={option.emoji}
          selected={activityLevel === option.value}
          onPress={() => update({ activityLevel: option.value })}
        />
      ))}
    </OnboardingStep>
  );
}
