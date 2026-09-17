/**
 * Environment configuration.
 *
 * Values come from `.env` at the project root. Expo only inlines variables
 * prefixed with `EXPO_PUBLIC_`, and the anon key is safe to ship because row
 * level security is what actually protects the data. Never put a service role
 * key here.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseConfig = {
  url,
  anonKey,
};

/** False until the developer fills in `.env`; the app shows setup help instead of crashing. */
export const isSupabaseConfigured = url.startsWith('http') && anonKey.length > 0;
