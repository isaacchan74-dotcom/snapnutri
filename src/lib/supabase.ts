import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { isSupabaseConfigured, supabaseConfig } from './env';

/** Keeps `createClient` from throwing before `.env` is filled in. */
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-anon-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseConfig.url : FALLBACK_URL,
  isSupabaseConfigured ? supabaseConfig.anonKey : FALLBACK_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // There is no URL bar in React Native, so no magic-link parsing.
      detectSessionInUrl: false,
    },
  },
);

// Refresh tokens only while the app is in the foreground.
if (isSupabaseConfigured) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
