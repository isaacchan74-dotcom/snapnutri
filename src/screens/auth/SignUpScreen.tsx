import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  ScreenContainer,
  TextField,
} from '../../components';
import type { AuthScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme';

const MIN_PASSWORD_LENGTH = 6;

export function SignUpScreen({ navigation }: AuthScreenProps<'SignUp'>) {
  const theme = useTheme();
  const signUp = useAuthStore((state) => state.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword === password &&
    !submitting;

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNotice(`Almost there — confirm your email at ${email.trim()}, then log in.`);
    }
    // Otherwise the auth listener swaps us straight into onboarding.
  };

  return (
    <ScreenContainer
      eyebrow="Get started"
      title="Build your food journal 🥑"
      subtitle="One account, zero calorie spreadsheets. Takes about a minute."
    >
      <View style={{ gap: theme.spacing.lg }}>
        {error ? <Banner message={error} /> : null}
        {notice ? <Banner tone="success" message={notice} /> : null}

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@college.edu"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          textContentType="newPassword"
          helper={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={passwordTooShort ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : null}
        />

        <TextField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="new-password"
          secureTextEntry
          error={passwordsMismatch ? 'Passwords do not match.' : null}
          onSubmitEditing={canSubmit ? handleSubmit : undefined}
          returnKeyType="go"
        />

        <Button
          label="Create account"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        />

        <Pressable
          onPress={() => navigation.navigate('Login')}
          hitSlop={theme.layout.hitSlop}
          style={{ alignItems: 'center', paddingVertical: theme.spacing.sm }}
        >
          <AppText variant="caption" color="secondary">
            Already have an account?{' '}
            <AppText variant="caption" color="brand" weight="bold">
              Log in
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
