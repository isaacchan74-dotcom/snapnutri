import React, { useState } from 'react';

import { AppText, SegmentedControl, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import { kgToLb, lbToKg, type WeightUnit } from '../../lib/units';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

const UNIT_SEGMENTS = [
  { value: 'lb' as WeightUnit, label: 'lb' },
  { value: 'kg' as WeightUnit, label: 'kg' },
];

export function WeightScreen({ navigation }: OnboardingScreenProps<'Weight'>) {
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
  const showError = value.length > 0 && !inRange;

  /** Keeps the number meaningful when the unit flips mid-entry. */
  const handleUnitChange = (nextUnit: WeightUnit) => {
    if (Number.isFinite(parsed)) {
      const converted = nextUnit === 'kg' ? lbToKg(parsed) : kgToLb(parsed);
      setValue(String(Math.round(converted)));
    }
    setUnit(nextUnit);
  };

  const handleContinue = () => {
    update({ weight: Math.round(weightKg * 10) / 10 });
    navigation.navigate('Activity');
  };

  return (
    <OnboardingStep
      step={4}
      title="And your weight?"
      subtitle="This sets your protein target too, so give it your best guess."
      onContinue={handleContinue}
      continueDisabled={!inRange}
      footerNote="You can update this any time from your profile."
    >
      <SegmentedControl
        segments={UNIT_SEGMENTS}
        value={unit}
        onChange={handleUnitChange}
        size="sm"
      />

      <TextField
        label="Weight"
        value={value}
        onChangeText={setValue}
        placeholder={unit === 'kg' ? '70' : '155'}
        keyboardType="decimal-pad"
        maxLength={5}
        trailing={
          <AppText variant="caption" color="muted">
            {unit}
          </AppText>
        }
        error={showError ? 'Hmm, that number looks out of range.' : null}
      />
    </OnboardingStep>
  );
}
