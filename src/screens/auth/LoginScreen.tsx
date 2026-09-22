import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { AppText, Banner, Button, ScreenContainer, TextField } from '../../components';
import { useAuthStore } from '../../store/authStore';

export function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  return (
    <ScreenContainer
      eyebrow="Welcome back"
      title="Let's get snapping 📸"
      subtitle="Log in to pick up your food journal where you left off."
    >
      <form className="stack" onSubmit={handleSubmit}>
        {error ? <Banner message={error} /> : null}

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
          autoComplete="current-password"
          type="password"
        />

        <Button label="Log in" type="submit" loading={submitting} disabled={!canSubmit} />

        <Link to="/signup" className="link-row">
          <AppText as="span" variant="caption" color="secondary">
            New here?{' '}
            <AppText as="span" variant="caption" color="brand">
              Create an account
            </AppText>
          </AppText>
        </Link>
      </form>
    </ScreenContainer>
  );
}
