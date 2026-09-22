/**
 * Vite only inlines variables prefixed with `VITE_`.
 *
 * Supabase's current key scheme is publishable / secret. The publishable key
 * is designed to ship in a client bundle — row level security protects the data.
 */

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabaseConfig = {
  url,
  publishableKey,
};

export const isSupabaseConfigured = url.startsWith('http') && publishableKey.length > 0;
