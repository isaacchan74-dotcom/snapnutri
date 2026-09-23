import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveProfileFromMeasurements } from '../../api/profiles';
import {
  AppText,
  Banner,
  Button,
  OptionTile,
  ScreenContainer,
  SegmentedControl,
  TextField,
} from '../../components';
import {
  ACTIVITY_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  INPUT_LIMITS,
} from '../../constants/profileOptions';
import { calculateDailyTargets } from '../../lib/nutrition';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg, type HeightUnit, type WeightUnit } from '../../lib/units';
import { useAuthStore } from '../../store/authStore';
import type { ActivityLevel, Gender, Goal, ProfileMeasurements } from '../../types/profile';

const HEIGHT_UNITS = [
  { value: 'ftin' as HeightUnit, label: 'ft / in' },
  { value: 'cm' as HeightUnit, label: 'cm' },
];

const WEIGHT_UNITS = [
  { value: 'lb' as WeightUnit, label: 'lb' },
  { value: 'kg' as WeightUnit, label: 'kg' },
];

export function EditProfileScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);

  const initialImperial = profile?.height ? cmToFeetInches(profile.height) : null;

  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ftin');
  const [cm, setCm] = useState(profile?.height ? String(Math.round(profile.height)) : '');
  const [feet, setFeet] = useState(initialImperial ? String(initialImperial.feet) : '');
  const [inches, setInches] = useState(initialImperial ? String(initialImperial.inches) : '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lb');
  const [weight, setWeight] = useState(
    profile?.weight ? String(Math.round(kgToLb(profile.weight))) : '',
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    profile?.activity_level ?? null,
  );
  const [goal, setGoal] = useState<Goal | null>(profile?.goal ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedAge = Number.parseInt(age, 10);
  const heightCm =
    heightUnit === 'cm'
      ? Number.parseFloat(cm)
      : feetInchesToCm(Number.parseInt(feet, 10) || 0, Number.parseInt(inches, 10) || 0);
  const parsedWeight = Number.parseFloat(weight);
  const weightKg = weightUnit === 'kg' ? parsedWeight : lbToKg(parsedWeight);

  const ageOk =
    Number.isFinite(parsedAge) && parsedAge >= INPUT_LIMITS.age.min && parsedAge <= INPUT_LIMITS.age.max;
  const heightOk =
    Number.isFinite(heightCm) &&
    heightCm >= INPUT_LIMITS.heightCm.min &&
    heightCm <= INPUT_LIMITS.heightCm.max;
  const weightOk =
    Number.isFinite(weightKg) &&
    weightKg >= INPUT_LIMITS.weightKg.min &&
    weightKg <= INPUT_LIMITS.weightKg.max;

  const measurements: ProfileMeasurements | null =
    gender && activityLevel && goal && ageOk && heightOk && weightOk
      ? {
          gender,
          age: parsedAge,
          height: Math.round(heightCm),
          weight: Math.round(weightKg * 10) / 10,
          activityLevel,
          goal,
        }
      : null;

  const preview = useMemo(
    () => (measurements ? calculateDailyTargets(measurements) : null),
    [measurements],
  );

  const handleWeightUnit = (next: WeightUnit) => {
    if (Number.isFinite(parsedWeight)) {
      const converted = next === 'kg' ? lbToKg(parsedWeight) : kgToLb(parsedWeight);
      setWeight(String(Math.round(converted)));
    }
    setWeightUnit(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!measurements || !user) return;

    setError(null);
    setSaving(true);
    try {
      const next = await saveProfileFromMeasurements({
        userId: user.id,
        email: user.email ?? null,
        measurements,
      });
      setProfile(next);
      navigate('/profile');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update your profile.');
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Edit profile"
      title="Update your numbers 📏"
      subtitle="We'll rebuild your daily targets with the same Mifflin-St Jeor math."
      headerRight={
        <Button label="Cancel" variant="ghost" size="sm" fullWidth={false} onClick={() => navigate('/profile')} />
      }
      footer={
        <Button
          label={preview ? `Save · ${preview.calories.toLocaleString()} kcal` : 'Save changes'}
          type="submit"
          form="edit-profile-form"
          loading={saving}
          disabled={!measurements || saving}
        />
      }
    >
      <form id="edit-profile-form" className="stack" onSubmit={handleSubmit}>
        {error ? <Banner message={error} /> : null}

        <div className="stack stack--md">
          <AppText as="h2" variant="label" color="muted">
            Sex
          </AppText>
          {GENDER_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              label={option.label}
              emoji={option.emoji}
              selected={gender === option.value}
              onSelect={() => setGender(option.value)}
            />
          ))}
        </div>

        <TextField
          label="Age"
          value={age}
          onChange={(event) => setAge(event.target.value)}
          placeholder="20"
          inputMode="numeric"
          maxLength={3}
          trailing={
            <AppText as="span" variant="caption" color="muted">
              years
            </AppText>
          }
          error={
            age.length > 0 && !ageOk
              ? `Enter an age between ${INPUT_LIMITS.age.min} and ${INPUT_LIMITS.age.max}.`
              : null
          }
        />

        <div className="stack stack--md">
          <AppText as="h2" variant="label" color="muted">
            Height
          </AppText>
          <SegmentedControl segments={HEIGHT_UNITS} value={heightUnit} onChange={setHeightUnit} size="sm" />
          {heightUnit === 'cm' ? (
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
          {((heightUnit === 'cm' && cm) || (heightUnit === 'ftin' && feet)) && !heightOk ? (
            <AppText variant="caption" color="danger">
              Height should land between {INPUT_LIMITS.heightCm.min} and {INPUT_LIMITS.heightCm.max} cm.
            </AppText>
          ) : null}
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="label" color="muted">
            Weight
          </AppText>
          <SegmentedControl segments={WEIGHT_UNITS} value={weightUnit} onChange={handleWeightUnit} size="sm" />
          <TextField
            label="Weight"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder={weightUnit === 'kg' ? '70' : '155'}
            inputMode="decimal"
            maxLength={5}
            trailing={
              <AppText as="span" variant="caption" color="muted">
                {weightUnit}
              </AppText>
            }
            error={weight.length > 0 && !weightOk ? 'That weight looks out of range.' : null}
          />
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="label" color="muted">
            Activity
          </AppText>
          {ACTIVITY_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              label={option.label}
              description={option.description}
              emoji={option.emoji}
              selected={activityLevel === option.value}
              onSelect={() => setActivityLevel(option.value)}
            />
          ))}
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="label" color="muted">
            Goal
          </AppText>
          {GOAL_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              label={option.label}
              description={option.description}
              emoji={option.emoji}
              selected={goal === option.value}
              onSelect={() => setGoal(option.value)}
            />
          ))}
        </div>
      </form>
    </ScreenContainer>
  );
}
