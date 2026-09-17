import React from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, ScreenContainer } from '../../components';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme';

const PERKS = [
  { emoji: '📸', text: 'Snap a photo, skip the search bar.' },
  { emoji: '🎯', text: 'Targets built around your body and your goal.' },
  { emoji: '🔥', text: 'Streaks that make it stupidly easy to keep going.' },
];

export function WelcomeScreen({ navigation }: OnboardingScreenProps<'Welcome'>) {
  const theme = useTheme();

  return (
    <ScreenContainer
      center
      footer={<Button label="Let's go" onPress={() => navigation.navigate('Gender')} />}
    >
      <View style={{ gap: theme.spacing.xl, alignItems: 'center' }}>
        <AppText variant="display">🥑</AppText>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="title" align="center">
            Welcome to SnapNutri
          </AppText>
          <AppText variant="body" color="secondary" align="center">
            Six quick questions and we'll build your daily targets. No clipboards, we promise.
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.md, alignSelf: 'stretch' }}>
          {PERKS.map((perk) => (
            <Card key={perk.emoji} tone="muted" elevation="none" padding="sm">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <AppText variant="subtitle">{perk.emoji}</AppText>
                <AppText variant="body" style={{ flex: 1 }}>
                  {perk.text}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
