/**
 * Environment configuration.
 *
 * Values come from `.env` at the project root. Expo only inlines variables
 * prefixed with `EXPO_PUBLIC_`.
 *
 * Supabase's current key scheme is publishable / secret (formerly anon /
 * service_role). The publishable key is designed to ship in a client bundle —
 * row level security is what actually protects the data. A secret key
 * (`sb_secret_...`) must never appear in this file or in `.env`.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabaseConfig = {
  url,
  publishableKey,
};

/** False until the developer fills in `.env`; the app shows setup help instead of crashing. */
export const isSupabaseConfigured = url.startsWith('http') && publishableKey.length > 0;
