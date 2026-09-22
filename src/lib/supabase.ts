import { createClient } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabaseConfig } from './env';

const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'sb_publishable_placeholder';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseConfig.url : FALLBACK_URL,
  isSupabaseConfigured ? supabaseConfig.publishableKey : FALLBACK_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
