import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { isSupabaseConfigured } from '../lib/env';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { WelcomePage } from '../pages/auth/WelcomePage';
import { CoachPage } from '../pages/main/CoachPage';
import { DayPage } from '../pages/main/DayPage';
import { EditProfilePage } from '../pages/main/EditProfilePage';
import { HomePage } from '../pages/main/HomePage';
import { JournalPage } from '../pages/main/JournalPage';
import { MealPage } from '../pages/main/MealPage';
import { NutrientPage } from '../pages/main/NutrientPage';
import { AccessoriesPage, PetPage } from '../pages/main/PetPage';
import { ProfilePage } from '../pages/main/ProfilePage';
import { TrackerPage } from '../pages/main/TrackerPage';
import { OnboardingFlow } from '../pages/onboarding/OnboardingFlow';
import { SetupRequiredPage } from '../pages/SetupRequiredPage';
import { AnalyzingPage } from '../pages/snap/AnalyzingPage';
import { CameraPage } from '../pages/snap/CameraPage';
import { ResultPage } from '../pages/snap/ResultPage';
import { ReviewPage } from '../pages/snap/ReviewPage';
import { useAuthStore } from '../store/authStore';
import { isProfileComplete } from '../types/profile';
import { Pika } from '../ui/Pika';
import { Phone } from '../ui/Phone';

export function AppRoutes() {
  if (!isSupabaseConfigured) {
    return (
      <Phone>
        <SetupRequiredPage />
      </Phone>
    );
  }

  return (
    <Routes>
      <Route element={<Gate need="guest" />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      <Route element={<Gate need="onboarding" />}>
        <Route path="/onboarding/*" element={<OnboardingFlow />} />
      </Route>

      <Route element={<Gate need="app" />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/pet" element={<PetPage />} />
        <Route path="/pet/accessories" element={<AccessoriesPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/journal/:day" element={<DayPage />} />
        <Route path="/meal/:mealId" element={<MealPage />} />
        <Route path="/meal/:mealId/review" element={<ReviewPage />} />
        <Route path="/meal/:mealId/result" element={<ResultPage />} />
        <Route path="/snap" element={<CameraPage />} />
        <Route path="/snap/analyzing" element={<AnalyzingPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/tracker/:nutrient" element={<NutrientPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>

      <Route path="*" element={<Gate need="any" />} />
    </Routes>
  );
}

type Stage = 'loading' | 'guest' | 'onboarding' | 'app';
const HOME: Record<Exclude<Stage, 'loading'>, string> = {
  guest: '/welcome',
  onboarding: '/onboarding',
  app: '/home',
};

function useStage(): Stage {
  const initializing = useAuthStore((state) => state.initializing);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);

  if (initializing) return 'loading';
  if (!session) return 'guest';
  if (profileLoading && profile == null) return 'loading';
  return isProfileComplete(profile) ? 'app' : 'onboarding';
}

function Gate({ need }: { need: Exclude<Stage, 'loading'> | 'any' }) {
  const stage = useStage();

  if (stage === 'loading') {
    return (
      <Phone>
        <div className="loading-screen">
          <div>
            <Pika />
            <p>Waking Pika…</p>
          </div>
        </div>
      </Phone>
    );
  }
  if (need === 'any' || stage !== need) return <Navigate to={HOME[stage]} replace />;

  return (
    <Phone nav={stage === 'app'}>
      <Outlet />
    </Phone>
  );
}
