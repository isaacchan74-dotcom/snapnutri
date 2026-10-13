import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { Icon } from '../../ui/Icon';
import { Pika } from '../../ui/Pika';

const MIN_PASSWORD = 6;

export function SignUpPage() {
  const signUp = useAuthStore((state) => state.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signUp(email, password);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.needsEmailConfirmation) {
      setNotice('Check your inbox to confirm your email, then log in. Pika will wait.');
    }
  };

  return (
    <>
      <Link className="iconbtn" to="/welcome" aria-label="Back to welcome">
        <Icon name="back" />
      </Link>
      <section className="auth-hero">
        <Pika />
        <div className="brand">
          SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <p>A meal, a memory, a little companion.</p>
      </section>
      {notice ? (
        <div className="banner sage">{notice}</div>
      ) : (
        <form className="stack" onSubmit={submit}>
          <label>
            <span className="formlabel">Email</span>
            <input
              className="field"
              type="email"
              autoComplete="email"
              placeholder="you@usc.edu"
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
      )}
      <p className="auth-switch">
        Already journaling? <Link to="/login">Log in</Link>
      </p>
    </>
  );
}
