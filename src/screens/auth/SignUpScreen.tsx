import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { AppText, Banner, Button, ScreenContainer, TextField } from '../../components';
import { useAuthStore } from '../../store/authStore';

const MIN_PASSWORD_LENGTH = 6;

export function SignUpScreen() {
  const signUp = useAuthStore((state) => state.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword === password &&
    !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNotice(`Almost there — confirm your email at ${email.trim()}, then log in.`);
    }
  };

  return (
    <ScreenContainer
      eyebrow="Get started"
      title="Build your food journal 🥑"
      subtitle="One account, zero calorie spreadsheets. Takes about a minute."
    >
      <form className="stack" onSubmit={handleSubmit}>
        {error ? <Banner message={error} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}

        <TextField
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@college.edu"
          autoComplete="email"
          inputMode="email"
          type="email"
        />

        <TextField
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          type="password"
          helper={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={passwordTooShort ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : null}
        />

        <TextField
          label="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          type="password"
          error={passwordsMismatch ? 'Passwords do not match.' : null}
        />

        <Button label="Create account" type="submit" loading={submitting} disabled={!canSubmit} />

        <Link to="/login" className="link-row">
          <AppText as="span" variant="caption" color="secondary">
            Already have an account?{' '}
            <AppText as="span" variant="caption" color="brand">
              Log in
            </AppText>
          </AppText>
        </Link>
      </form>
    </ScreenContainer>
  );
}
