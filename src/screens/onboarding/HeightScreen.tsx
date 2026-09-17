import React, { useState } from 'react';
import { View } from 'react-native';

import { AppText, SegmentedControl, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import { cmToFeetInches, feetInchesToCm, type HeightUnit } from '../../lib/units';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../theme';
import { OnboardingStep } from './OnboardingStep';

const UNIT_SEGMENTS = [
  { value: 'ftin' as HeightUnit, label: 'ft / in' },
  { value: 'cm' as HeightUnit, label: 'cm' },
];

export function HeightScreen({ navigation }: OnboardingScreenProps<'Height'>) {
  const theme = useTheme();
  const storedHeight = useOnboardingStore((state) => state.height);
  const unit = useOnboardingStore((state) => state.heightUnit);
  const setUnit = useOnboardingStore((state) => state.setHeightUnit);
  const update = useOnboardingStore((state) => state.update);

  const initialImperial = storedHeight ? cmToFeetInches(storedHeight) : null;
  const [cm, setCm] = useState(storedHeight ? String(Math.round(storedHeight)) : '');
  const [feet, setFeet] = useState(initialImperial ? String(initialImperial.feet) : '');
  const [inches, setInches] = useState(initialImperial ? String(initialImperial.inches) : '');

  const heightCm =
    unit === 'cm'
      ? Number.parseFloat(cm)
      : feetInchesToCm(Number.parseInt(feet, 10) || 0, Number.parseInt(inches, 10) || 0);

  const hasInput = unit === 'cm' ? cm.length > 0 : feet.length > 0;
  const inRange =
    Number.isFinite(heightCm) &&
    heightCm >= INPUT_LIMITS.heightCm.min &&
    heightCm <= INPUT_LIMITS.heightCm.max;
  const showError = hasInput && !inRange;

  const handleContinue = () => {
    update({ height: Math.round(heightCm) });
    navigation.navigate('Weight');
  };

  return (
    <OnboardingStep
      step={3}
      title="How tall are you?"
      subtitle="Rough is fine — nobody's measuring against a door frame."
      onContinue={handleContinue}
      continueDisabled={!inRange}
    >
      <SegmentedControl segments={UNIT_SEGMENTS} value={unit} onChange={setUnit} size="sm" />

      {unit === 'cm' ? (
        <TextField
          label="Height"
          value={cm}
          onChangeText={setCm}
          placeholder="175"
          keyboardType="number-pad"
          maxLength={3}
          trailing={
            <AppText variant="caption" color="muted">
              cm
            </AppText>
          }
        />
      ) : (
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Feet"
              value={feet}
              onChangeText={setFeet}
              placeholder="5"
              keyboardType="number-pad"
              maxLength={1}
              trailing={
                <AppText variant="caption" color="muted">
                  ft
                </AppText>
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Inches"
              value={inches}
              onChangeText={setInches}
              placeholder="9"
              keyboardType="number-pad"
              maxLength={2}
              trailing={
                <AppText variant="caption" color="muted">
                  in
                </AppText>
              }
            />
          </View>
        </View>
      )}

      {showError ? (
        <AppText variant="caption" color="danger">
          That looks off — try something between {INPUT_LIMITS.heightCm.min} and{' '}
          {INPUT_LIMITS.heightCm.max} cm.
        </AppText>
      ) : null}
    </OnboardingStep>
  );
}
