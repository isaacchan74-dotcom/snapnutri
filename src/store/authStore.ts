import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { loadCharacter } from '../api/characters';
import { fetchProfile } from '../api/profiles';
import { isSupabaseConfigured } from '../lib/env';
import { supabase } from '../lib/supabase';
import type { CharacterRow } from '../types/character';
import type { ProfileRow } from '../types/profile';
import { useCoachStore } from './coachStore';
import { useMealStore } from './mealStore';
import { usePetStore } from './petStore';

type ActionResult = { error: string | null };
type SignUpResult = ActionResult & { needsEmailConfirmation: boolean };

type AuthState = {
  initializing: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  profileLoading: boolean;
  character: CharacterRow | null;
  characterLoading: boolean;
  characterUnavailable: boolean;

  initialize: () => () => void;
  refreshProfile: () => Promise<void>;
  setProfile: (profile: ProfileRow) => void;
  setCharacter: (character: CharacterRow) => void;
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
  character: null,
  characterLoading: false,
  characterUnavailable: false,

  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ initializing: false });
      return () => {};
    }

    const applySession = async (session: Session | null) => {
      set({ session, user: session?.user ?? null });

      if (!session?.user) {
        useMealStore.setState({ meals: [], error: null, loading: false });
        useCoachStore.getState().reset();
        usePetStore.getState().reset();
        set({
          profile: null,
          profileLoading: false,
          character: null,
          characterLoading: false,
          characterUnavailable: false,
          initializing: false,
        });
        return;
      }

      set({ profileLoading: true, characterLoading: true });
      try {
        const [profile, characterResult] = await Promise.all([
          fetchProfile(session.user.id),
          loadCharacter(session.user.id).catch(() => ({ character: null, unavailable: true })),
        ]);
        set({
          profile,
          character: characterResult.character,
          characterUnavailable: characterResult.unavailable,
        });
      } catch {
        set({ profile: null, character: null, characterUnavailable: true });
      } finally {
        set({ profileLoading: false, characterLoading: false, initializing: false });
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
  setCharacter: (character) => set({ character, characterUnavailable: false }),

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      // Confirmation links return to whichever deployment the user signed up on.
      options: { emailRedirectTo: `${window.location.origin}/login` },
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
      set({
        session: null,
        user: null,
        profile: null,
        character: null,
        characterUnavailable: false,
      });
      useMealStore.setState({ meals: [], error: null, loading: false });
      useCoachStore.getState().reset();
      usePetStore.getState().reset();
      return { error: null };
    } catch (error) {
      return { error: toMessage(error) };
    }
  },
}));
