import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { friendlyAuthError, readAuthRedirect, readPendingEmail } from '../../lib/authRedirect';
import { EMAIL_PLACEHOLDER, isValidEmail } from '../../lib/email';
import { useAuthStore } from '../../store/authStore';
import { BackButton } from '../../ui/BackButton';
import { Pika } from '../../ui/Pika';

type LoginState = { email?: string };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const initializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const preset = (location.state as LoginState | null)?.email ?? readPendingEmail() ?? '';
  const [email, setEmail] = useState(preset);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const redirect = readAuthRedirect(location.search, location.hash);
    if (redirect.error) {
      setConfirming(false);
      setError(friendlyAuthError(redirect.error));
      return;
    }
    if (redirect.confirming) {
      setConfirming(true);
      setNotice('Confirming your email…');
      return;
    }
    if (redirect.confirmed) {
      setNotice('Email confirmed. Log in to open your journal.');
    }
  }, [location.hash, location.search]);

  useEffect(() => {
    if (!confirming || initializing || session) return;
    setConfirming(false);
    setNotice('If you confirmed, log in below to open your journal.');
  }, [confirming, initializing, session]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError(`Enter a valid email, like ${EMAIL_PLACEHOLDER}.`);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signIn(trimmed, password);
    if (result.error) {
      setError(result.error);
      setBusy(false);
    }
  };

  return (
    <>
      <BackButton onClick={() => navigate('/welcome')} />
      <section className="auth-hero">
        <Pika happy />
        <div className="brand">
          SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <p>{confirming ? 'Finishing confirmation…' : 'Pika missed you. Welcome back.'}</p>
      </section>
      {notice ? <div className="banner sage">{notice}</div> : null}
      <form className="stack" onSubmit={submit}>
        <label>
          <span className="formlabel">Email</span>
          <input
            className="field"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={EMAIL_PLACEHOLDER}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          <span className="formlabel">Password</span>
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className={`btn ${busy || confirming ? 'loading' : ''}`} disabled={busy || confirming}>
          {confirming ? 'Confirming…' : busy ? 'Opening your journal…' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/signup">Start your journal</Link>
      </p>
    </>
  );
}
