import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Gender: undefined;
  Age: undefined;
  Height: undefined;
  Weight: undefined;
  Activity: undefined;
  Goal: undefined;
  Summary: undefined;
};

export type MainTabParamList = {
  Camera: undefined;
  Journal: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
