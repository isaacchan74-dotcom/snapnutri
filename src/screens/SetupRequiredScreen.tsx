import React from 'react';
import { View } from 'react-native';

import { AppText, Card, ScreenContainer } from '../components';
import { useTheme } from '../theme';

const STEPS = [
  'Create a project at supabase.com and open Project Settings → API.',
  'Copy the Project URL and the anon public key.',
  'Paste them into a .env file in the project root (see .env.example).',
  'Run the SQL in supabase/schema.sql in the Supabase SQL editor.',
  'Restart the dev server with `npx expo start --clear`.',
];

/** Shown instead of the app when `.env` has no Supabase credentials yet. */
export function SetupRequiredScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer
      eyebrow="Almost there"
      title="Connect Supabase 🔌"
      subtitle="SnapNutri needs a backend before you can sign up."
    >
      <View style={{ gap: theme.spacing.md }}>
        {STEPS.map((step, index) => (
          <Card key={step} tone="muted" elevation="none" padding="sm">
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <AppText variant="bodyStrong" color="brand">
                {index + 1}.
              </AppText>
              <AppText variant="body" style={{ flex: 1 }}>
                {step}
              </AppText>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}
