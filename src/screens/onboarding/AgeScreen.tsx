import React, { useState } from 'react';

import { AppText, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function AgeScreen({ navigation }: OnboardingScreenProps<'Age'>) {
  const storedAge = useOnboardingStore((state) => state.age);
  const update = useOnboardingStore((state) => state.update);

  const [value, setValue] = useState(storedAge ? String(storedAge) : '');

  const parsed = Number.parseInt(value, 10);
  const inRange =
    Number.isFinite(parsed) && parsed >= INPUT_LIMITS.age.min && parsed <= INPUT_LIMITS.age.max;
  const showError = value.length > 0 && !inRange;

  const handleContinue = () => {
    update({ age: parsed });
    navigation.navigate('Height');
  };

  return (
    <OnboardingStep
      step={2}
      title="How old are you?"
      subtitle="Metabolism shifts with age, so this nudges your numbers."
      onContinue={handleContinue}
      continueDisabled={!inRange}
    >
      <TextField
        label="Age"
        value={value}
        onChangeText={setValue}
        placeholder="20"
        keyboardType="number-pad"
        maxLength={3}
        trailing={
          <AppText variant="caption" color="muted">
            years
          </AppText>
        }
        error={
          showError
            ? `Enter an age between ${INPUT_LIMITS.age.min} and ${INPUT_LIMITS.age.max}.`
            : null
        }
      />
    </OnboardingStep>
  );
}
