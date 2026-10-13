import { useMemo, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { saveCharacter } from '../../api/characters';
import { saveProfileFromMeasurements, updateProfilePrefs } from '../../api/profiles';
import { ACTIVITY_LABELS, ACTIVITY_OPTIONS, GENDER_OPTIONS, GOAL_LABELS, GOAL_OPTIONS, INPUT_LIMITS } from '../../constants/profileOptions';
import { calculateDailyTargets } from '../../lib/nutrition';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from '../../lib/units';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Icon } from '../../ui/Icon';
import { Pika } from '../../ui/Pika';

const STEPS = ['name', 'gender', 'age', 'height', 'weight', 'activity', 'goal'] as const;
type StepName = (typeof STEPS)[number];

export function OnboardingFlow() {
  return (
    <Routes>
      <Route index element={<Navigate to="/onboarding/name" replace />} />
      <Route path="name" element={<NameStep />} />
      <Route path="gender" element={<GenderStep />} />
      <Route path="age" element={<AgeStep />} />
      <Route path="height" element={<HeightStep />} />
      <Route path="weight" element={<WeightStep />} />
      <Route path="activity" element={<ActivityStep />} />
      <Route path="goal" element={<GoalStep />} />
      <Route path="summary" element={<SummaryStep />} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}

function nextPath(step: StepName): string {
  const index = STEPS.indexOf(step);
  return index === STEPS.length - 1 ? '/onboarding/summary' : `/onboarding/${STEPS[index + 1]}`;
}

function prevPath(step: StepName): string {
  const index = STEPS.indexOf(step);
  return index === 0 ? '/onboarding/name' : `/onboarding/${STEPS[index - 1]}`;
}

type StepProps = {
  step: StepName;
  title: string;
  sub?: string;
  canContinue: boolean;
  onContinue?: () => void;
  children: ReactNode;
};

function Step({ step, title, sub, canContinue, onContinue, children }: StepProps) {
  const navigate = useNavigate();
  const index = STEPS.indexOf(step);
  return (
    <>
      <div className="backhead" style={{ marginBottom: 14 }}>
        {index > 0 ? (
          <button className="iconbtn" aria-label="Back" onClick={() => navigate(prevPath(step))}>
            <Icon name="back" />
          </button>
        ) : null}
        <div className="eyebrow">
          Step {index + 1} of {STEPS.length}
        </div>
      </div>
      <div className="step-progress" aria-hidden="true">
        {STEPS.map((name, i) => (
          <span key={name} className={i <= index ? 'on' : ''} />
        ))}
      </div>
      <header className="pagehead">
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </header>
      {children}
      <div className="sticky-actions">
        <button
          className="btn"
          disabled={!canContinue}
          onClick={() => {
            onContinue?.();
            navigate(nextPath(step));
          }}
        >
          Continue
        </button>
      </div>
    </>
  );
}

function NameStep() {
  const name = useOnboardingStore((state) => state.name);
  const update = useOnboardingStore((state) => state.update);
  return (
    <Step step="name" title="What should Pika call you?" sub="Just a first name or a nickname." canContinue={name.trim().length > 0}>
      <input
        className="field"
        autoFocus
        maxLength={30}
        placeholder="e.g. Shirly"
        value={name}
        onChange={(event) => update({ name: event.target.value })}
      />
    </Step>
  );
}

function OptionList<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly { value: T; label: string; emoji: string; description?: string }[];
  value: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="option-list" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
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

function GenderStep() {
  const gender = useOnboardingStore((state) => state.gender);
  const update = useOnboardingStore((state) => state.update);
  return (
    <Step step="gender" title="Biological sex" sub="Only used in the calorie formula — nowhere else." canContinue={gender != null}>
      <OptionList options={GENDER_OPTIONS} value={gender} onSelect={(value) => update({ gender: value })} />
    </Step>
  );
}

function AgeStep() {
  const stored = useOnboardingStore((state) => state.age);
  const update = useOnboardingStore((state) => state.update);
  const [age, setAge] = useState(stored ? String(stored) : '');
  const value = Number.parseInt(age, 10);
  const valid = value >= INPUT_LIMITS.age.min && value <= INPUT_LIMITS.age.max;
  return (
    <Step step="age" title="How old are you?" canContinue={valid} onContinue={() => update({ age: value })}>
      <div className="unit-field">
        <input className={`field ${age && !valid ? 'invalid' : ''}`} inputMode="numeric" maxLength={3} placeholder="20" value={age} onChange={(event) => setAge(event.target.value.replace(/\D/g, ''))} />
        <span>years</span>
      </div>
      {age && !valid ? <p className="error" style={{ marginTop: 8 }}>Try an age between {INPUT_LIMITS.age.min} and {INPUT_LIMITS.age.max}.</p> : null}
    </Step>
  );
}

function UnitToggle<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <div className="segmented" style={{ marginBottom: 14 }}>
      {options.map(([key, label]) => (
        <button key={key} className={value === key ? 'chosen' : ''} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function HeightStep() {
  const stored = useOnboardingStore((state) => state.height);
  const unit = useOnboardingStore((state) => state.heightUnit);
  const setUnit = useOnboardingStore((state) => state.setHeightUnit);
  const update = useOnboardingStore((state) => state.update);
  const imperial = stored ? cmToFeetInches(stored) : null;
  const [cm, setCm] = useState(stored ? String(Math.round(stored)) : '');
  const [feet, setFeet] = useState(imperial ? String(imperial.feet) : '');
  const [inches, setInches] = useState(imperial ? String(imperial.inches) : '');
  const heightCm = unit === 'cm' ? Number.parseFloat(cm) : feetInchesToCm(Number(feet) || 0, Number(inches) || 0);
  const valid = heightCm >= INPUT_LIMITS.heightCm.min && heightCm <= INPUT_LIMITS.heightCm.max;
  return (
    <Step step="height" title="How tall are you?" sub="Rough is fine." canContinue={valid} onContinue={() => update({ height: Math.round(heightCm) })}>
      <UnitToggle value={unit} options={[['ftin', 'ft / in'], ['cm', 'cm']]} onChange={setUnit} />
      {unit === 'cm' ? (
        <div className="unit-field">
          <input className="field" inputMode="numeric" maxLength={3} placeholder="170" value={cm} onChange={(event) => setCm(event.target.value.replace(/\D/g, ''))} />
          <span>cm</span>
        </div>
      ) : (
        <div className="formrow">
          <div className="unit-field">
            <input className="field" inputMode="numeric" maxLength={1} placeholder="5" value={feet} onChange={(event) => setFeet(event.target.value.replace(/\D/g, ''))} />
            <span>ft</span>
          </div>
          <div className="unit-field">
            <input className="field" inputMode="numeric" maxLength={2} placeholder="6" value={inches} onChange={(event) => setInches(event.target.value.replace(/\D/g, ''))} />
            <span>in</span>
          </div>
        </div>
      )}
    </Step>
  );
}

function WeightStep() {
  const stored = useOnboardingStore((state) => state.weight);
  const unit = useOnboardingStore((state) => state.weightUnit);
  const setUnit = useOnboardingStore((state) => state.setWeightUnit);
  const update = useOnboardingStore((state) => state.update);
  const [value, setValue] = useState(stored ? String(Math.round(unit === 'kg' ? stored : kgToLb(stored))) : '');
  const parsed = Number.parseFloat(value);
  const kg = unit === 'kg' ? parsed : lbToKg(parsed);
  const valid = kg >= INPUT_LIMITS.weightKg.min && kg <= INPUT_LIMITS.weightKg.max;
  return (
    <Step step="weight" title="And your weight?" sub="It stays private. It only shapes your targets." canContinue={valid} onContinue={() => update({ weight: Math.round(kg * 10) / 10 })}>
      <UnitToggle value={unit} options={[['lb', 'lb'], ['kg', 'kg']]} onChange={(next) => { setUnit(next); setValue(''); }} />
      <div className="unit-field">
        <input className="field" inputMode="decimal" maxLength={5} placeholder={unit === 'kg' ? '60' : '135'} value={value} onChange={(event) => setValue(event.target.value.replace(/[^\d.]/g, ''))} />
        <span>{unit}</span>
      </div>
    </Step>
  );
}

function ActivityStep() {
  const activity = useOnboardingStore((state) => state.activityLevel);
  const update = useOnboardingStore((state) => state.update);
  return (
    <Step step="activity" title="How active is a usual week?" canContinue={activity != null}>
      <OptionList options={ACTIVITY_OPTIONS} value={activity} onSelect={(value) => update({ activityLevel: value })} />
    </Step>
  );
}

function GoalStep() {
  const goal = useOnboardingStore((state) => state.goal);
  const update = useOnboardingStore((state) => state.update);
  return (
    <Step step="goal" title="What would feel good to work on?" canContinue={goal != null}>
      <OptionList options={GOAL_OPTIONS} value={goal} onSelect={(value) => update({ goal: value })} />
    </Step>
  );
}

function SummaryStep() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);
  const name = useOnboardingStore((state) => state.name);
  const toMeasurements = useOnboardingStore((state) => state.toMeasurements);
  const reset = useOnboardingStore((state) => state.reset);
  const measurements = toMeasurements();
  const targets = useMemo(() => (measurements ? calculateDailyTargets(measurements) : null), [measurements]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!measurements || !targets) {
    return (
      <section className="center" style={{ marginTop: 40 }}>
        <Pika />
        <h2>We lost a couple of answers.</h2>
        <p className="muted small" style={{ margin: '8px 0 20px' }}>Let’s run through them again quickly.</p>
        <button className="btn" onClick={() => navigate('/onboarding/name')}>Start again</button>
      </section>
    );
  }

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      let profile = await saveProfileFromMeasurements({ userId: user.id, email: user.email ?? null, measurements });
      // Keeps the teammates' character-based screens working for this account too.
      await saveCharacter(user.id, { character_type: 'pika', equipped_background: 'blossom', display_name: 'Pika' }).catch(() => undefined);
      try {
        profile = await updateProfilePrefs(user.id, { display_name: name.trim() || null });
      } catch {
        // The name column arrives with journal-and-pet.sql; Home falls back to the email.
      }
      reset();
      setProfile(profile);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your targets.');
      setSaving(false);
    }
  };

  return (
    <>
      <section className="center" style={{ marginTop: 6 }}>
        <Pika happy />
        <div className="eyebrow">All set{name.trim() ? `, ${name.trim()}` : ''}</div>
        <h1 style={{ margin: '8px 0 4px' }}>Your daily rhythm</h1>
        <p className="muted small">A gentle guide, not a rule.</p>
      </section>
      <section className="card formblock center">
        <div className="eyebrow">Daily energy</div>
        <div className="target-big">{targets.calories.toLocaleString('en-US')}</div>
        <p className="small muted">kcal per day</p>
      </section>
      <div className="macro-row">
        {[
          ['Protein', targets.protein],
          ['Carbs', targets.carbs],
          ['Fat', targets.fat],
        ].map(([label, value]) => (
          <section key={label} className="card">
            <div className="eyebrow">{label}</div>
            <strong>{value}g</strong>
          </section>
        ))}
      </div>
      <section className="card formblock">
        <div className="eyebrow">Shaped by</div>
        <div className="settings-row"><span>Goal</span><span className="muted">{GOAL_LABELS[measurements.goal]}</span></div>
        <div className="settings-row"><span>Activity</span><span className="muted">{ACTIVITY_LABELS[measurements.activityLevel]}</span></div>
        <div className="settings-row"><span>Resting burn</span><span className="muted">{targets.bmr.toLocaleString('en-US')} kcal</span></div>
      </section>
      {error ? <p className="error formblock">{error}</p> : null}
      <div className="sticky-actions">
        <button className={`btn ${saving ? 'loading' : ''}`} disabled={saving} onClick={() => void save()}>
          {saving ? 'Setting up your journal…' : 'Start my journal'}
        </button>
      </div>
    </>
  );
}
