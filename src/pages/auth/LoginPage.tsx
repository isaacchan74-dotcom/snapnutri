import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { Icon } from '../../ui/Icon';
import { Pika } from '../../ui/Pika';

export function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setBusy(false);
    }
  };

  return (
    <>
      <Link className="iconbtn" to="/welcome" aria-label="Back to welcome">
        <Icon name="back" />
      </Link>
      <section className="auth-hero">
        <Pika happy />
        <div className="brand">
          SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <p>Pika missed you. Welcome back.</p>
      </section>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className={`btn ${busy ? 'loading' : ''}`} disabled={busy}>
          {busy ? 'Opening your journal…' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        New here? <Link to="/signup">Start your journal</Link>
      </p>
    </>
  );
}
