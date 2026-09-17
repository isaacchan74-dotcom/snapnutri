import React from 'react';

import { OptionTile } from '../../components';
import { GOAL_OPTIONS } from '../../constants/profileOptions';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function GoalScreen({ navigation }: OnboardingScreenProps<'Goal'>) {
  const goal = useOnboardingStore((state) => state.goal);
  const update = useOnboardingStore((state) => state.update);

  return (
    <OnboardingStep
      step={6}
      title="What are you going for?"
      subtitle="Last one. This decides whether we go under, on, or over your burn."
      onContinue={() => navigation.navigate('Summary')}
      continueDisabled={goal == null}
      continueLabel="See my targets"
    >
      {GOAL_OPTIONS.map((option) => (
        <OptionTile
          key={option.value}
          label={option.label}
          description={option.description}
          emoji={option.emoji}
          selected={goal === option.value}
          onPress={() => update({ goal: option.value })}
        />
      ))}
    </OnboardingStep>
  );
}
