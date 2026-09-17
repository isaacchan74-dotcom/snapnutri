import React, { useEffect, useMemo } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';

import { LoadingScreen } from '../components';
import { isSupabaseConfigured } from '../lib/env';
import { SetupRequiredScreen } from '../screens/SetupRequiredScreen';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../theme';
import { isProfileComplete } from '../types/profile';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { TabNavigator } from './TabNavigator';

/** Maps our design tokens onto React Navigation's own theme contract. */
function useNavigationTheme(): NavigationTheme {
  const theme = useTheme();

  return useMemo(() => {
    const base = theme.appearance === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark: theme.appearance === 'dark',
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surfaceRaised,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.accent,
      },
    };
  }, [theme]);
}

export function RootNavigator() {
  const navigationTheme = useNavigationTheme();

  const themeHydrated = useThemeStore((state) => state.hydrated);
  const initialize = useAuthStore((state) => state.initialize);
  const initializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);

  useEffect(() => initialize(), [initialize]);

  if (!isSupabaseConfigured) {
    return <SetupRequiredScreen />;
  }

  if (!themeHydrated || initializing) {
    return <LoadingScreen />;
  }

  const authenticated = session != null;
  const needsOnboarding = authenticated && !isProfileComplete(profile);

  return (
    <NavigationContainer theme={navigationTheme}>
      {!authenticated ? (
        <AuthNavigator />
      ) : profileLoading && profile == null ? (
        <LoadingScreen message="Loading your targets…" />
      ) : needsOnboarding ? (
        <OnboardingNavigator />
      ) : (
        <TabNavigator />
      )}
    </NavigationContainer>
  );
}
