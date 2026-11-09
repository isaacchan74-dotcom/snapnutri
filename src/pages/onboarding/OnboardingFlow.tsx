import { useEffect, useState, type ReactNode } from 'react';

import { saveCharacter } from '../../api/characters';
import { saveProfileFromMeasurements, updateProfilePrefs } from '../../api/profiles';
import { ACTIVITY_OPTIONS, GENDER_OPTIONS, GOAL_OPTIONS, INPUT_LIMITS } from '../../constants/profileOptions';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg, type HeightUnit, type WeightUnit } from '../../lib/units';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
type FieldKey = 'name' | 'gender' | 'age' | 'height' | 'weight' | 'activity' | 'goal';

const FIELD_ORDER: FieldKey[] = ['name', 'gender', 'age', 'height', 'weight', 'activity', 'goal'];

export function OnboardingFlow() {
  return <OnboardingPage />;
}

function OnboardingPage() {
  const user = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);
  const draft = useOnboardingStore();
  const update = draft.update;
  const reset = draft.reset;

  const [name, setName] = useState(draft.name);
  const [age, setAge] = useState(draft.age != null ? String(draft.age) : '');
  const imperial = draft.height ? cmToFeetInches(draft.height) : null;
  const [cm, setCm] = useState(draft.height ? String(Math.round(draft.height)) : '');
  const [feet, setFeet] = useState(imperial ? String(imperial.feet) : '');
  const [inches, setInches] = useState(imperial ? String(imperial.inches) : '');
  const [weightValue, setWeightValue] = useState(
    draft.weight != null
      ? String(Math.round(draft.weightUnit === 'kg' ? draft.weight : kgToLb(draft.weight)))
      : '',
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const firstError = FIELD_ORDER.find((key) => errors[key]);

  useEffect(() => {
    if (!firstError) return;
    document.getElementById(`onboard-${firstError}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [attempt, firstError]);

  const setHeightUnit = (unit: HeightUnit) => {
    if (unit === draft.heightUnit) return;
    if (unit === 'cm') {
      const next = feetInchesToCm(Number(feet) || 0, Number(inches) || 0);
      if (next > 0) setCm(String(Math.round(next)));
    } else {
      const next = cmToFeetInches(Number(cm) || 0);
      if (Number(cm)) {
        setFeet(String(next.feet));
        setInches(String(next.inches));
      }
    }
    draft.setHeightUnit(unit);
  };

  const setWeightUnit = (unit: WeightUnit) => {
    if (unit === draft.weightUnit) return;
    const parsed = Number.parseFloat(weightValue);
    if (Number.isFinite(parsed) && parsed >= 0) {
      const kg = draft.weightUnit === 'kg' ? parsed : lbToKg(parsed);
      setWeightValue(String(Math.round((unit === 'kg' ? kg : kgToLb(kg)) * 10) / 10));
    }
    draft.setWeightUnit(unit);
  };

  const clearError = (key: FieldKey) => {
    if (!errors[key]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const submit = async () => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const trimmedName = name.trim();
    if (!trimmedName) nextErrors.name = 'Add a name or nickname.';

    if (draft.gender == null) nextErrors.gender = 'Choose one.';

    const ageCheck = readNumber(age, INPUT_LIMITS.age.min, INPUT_LIMITS.age.max, 'age');
    if (ageCheck.error) nextErrors.age = ageCheck.error;

    const heightCm =
      draft.heightUnit === 'cm'
        ? readNumber(cm, INPUT_LIMITS.heightCm.min, INPUT_LIMITS.heightCm.max, 'height')
        : readImperialHeight(feet, inches);
    if (heightCm.error) nextErrors.height = heightCm.error;

    const parsedWeight = readNumber(
      weightValue,
      draft.weightUnit === 'kg' ? INPUT_LIMITS.weightKg.min : Math.round(kgToLb(INPUT_LIMITS.weightKg.min)),
      draft.weightUnit === 'kg' ? INPUT_LIMITS.weightKg.max : Math.round(kgToLb(INPUT_LIMITS.weightKg.max)),
      'weight',
    );
    const weightKg = parsedWeight.value == null ? null : draft.weightUnit === 'kg' ? parsedWeight.value : lbToKg(parsedWeight.value);
    if (parsedWeight.error) {
      nextErrors.weight = parsedWeight.error;
    } else if (weightKg != null && (weightKg < INPUT_LIMITS.weightKg.min || weightKg > INPUT_LIMITS.weightKg.max)) {
      nextErrors.weight = `Try a weight between ${INPUT_LIMITS.weightKg.min} and ${INPUT_LIMITS.weightKg.max} kg.`;
    }

    if (draft.activityLevel == null) nextErrors.activity = 'Choose how active a usual week is.';
    if (draft.goal == null) nextErrors.goal = 'Pick a goal so we can shape your targets.';

    setAttempt((n) => n + 1);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Fill in the highlighted fields.');
      return;
    }

    const measurements = {
      gender: draft.gender!,
      age: ageCheck.value!,
      height: Math.round(heightCm.value!),
      weight: Math.round(weightKg! * 10) / 10,
      activityLevel: draft.activityLevel!,
      goal: draft.goal!,
    };

    update({
      name: trimmedName,
      age: measurements.age,
      height: measurements.height,
      weight: measurements.weight,
    });

    if (!user) return;
    setSaving(true);
    setFormError(null);
    setErrors({});
    try {
      let profile = await saveProfileFromMeasurements({
        userId: user.id,
        email: user.email ?? null,
        measurements,
      });
      await saveCharacter(user.id, {
        character_type: 'pika',
        equipped_background: 'blossom',
        display_name: 'Pika',
      }).catch(() => undefined);
      try {
        profile = await updateProfilePrefs(user.id, { display_name: trimmedName || null });
      } catch {
        // The name column arrives with journal-and-pet.sql; Home falls back to the email.
      }
      reset();
      setProfile(profile);
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Could not save your targets.');
      setSaving(false);
    }
  };

  return (
    <form
      className="onboard-page"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <header className="pagehead">
        <p className="eyebrow">Your daily guide</p>
        <h1>A few details, then you’re in.</h1>
        <p>Sex, size, and how you move. We’ll turn them into calorie and macro targets with the same formula as before.</p>
      </header>

      <Section id="onboard-name" eyebrow="You" invalid={Boolean(errors.name)}>
        <label>
          <span className="formlabel">What should we call you?</span>
          <input
            className={`field ${errors.name ? 'invalid' : ''}`}
            autoComplete="nickname"
            maxLength={30}
            placeholder="e.g. Alex"
            value={name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'err-name' : undefined}
            onChange={(event) => {
              setName(event.target.value);
              update({ name: event.target.value });
              clearError('name');
            }}
          />
        </label>
        <FieldError id="err-name" message={errors.name} />
      </Section>

      <Section id="onboard-gender" eyebrow="Biological sex" hint="Only used in the calorie formula." invalid={Boolean(errors.gender)}>
        <OptionList
          compact
          invalid={Boolean(errors.gender)}
          options={GENDER_OPTIONS}
          value={draft.gender}
          onSelect={(value) => {
            update({ gender: value });
            clearError('gender');
          }}
        />
        <FieldError id="err-gender" message={errors.gender} />
      </Section>

      <Section id="onboard-age" eyebrow="Age" invalid={Boolean(errors.age)}>
        <div className="unit-field">
          <input
            className={`field ${errors.age ? 'invalid' : ''}`}
            inputMode="numeric"
            maxLength={3}
            placeholder="20"
            value={age}
            aria-invalid={Boolean(errors.age)}
            aria-describedby={errors.age ? 'err-age' : undefined}
            onChange={(event) => {
              setAge(event.target.value.replace(/\D/g, ''));
              clearError('age');
            }}
          />
          <span>years</span>
        </div>
        <FieldError id="err-age" message={errors.age} />
      </Section>

      <Section id="onboard-height" eyebrow="Height" hint="Rough is fine." invalid={Boolean(errors.height)}>
        <UnitToggle value={draft.heightUnit} options={[['ftin', 'ft / in'], ['cm', 'cm']]} onChange={setHeightUnit} />
        {draft.heightUnit === 'cm' ? (
          <div className="unit-field">
            <input
              className={`field ${errors.height ? 'invalid' : ''}`}
              inputMode="numeric"
              maxLength={3}
              placeholder="170"
              value={cm}
              aria-invalid={Boolean(errors.height)}
              onChange={(event) => {
                setCm(event.target.value.replace(/\D/g, ''));
                clearError('height');
              }}
            />
            <span>cm</span>
          </div>
        ) : (
          <div className="formrow">
            <div className="unit-field">
              <input
                className={`field ${errors.height ? 'invalid' : ''}`}
                inputMode="numeric"
                maxLength={1}
                placeholder="5"
                value={feet}
                aria-invalid={Boolean(errors.height)}
                onChange={(event) => {
                  setFeet(event.target.value.replace(/\D/g, ''));
                  clearError('height');
                }}
              />
              <span>ft</span>
            </div>
            <div className="unit-field">
              <input
                className={`field ${errors.height ? 'invalid' : ''}`}
                inputMode="numeric"
                maxLength={2}
                placeholder="6"
                value={inches}
                aria-invalid={Boolean(errors.height)}
                onChange={(event) => {
                  setInches(event.target.value.replace(/\D/g, ''));
                  clearError('height');
                }}
              />
              <span>in</span>
            </div>
          </div>
        )}
        <FieldError id="err-height" message={errors.height} />
      </Section>

      <Section id="onboard-weight" eyebrow="Weight" hint="Private. It only shapes your targets." invalid={Boolean(errors.weight)}>
        <UnitToggle
          value={draft.weightUnit}
          options={[
            ['lb', 'lb'],
            ['kg', 'kg'],
          ]}
          onChange={setWeightUnit}
        />
        <div className="unit-field">
          <input
            className={`field ${errors.weight ? 'invalid' : ''}`}
            inputMode="decimal"
            maxLength={5}
            placeholder={draft.weightUnit === 'kg' ? '60' : '135'}
            value={weightValue}
            aria-invalid={Boolean(errors.weight)}
            onChange={(event) => {
              setWeightValue(event.target.value.replace(/[^\d.]/g, ''));
              clearError('weight');
            }}
          />
          <span>{draft.weightUnit}</span>
        </div>
        <FieldError id="err-weight" message={errors.weight} />
      </Section>

      <Section id="onboard-activity" eyebrow="Activity" hint="A usual week, not a perfect one." invalid={Boolean(errors.activity)}>
        <OptionList
          invalid={Boolean(errors.activity)}
          options={ACTIVITY_OPTIONS}
          value={draft.activityLevel}
          onSelect={(value) => {
            update({ activityLevel: value });
            clearError('activity');
          }}
        />
        <FieldError id="err-activity" message={errors.activity} />
      </Section>

      <Section id="onboard-goal" eyebrow="Goal" invalid={Boolean(errors.goal)}>
        <OptionList
          invalid={Boolean(errors.goal)}
          options={GOAL_OPTIONS}
          value={draft.goal}
          onSelect={(value) => {
            update({ goal: value });
            clearError('goal');
          }}
        />
        <FieldError id="err-goal" message={errors.goal} />
      </Section>

      {formError ? <p className="error formblock">{formError}</p> : null}

      <div className="sticky-actions onboard-actions">
        <button className={`btn ${saving ? 'loading' : ''}`} disabled={saving} type="submit">
          {saving ? 'Setting up your journal…' : 'Start my journal'}
        </button>
      </div>
    </form>
  );
}

function Section({
  id,
  eyebrow,
  hint,
  invalid,
  children,
}: {
  id: string;
  eyebrow: string;
  hint?: string;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`card onboard-section ${invalid ? 'invalid' : ''}`}>
      <div className="eyebrow">{eyebrow}</div>
      {hint ? <p className="muted small onboard-hint">{hint}</p> : null}
      {children}
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="error field-hint" role="alert">
      {message}
    </p>
  );
}

function OptionList<T extends string>({
  options,
  value,
  onSelect,
  compact,
  invalid,
}: {
  options: readonly { value: T; label: string; emoji: string; description?: string }[];
  value: T | null;
  onSelect: (value: T) => void;
  compact?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className={`option-list ${compact ? 'two' : ''} ${invalid ? 'invalid' : ''}`} role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`option ${value === option.value ? 'selected' : ''}`}
          onClick={() => onSelect(option.value)}
        >
          <span className="emoji">{option.emoji}</span>
          <span className="meta">
            <strong>{option.label}</strong>
            {option.description ? <small>{option.description}</small> : null}
          </span>
          <span className="radio" />
        </button>
      ))}
    </div>
  );
}

function UnitToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" style={{ marginBottom: 14 }}>
      {options.map(([key, label]) => (
        <button key={key} type="button" className={value === key ? 'chosen' : ''} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

type ParsedNumber = { value: number | null; error: string | null };

function readNumber(raw: string, min: number, max: number, noun: string): ParsedNumber {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: `Add your ${noun}.` };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { value: null, error: `Add your ${noun}.` };
  if (value < 0) return { value: null, error: 'Use a number that’s 0 or more.' };
  if (value < min || value > max) {
    const article = noun === 'age' ? 'an' : 'a';
    return { value: null, error: `Try ${article} ${noun} between ${min} and ${max}.` };
  }
  return { value, error: null };
}

function readImperialHeight(feetRaw: string, inchesRaw: string): ParsedNumber {
  const feetEmpty = !feetRaw.trim();
  const inchesEmpty = !inchesRaw.trim();
  if (feetEmpty && inchesEmpty) return { value: null, error: 'Add your height.' };
  const feet = feetEmpty ? 0 : Number(feetRaw);
  const inches = inchesEmpty ? 0 : Number(inchesRaw);
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return { value: null, error: 'Add your height.' };
  if (feet < 0 || inches < 0) return { value: null, error: 'Use a number that’s 0 or more.' };
  const cm = feetInchesToCm(feet, inches);
  if (cm < INPUT_LIMITS.heightCm.min || cm > INPUT_LIMITS.heightCm.max) {
    return { value: null, error: `Try a height between ${INPUT_LIMITS.heightCm.min} and ${INPUT_LIMITS.heightCm.max} cm.` };
  }
  return { value: cm, error: null };
}
