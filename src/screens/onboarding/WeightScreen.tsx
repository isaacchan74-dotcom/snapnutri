import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText, SegmentedControl, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import { kgToLb, lbToKg, type WeightUnit } from '../../lib/units';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

const UNIT_SEGMENTS = [
  { value: 'lb' as WeightUnit, label: 'lb' },
  { value: 'kg' as WeightUnit, label: 'kg' },
];

export function WeightScreen() {
  const navigate = useNavigate();
  const storedWeight = useOnboardingStore((state) => state.weight);
  const unit = useOnboardingStore((state) => state.weightUnit);
  const setUnit = useOnboardingStore((state) => state.setWeightUnit);
  const update = useOnboardingStore((state) => state.update);

  const initialValue = storedWeight
    ? String(Math.round(unit === 'kg' ? storedWeight : kgToLb(storedWeight)))
    : '';
  const [value, setValue] = useState(initialValue);

  const parsed = Number.parseFloat(value);
  const weightKg = unit === 'kg' ? parsed : lbToKg(parsed);
  const inRange =
    Number.isFinite(weightKg) &&
    weightKg >= INPUT_LIMITS.weightKg.min &&
    weightKg <= INPUT_LIMITS.weightKg.max;

  const handleUnitChange = (nextUnit: WeightUnit) => {
    if (Number.isFinite(parsed)) {
      const converted = nextUnit === 'kg' ? lbToKg(parsed) : kgToLb(parsed);
      setValue(String(Math.round(converted)));
    }
    setUnit(nextUnit);
  };

  return (
    <OnboardingStep
      step={4}
      title="And your weight?"
      subtitle="This sets your protein target too, so give it your best guess."
      onContinue={() => {
        update({ weight: Math.round(weightKg * 10) / 10 });
        navigate('/onboarding/activity');
      }}
      continueDisabled={!inRange}
      footerNote="You can update this any time from your profile."
    >
      <SegmentedControl segments={UNIT_SEGMENTS} value={unit} onChange={handleUnitChange} size="sm" />
      <TextField
        label="Weight"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={unit === 'kg' ? '70' : '155'}
        inputMode="decimal"
        maxLength={5}
        trailing={
          <AppText as="span" variant="caption" color="muted">
            {unit}
          </AppText>
        }
        error={value.length > 0 && !inRange ? 'Hmm, that number looks out of range.' : null}
      />
    </OnboardingStep>
  );
}
