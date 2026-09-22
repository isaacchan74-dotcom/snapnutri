import { useNavigate } from 'react-router-dom';

import { AppText, OptionTile } from '../../components';
import { GENDER_OPTIONS } from '../../constants/profileOptions';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function GenderScreen() {
  const navigate = useNavigate();
  const gender = useOnboardingStore((state) => state.gender);
  const update = useOnboardingStore((state) => state.update);

  return (
    <OnboardingStep
      step={1}
      title="First up — biological sex"
      subtitle="The calorie formula needs this one. It's the only place we use it."
      onContinue={() => navigate('/onboarding/age')}
      continueDisabled={gender == null}
    >
      {GENDER_OPTIONS.map((option) => (
        <OptionTile
          key={option.value}
          label={option.label}
          emoji={option.emoji}
          selected={gender === option.value}
          onSelect={() => update({ gender: option.value })}
        />
      ))}
      <AppText variant="caption" color="muted">
        Mifflin-St Jeor, the equation behind your targets, uses a different constant for each.
      </AppText>
    </OnboardingStep>
  );
}
