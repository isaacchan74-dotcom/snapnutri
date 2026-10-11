import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { LoadingScreen } from '../components';
import { isSupabaseConfigured } from '../lib/env';
import { CameraScreen } from '../screens/main/CameraScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { JournalScreen } from '../screens/main/JournalScreen';
import { MealFormScreen } from '../screens/main/MealFormScreen';
import { CharacterScreen } from '../screens/main/CharacterScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { CharacterSelectScreen } from '../screens/onboarding/CharacterSelectScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ActivityScreen } from '../screens/onboarding/ActivityScreen';
import { AgeScreen } from '../screens/onboarding/AgeScreen';
import { GenderScreen } from '../screens/onboarding/GenderScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { HeightScreen } from '../screens/onboarding/HeightScreen';
import { SummaryScreen } from '../screens/onboarding/SummaryScreen';
import { WeightScreen } from '../screens/onboarding/WeightScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SetupRequiredScreen } from '../screens/SetupRequiredScreen';
import { useAuthStore } from '../store/authStore';
import { isCharacterComplete } from '../types/character';
import { isProfileComplete } from '../types/profile';
import { AppShell } from './AppShell';

export function AppRoutes() {
  if (!isSupabaseConfigured) {
    return (
      <AppShell>
        <SetupRequiredScreen />
      </AppShell>
    );
  }

  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
      </Route>

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<WelcomeScreen />} />
        <Route path="/onboarding/gender" element={<GenderScreen />} />
        <Route path="/onboarding/age" element={<AgeScreen />} />
        <Route path="/onboarding/height" element={<HeightScreen />} />
        <Route path="/onboarding/weight" element={<WeightScreen />} />
        <Route path="/onboarding/activity" element={<ActivityScreen />} />
        <Route path="/onboarding/goal" element={<GoalScreen />} />
        <Route path="/onboarding/summary" element={<SummaryScreen />} />
      </Route>

      <Route element={<CharacterRoute />}>
        <Route path="/character/select" element={<CharacterSelectScreen />} />
      </Route>

      <Route element={<AppRoute />}>
        <Route path="/snap" element={<CameraScreen />} />
        <Route path="/journal" element={<JournalScreen />} />
        <Route path="/journal/new" element={<MealFormScreen />} />
        <Route path="/journal/:mealId" element={<MealFormScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/character" element={<CharacterScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/edit" element={<EditProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>

      <Route path="*" element={<CatchAllRedirect />} />
    </Routes>
  );
}

function GuestRoute() {
  const gate = useGate();
  if (gate.kind === 'loading') return <BootScreen message={gate.message} />;
  if (gate.kind === 'onboarding') return <Navigate to="/onboarding" replace />;
  if (gate.kind === 'character') return <Navigate to="/character/select" replace />;
  if (gate.kind === 'app') return <Navigate to="/snap" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function OnboardingRoute() {
  const gate = useGate();
  if (gate.kind === 'loading') return <BootScreen message={gate.message} />;
  if (gate.kind === 'guest') return <Navigate to="/login" replace />;
  if (gate.kind === 'character') return <Navigate to="/character/select" replace />;
  if (gate.kind === 'app') return <Navigate to="/snap" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function CharacterRoute() {
  const gate = useGate();
  if (gate.kind === 'loading') return <BootScreen message={gate.message} />;
  if (gate.kind === 'guest') return <Navigate to="/login" replace />;
  if (gate.kind === 'onboarding') return <Navigate to="/onboarding" replace />;
  if (gate.kind === 'app') return <Navigate to="/character" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AppRoute() {
  const gate = useGate();
  if (gate.kind === 'loading') return <BootScreen message={gate.message} />;
  if (gate.kind === 'guest') return <Navigate to="/login" replace />;
  if (gate.kind === 'onboarding') return <Navigate to="/onboarding" replace />;
  if (gate.kind === 'character') return <Navigate to="/character/select" replace />;
  return (
    <AppShell showTabs>
      <Outlet />
    </AppShell>
  );
}

function CatchAllRedirect() {
  const gate = useGate();
  if (gate.kind === 'loading') return <BootScreen message={gate.message} />;
  if (gate.kind === 'guest') return <Navigate to="/login" replace />;
  if (gate.kind === 'onboarding') return <Navigate to="/onboarding" replace />;
  if (gate.kind === 'character') return <Navigate to="/character/select" replace />;
  return <Navigate to="/snap" replace />;
}

function BootScreen({ message }: { message: string }) {
  return (
    <AppShell>
      <LoadingScreen message={message} />
    </AppShell>
  );
}

type Gate =
  | { kind: 'loading'; message: string }
  | { kind: 'guest' }
  | { kind: 'onboarding' }
  | { kind: 'character' }
  | { kind: 'app' };

function useGate(): Gate {
  const initializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const character = useAuthStore((state) => state.character);
  const characterLoading = useAuthStore((state) => state.characterLoading);

  if (initializing) {
    return { kind: 'loading', message: 'Warming up…' };
  }

  if (!session) {
    return { kind: 'guest' };
  }

  if (profileLoading && profile == null) {
    return { kind: 'loading', message: 'Loading your targets…' };
  }

  if (!isProfileComplete(profile)) {
    return { kind: 'onboarding' };
  }

  if (characterLoading && !isCharacterComplete(character)) {
    return { kind: 'loading', message: 'Waking your buddy…' };
  }

  if (!isCharacterComplete(character)) {
    return { kind: 'character' };
  }

  return { kind: 'app' };
}
