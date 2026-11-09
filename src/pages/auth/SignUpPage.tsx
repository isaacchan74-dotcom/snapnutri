import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { clearPendingEmail, readPendingEmail, rememberPendingEmail } from '../../lib/authRedirect';
import { EMAIL_PLACEHOLDER, isValidEmail } from '../../lib/email';
import { useAuthStore } from '../../store/authStore';
import { BackButton } from '../../ui/BackButton';
import { Pika } from '../../ui/Pika';

const MIN_PASSWORD = 6;

export function SignUpPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(() => readPendingEmail());
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError(`Enter a valid email, like ${EMAIL_PLACEHOLDER}.`);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signUp(trimmed, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      rememberPendingEmail(trimmed);
      setPendingEmail(trimmed.toLowerCase());
    }
  };

  if (pendingEmail) {
    return (
      <>
        <BackButton
          onClick={() => {
            clearPendingEmail();
            setPendingEmail(null);
          }}
        />
        <section className="auth-hero">
          <Pika happy />
          <div className="brand">
            SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <h1 style={{ fontSize: 28, marginTop: 10 }}>Check your email</h1>
          <p>
            We sent a confirmation link to <strong>{pendingEmail}</strong>. Open it to confirm, then log in.
          </p>
        </section>
        <div className="banner sage">Pika will wait right here.</div>
        <div className="sticky-actions">
          <button className="btn" onClick={() => navigate('/login', { state: { email: pendingEmail } })}>
            I confirmed — log in
          </button>
          <button
            className="btn quiet"
            onClick={() => {
              clearPendingEmail();
              setPendingEmail(null);
              setPassword('');
            }}
          >
            Use a different email
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <BackButton onClick={() => navigate('/welcome')} />
      <section className="auth-hero">
        <Pika />
        <div className="brand">
          SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <p>A meal, a memory, a little companion.</p>
      </section>
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
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD} characters`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className={`btn ${busy ? 'loading' : ''}`} disabled={busy}>
          {busy ? 'Making some room…' : 'Create my journal'}
        </button>
      </form>
      <p className="auth-switch">
        Already journaling? <Link to="/login">Log in</Link>
      </p>
    </>
  );
}
