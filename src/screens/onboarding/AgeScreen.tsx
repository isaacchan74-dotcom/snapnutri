import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function AgeScreen() {
  const navigate = useNavigate();
  const storedAge = useOnboardingStore((state) => state.age);
  const update = useOnboardingStore((state) => state.update);
  const [value, setValue] = useState(storedAge ? String(storedAge) : '');

  const parsed = Number.parseInt(value, 10);
  const inRange =
    Number.isFinite(parsed) && parsed >= INPUT_LIMITS.age.min && parsed <= INPUT_LIMITS.age.max;
  const showError = value.length > 0 && !inRange;

  return (
    <OnboardingStep
      step={2}
      title="How old are you?"
      subtitle="Metabolism shifts with age, so this nudges your numbers."
      onContinue={() => {
        update({ age: parsed });
        navigate('/onboarding/height');
      }}
      continueDisabled={!inRange}
    >
      <TextField
        label="Age"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="20"
        inputMode="numeric"
        maxLength={3}
        trailing={
          <AppText as="span" variant="caption" color="muted">
            years
          </AppText>
        }
        error={
          showError ? `Enter an age between ${INPUT_LIMITS.age.min} and ${INPUT_LIMITS.age.max}.` : null
        }
      />
    </OnboardingStep>
  );
}
