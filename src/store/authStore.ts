import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { fetchProfile } from '../api/profiles';
import { isSupabaseConfigured } from '../lib/env';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/profile';

type ActionResult = { error: string | null };
type SignUpResult = ActionResult & { needsEmailConfirmation: boolean };

type AuthState = {
  initializing: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  profileLoading: boolean;

  initialize: () => () => void;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: ProfileRow) => void;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<ActionResult>;
  signOut: () => Promise<ActionResult>;
};

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initializing: true,
  session: null,
  user: null,
  profile: null,
  profileLoading: false,

  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ initializing: false });
      return () => {};
    }

    const applySession = async (session: Session | null) => {
      set({ session, user: session?.user ?? null });

      if (!session?.user) {
        set({ profile: null, profileLoading: false, initializing: false });
        return;
      }

      set({ profileLoading: true });
      try {
        set({ profile: await fetchProfile(session.user.id) });
      } catch {
        set({ profile: null });
      } finally {
        set({ profileLoading: false, initializing: false });
      }
    };

    const timeout = window.setTimeout(() => {
      set({ initializing: false });
    }, 4000);

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => set({ initializing: false }))
      .finally(() => window.clearTimeout(timeout));

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => data.subscription.unsubscribe();
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    set({ profileLoading: true });
    try {
      set({ profile: await fetchProfile(user.id) });
    } catch {
      // Keep the cached profile if the refresh fails.
    } finally {
      set({ profileLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    return {
      error: error ? error.message : null,
      needsEmailConfirmation: !error && data.session == null,
    };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error ? error.message : null };
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, user: null, profile: null });
      return { error: null };
    } catch (error) {
      return { error: toMessage(error) };
    }
  },
}));
