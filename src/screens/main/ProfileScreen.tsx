import React, { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  AppText,
  Banner,
  Button,
  Card,
  InfoRow,
  ScreenContainer,
  SegmentedControl,
  StatTile,
  type Segment,
} from '../../components';
import { ACTIVITY_LABELS, GENDER_LABELS, GOAL_LABELS } from '../../constants/profileOptions';
import { formatHeight, formatWeight } from '../../lib/units';
import { useAuthStore } from '../../store/authStore';
import { useTheme, useThemeControls, type ThemeMode } from '../../theme';

export function ProfileScreen() {
  const theme = useTheme();
  const { mode, availableModes, setMode, labels } = useThemeControls();

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const [signingOut, setSigningOut] = useState(false);

  const themeSegments: Segment<ThemeMode>[] = availableModes.map((themeMode) => ({
    value: themeMode,
    label: labels[themeMode].label,
    emoji: labels[themeMode].emoji,
  }));

  const handleSignOut = () => {
    Alert.alert('Log out?', "Your journal will be right here when you're back.", [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          const result = await signOut();
          setSigningOut(false);
          if (result.error) Alert.alert('Could not log out', result.error);
        },
      },
    ]);
  };

  const initial = (user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <ScreenContainer title="Profile" subtitle="Your numbers, your look, your account.">
      <View style={{ gap: theme.spacing.xl }}>
        <Card padding="md">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <View
              style={{
                width: theme.layout.avatarSize,
                height: theme.layout.avatarSize,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.primarySoft,
                borderWidth: theme.borderWidth.thick,
                borderColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText variant="title" color="brand">
                {initial}
              </AppText>
            </View>

            <View style={{ flex: 1, gap: theme.spacing.xxs }}>
              <AppText variant="subtitle" numberOfLines={1}>
                {user?.email ?? 'Signed in'}
              </AppText>
              <AppText variant="caption" color="secondary">
                {profile?.goal ? GOAL_LABELS[profile.goal] : 'Goal not set yet'}
              </AppText>
            </View>
          </View>
        </Card>

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="heading">Daily targets</AppText>

          {profile?.daily_calorie_target != null ? (
            <>
              <Card tone="brand" elevation="soft">
                <View style={{ gap: theme.spacing.xs, alignItems: 'center' }}>
                  <AppText variant="label" color="secondary">
                    CALORIES
                  </AppText>
                  <AppText variant="metric" color="brand">
                    {profile.daily_calorie_target.toLocaleString()}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    kcal per day
                  </AppText>
                </View>
              </Card>

              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <StatTile
                  label="Protein"
                  value={String(profile.daily_protein_target ?? 0)}
                  unit="g"
                  accentColor={theme.colors.protein}
                />
                <StatTile
                  label="Carbs"
                  value={String(profile.daily_carb_target ?? 0)}
                  unit="g"
                  accentColor={theme.colors.carbs}
                />
                <StatTile
                  label="Fat"
                  value={String(profile.daily_fat_target ?? 0)}
                  unit="g"
                  accentColor={theme.colors.fat}
                />
              </View>
            </>
          ) : (
            <Banner tone="info" message="Finish onboarding to unlock your personalised targets." />
          )}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="heading">Your details</AppText>
          <Card padding="md">
            <InfoRow
              label="Sex"
              value={profile?.gender ? GENDER_LABELS[profile.gender] : '—'}
            />
            <InfoRow label="Age" value={profile?.age ? `${profile.age} years` : '—'} />
            <InfoRow
              label="Height"
              value={profile?.height ? formatHeight(profile.height) : '—'}
            />
            <InfoRow
              label="Weight"
              value={profile?.weight ? formatWeight(profile.weight) : '—'}
            />
            <InfoRow
              label="Activity"
              value={profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '—'}
              last
            />
          </Card>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="heading">Appearance</AppText>
          <Card padding="md">
            <View style={{ gap: theme.spacing.md }}>
              <AppText variant="caption" color="secondary">
                Pick a vibe. It sticks between sessions.
              </AppText>
              <SegmentedControl segments={themeSegments} value={mode} onChange={setMode} />
            </View>
          </Card>
        </View>

        <Button
          label="Log out"
          variant="danger"
          onPress={handleSignOut}
          loading={signingOut}
        />
      </View>
    </ScreenContainer>
  );
}
