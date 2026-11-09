/** Visible in the email fields. Not a domain rule. */
export const EMAIL_PLACEHOLDER = 'you@email.com';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Standard format only — any domain (gmail, outlook, .edu, etc.) is allowed. */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length > 2 && email.length <= 254 && EMAIL_PATTERN.test(email);
}
