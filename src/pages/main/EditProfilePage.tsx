import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveProfileFromMeasurements, updateProfilePrefs } from '../../api/profiles';
import { ACTIVITY_OPTIONS, GENDER_OPTIONS, GOAL_OPTIONS, INPUT_LIMITS } from '../../constants/profileOptions';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import type { ActivityLevel, Gender, Goal } from '../../types/profile';
import { BackHead } from '../../ui/BackHead';

export function EditProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const showToast = useUiStore((state) => state.showToast);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'female');
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [height, setHeight] = useState(String(profile?.height ? Math.round(profile.height) : ''));
  const [weight, setWeight] = useState(String(profile?.weight ?? ''));
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activity_level ?? 'light');
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'health');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    const a = Number(age);
    const h = Number(height);
    const w = Number(weight);
    if (a < INPUT_LIMITS.age.min || a > INPUT_LIMITS.age.max) return setError(`Age should be ${INPUT_LIMITS.age.min}–${INPUT_LIMITS.age.max}.`);
    if (h < INPUT_LIMITS.heightCm.min || h > INPUT_LIMITS.heightCm.max) return setError(`Height should be ${INPUT_LIMITS.heightCm.min}–${INPUT_LIMITS.heightCm.max} cm.`);
    if (w < INPUT_LIMITS.weightKg.min || w > INPUT_LIMITS.weightKg.max) return setError(`Weight should be ${INPUT_LIMITS.weightKg.min}–${INPUT_LIMITS.weightKg.max} kg.`);
    setSaving(true);
    setError(null);
    try {
      let next = await saveProfileFromMeasurements({
        userId: user.id,
        email: user.email ?? null,
        measurements: { gender, age: a, height: h, weight: w, activityLevel: activity, goal },
      });
      if (name.trim() !== (profile?.display_name ?? '')) {
        next = await updateProfilePrefs(user.id, { display_name: name.trim() || null });
      }
      setProfile(next);
      showToast('Saved. Your daily guide has been updated.');
      navigate('/profile');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
      setSaving(false);
    }
  };

  return (
    <>
      <BackHead title="Your details" sub="Targets update when you save." to="/profile" />
      <div className="stack">
        <label>
          <span className="formlabel">What Pika calls you</span>
          <input className="field" maxLength={30} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <div className="formrow">
          <label>
            <span className="formlabel">Biological sex</span>
            <select className="field" value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="formlabel">Age</span>
            <input className="field" inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value.replace(/\D/g, ''))} />
          </label>
        </div>
        <div className="formrow">
          <label className="unit-field">
            <span className="formlabel">Height</span>
            <input className="field" inputMode="numeric" value={height} onChange={(event) => setHeight(event.target.value.replace(/\D/g, ''))} />
          </label>
          <label className="unit-field">
            <span className="formlabel">Weight (kg)</span>
            <input className="field" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value.replace(/[^\d.]/g, ''))} />
          </label>
        </div>
        <p className="notice" style={{ marginTop: -6 }}>Height in centimetres, weight in kilograms.</p>
        <label>
          <span className="formlabel">Activity</span>
          <select className="field" value={activity} onChange={(event) => setActivity(event.target.value as ActivityLevel)}>
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="formlabel">Goal</span>
          <select className="field" value={goal} onChange={(event) => setGoal(event.target.value as Goal)}>
            {GOAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="sticky-actions">
        <button className={`btn ${saving ? 'loading' : ''}`} disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="btn quiet" onClick={() => navigate('/profile')}>
          Cancel
        </button>
      </div>
    </>
  );
}
