import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteAccountData } from '../../api/account';
import { AppText, Banner, Button, Card, InfoRow, ScreenContainer, ThemePicker } from '../../components';
import { useAuthStore } from '../../store/authStore';

export function SettingsScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = signingOut || deleting;

  const handleSignOut = async () => {
    if (!window.confirm("Log out? Your journal will be right here when you're back.")) {
      return;
    }

    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);
    if (result.error) setError(result.error);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (
      !window.confirm(
        "Delete your SnapNutri data? This permanently removes your profile and all meals. This can't be undone.",
      )
    ) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      await deleteAccountData(user.id);
      const result = await signOut();
      if (result.error) {
        setError(result.error);
        setDeleting(false);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete your account data.',
      );
      setDeleting(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Settings"
      title="Make it yours ⚙️"
      subtitle="Theme, account, and a little about the app."
      headerRight={
        <Button label="Back" variant="ghost" size="sm" fullWidth={false} onClick={() => navigate('/profile')} />
      }
    >
      <div className="stack">
        {error ? <Banner message={error} /> : null}

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Account
          </AppText>
          <Card>
            <InfoRow label="Email" value={user?.email ?? '—'} last />
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Appearance
          </AppText>
          <Card>
            <div className="stack stack--md">
              <AppText variant="caption" color="secondary">
                Five vibes. Same layout. Your pick sticks between sessions.
              </AppText>
              <ThemePicker />
            </div>
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            Your Data & Privacy
          </AppText>
          <Card>
            <AppText variant="body" color="secondary">
              SnapNutri stores your health details and meals securely in your account. Only you can see
              them.
            </AppText>
          </Card>
        </div>

        <div className="stack stack--md">
          <AppText as="h2" variant="heading">
            About
          </AppText>
          <Card>
            <AppText variant="body" color="secondary">
              SnapNutri is a playful food journal for college students — snap later, log now, keep the
              targets honest.
            </AppText>
          </Card>
        </div>

        <div className="stack stack--md">
          <Button label="Log out" variant="danger" onClick={handleSignOut} loading={signingOut} disabled={busy} />
          <Button
            label="Delete account"
            variant="ghost"
            onClick={handleDeleteAccount}
            loading={deleting}
            disabled={busy}
          />
        </div>
      </div>
    </ScreenContainer>
  );
}
