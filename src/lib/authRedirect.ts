/** Query + hash params Supabase puts on the confirmation return URL. */
export type AuthRedirectStatus = {
  confirming: boolean;
  confirmed: boolean;
  error: string | null;
};

export function readAuthRedirect(search = window.location.search, hash = window.location.hash): AuthRedirectStatus {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const pick = (key: string) => query.get(key) ?? fragment.get(key);

  const rawError = pick('error_description') ?? pick('error');
  const type = pick('type');
  const confirming = Boolean(pick('code') || pick('access_token') || pick('token_hash'));
  const confirmed = type === 'signup' || type === 'email' || type === 'magiclink';

  return {
    confirming,
    confirmed,
    error: rawError ? decodeURIComponent(rawError.replace(/\+/g, ' ')) : null,
  };
}

export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('not confirmed') || lower.includes('email not confirmed')) {
    return 'Confirm your email first — open the link we sent, then log in.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered') || lower.includes('user already')) {
    return 'That email already has a journal. Try logging in.';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Email or password does not match. Try again.';
  }
  if (lower.includes('email link is invalid') || lower.includes('otp_expired') || lower.includes('expired')) {
    return 'That confirmation link is invalid or expired. Sign up again or request a new one.';
  }
  return message;
}

const PENDING_EMAIL_KEY = 'snapnutri.pendingEmail';

export function rememberPendingEmail(email: string) {
  sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
}

export function readPendingEmail(): string | null {
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingEmail() {
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
}
