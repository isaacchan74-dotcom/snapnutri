import { useNavigate } from 'react-router-dom';

import { OptionTile } from '../../components';
import { GOAL_OPTIONS } from '../../constants/profileOptions';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

export function GoalScreen() {
  const navigate = useNavigate();
  const goal = useOnboardingStore((state) => state.goal);
  const update = useOnboardingStore((state) => state.update);

  return (
    <OnboardingStep
      step={6}
      title="What are you going for?"
      subtitle="Last one. This decides whether we go under, on, or over your burn."
      onContinue={() => navigate('/onboarding/summary')}
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
          onSelect={() => update({ goal: option.value })}
        />
      ))}
    </OnboardingStep>
  );
}
