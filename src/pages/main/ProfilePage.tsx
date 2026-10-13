import { useNavigate } from 'react-router-dom';

import { deleteAccountData } from '../../api/account';
import { updateProfilePrefs } from '../../api/profiles';
import { ACTIVITY_LABELS, GOAL_LABELS } from '../../constants/profileOptions';
import { displayName } from '../../lib/journal';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { DEFAULT_REMINDERS, type Reminders } from '../../types/profile';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const signOut = useAuthStore((state) => state.signOut);
  const openModal = useUiStore((state) => state.openModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const showToast = useUiStore((state) => state.showToast);
  const name = displayName(profile, user?.email);
  const reminders: Reminders = { ...DEFAULT_REMINDERS, ...(profile?.reminders ?? {}) };

  const savePrefs = async (patch: Parameters<typeof updateProfilePrefs>[1], message?: string) => {
    if (!user) return;
    try {
      setProfile(await updateProfilePrefs(user.id, patch));
      if (message) showToast(message);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not save that.');
    }
  };

  const confirmDelete = () =>
    openModal(
      'Delete your journal?',
      <>
        <p className="muted">This removes your meals, photos, Pika’s progress and your profile. It can’t be undone.</p>
        <button
          className="btn"
          onClick={async () => {
            if (!user) return;
            try {
              await deleteAccountData(user.id);
              closeModal();
              await signOut();
            } catch (error) {
              closeModal();
              showToast(error instanceof Error ? error.message : 'Could not delete your data.');
            }
          }}
        >
          Delete everything
        </button>
        <button className="btn secondary" onClick={closeModal}>
          Keep my journal
        </button>
      </>,
    );

  const rows: [keyof Reminders, string][] = [
    ['meal', 'Meal reminders'],
    ['night', 'Late-night reminder'],
    ['pika', 'Pika reminders'],
  ];

  return (
    <>
      <header className="pagehead row">
        <div className="avatar" style={{ width: 51, height: 51, display: 'grid', placeItems: 'center', fontSize: 23 }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{name}</h1>
          <p>Your own pace. Your own page.</p>
        </div>
      </header>
      <section className="card">
        <div className="eyebrow">Your goals</div>
        <div className="settings-row">
          <span>Primary goal</span>
          <span className="muted">{profile?.goal ? GOAL_LABELS[profile.goal] : '—'}</span>
        </div>
        <div className="settings-row">
          <span>Daily energy</span>
          <span className="muted">{profile?.daily_calorie_target ? `${profile.daily_calorie_target.toLocaleString('en-US')} kcal` : '—'}</span>
        </div>
        <div className="settings-row">
          <span>Activity</span>
          <span className="muted">{profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '—'}</span>
        </div>
        <button className="settings-row" onClick={() => navigate('/profile/edit')}>
          <span>Edit name, body & goals</span>
          <span>›</span>
        </button>
        <button className="settings-row" onClick={() => navigate('/pet')}>
          <span>Your little companion</span>
          <span className="muted">Pika ›</span>
        </button>
      </section>
      <section className="card formblock">
        <div className="eyebrow">Reminders</div>
        {rows.map(([key, label]) => (
          <button
            key={key}
            className="settings-row"
            role="switch"
            aria-checked={reminders[key]}
            onClick={() => void savePrefs({ reminders: { ...reminders, [key]: !reminders[key] } }, 'Preference saved.')}
          >
            <span>{label}</span>
            <span className={`toggle ${reminders[key] ? 'on' : ''}`} />
          </button>
        ))}
      </section>
      <section className="card formblock">
        <div className="eyebrow">Mood & account</div>
        <button
          className="settings-row"
          role="switch"
          aria-checked={Boolean(profile?.night_mode)}
          onClick={() => void savePrefs({ night_mode: !profile?.night_mode })}
        >
          <span>Late-night mood</span>
          <span className={`toggle ${profile?.night_mode ? 'on' : ''}`} />
        </button>
        <div className="settings-row">
          <span>Signed in as</span>
          <span className="muted small">{user?.email}</span>
        </div>
        <button className="settings-row" onClick={() => void signOut()}>
          <span>Sign out</span>
          <span>›</span>
        </button>
        <button className="settings-row" onClick={confirmDelete}>
          <span className="danger-text">Delete my journal</span>
          <span>›</span>
        </button>
      </section>
      <p className="notice center formblock">
        Your journal is saved to your account.
        <br />
        Take a little care, every day.
      </p>
    </>
  );
}
