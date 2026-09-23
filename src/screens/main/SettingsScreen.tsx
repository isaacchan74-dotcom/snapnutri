import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppText, Banner, Button, Card, InfoRow, ScreenContainer, ThemePicker } from '../../components';
import { useAuthStore } from '../../store/authStore';

export function SettingsScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (!window.confirm("Log out? Your journal will be right here when you're back.")) {
      return;
    }

    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);
    if (result.error) setError(result.error);
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
            About
          </AppText>
          <Card>
            <AppText variant="body" color="secondary">
              SnapNutri is a playful food journal for college students — snap later, log now, keep the
              targets honest.
            </AppText>
          </Card>
        </div>

        <Button label="Log out" variant="danger" onClick={handleSignOut} loading={signingOut} />
      </div>
    </ScreenContainer>
  );
}
