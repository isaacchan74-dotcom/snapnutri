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

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const theme = useTheme();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  };

  return (
    <ScreenContainer
      eyebrow="Welcome back"
      title="Let's get snapping 📸"
      subtitle="Log in to pick up your food journal where you left off."
    >
      <View style={{ gap: theme.spacing.lg }}>
        {error ? <Banner message={error} /> : null}

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
          autoComplete="current-password"
          secureTextEntry
          textContentType="password"
          onSubmitEditing={canSubmit ? handleSubmit : undefined}
          returnKeyType="go"
        />

        <Button label="Log in" onPress={handleSubmit} loading={submitting} disabled={!canSubmit} />

        <Pressable
          onPress={() => navigation.navigate('SignUp')}
          hitSlop={theme.layout.hitSlop}
          style={{ alignItems: 'center', paddingVertical: theme.spacing.sm }}
        >
          <AppText variant="caption" color="secondary">
            New here?{' '}
            <AppText variant="caption" color="brand" weight="bold">
              Create an account
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
