import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText, SegmentedControl, TextField } from '../../components';
import { INPUT_LIMITS } from '../../constants/profileOptions';
import { cmToFeetInches, feetInchesToCm, type HeightUnit } from '../../lib/units';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingStep } from './OnboardingStep';

const UNIT_SEGMENTS = [
  { value: 'ftin' as HeightUnit, label: 'ft / in' },
  { value: 'cm' as HeightUnit, label: 'cm' },
];

export function HeightScreen() {
  const navigate = useNavigate();
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

  return (
    <OnboardingStep
      step={3}
      title="How tall are you?"
      subtitle="Rough is fine — nobody's measuring against a door frame."
      onContinue={() => {
        update({ height: Math.round(heightCm) });
        navigate('/onboarding/weight');
      }}
      continueDisabled={!inRange}
    >
      <SegmentedControl segments={UNIT_SEGMENTS} value={unit} onChange={setUnit} size="sm" />

      {unit === 'cm' ? (
        <TextField
          label="Height"
          value={cm}
          onChange={(event) => setCm(event.target.value)}
          placeholder="175"
          inputMode="numeric"
          maxLength={3}
          trailing={
            <AppText as="span" variant="caption" color="muted">
              cm
            </AppText>
          }
        />
      ) : (
        <div className="row row--grow">
          <TextField
            label="Feet"
            value={feet}
            onChange={(event) => setFeet(event.target.value)}
            placeholder="5"
            inputMode="numeric"
            maxLength={1}
            trailing={
              <AppText as="span" variant="caption" color="muted">
                ft
              </AppText>
            }
          />
          <TextField
            label="Inches"
            value={inches}
            onChange={(event) => setInches(event.target.value)}
            placeholder="9"
            inputMode="numeric"
            maxLength={2}
            trailing={
              <AppText as="span" variant="caption" color="muted">
                in
              </AppText>
            }
          />
        </div>
      )}

      {hasInput && !inRange ? (
        <AppText variant="caption" color="danger">
          That looks off — try something between {INPUT_LIMITS.heightCm.min} and{' '}
          {INPUT_LIMITS.heightCm.max} cm.
        </AppText>
      ) : null}
    </OnboardingStep>
  );
}
