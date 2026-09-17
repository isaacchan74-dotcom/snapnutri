import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActivityScreen } from '../screens/onboarding/ActivityScreen';
import { AgeScreen } from '../screens/onboarding/AgeScreen';
import { GenderScreen } from '../screens/onboarding/GenderScreen';
import { GoalScreen } from '../screens/onboarding/GoalScreen';
import { HeightScreen } from '../screens/onboarding/HeightScreen';
import { SummaryScreen } from '../screens/onboarding/SummaryScreen';
import { WeightScreen } from '../screens/onboarding/WeightScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { useTheme } from '../theme';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
    </Stack.Navigator>
  );
}
