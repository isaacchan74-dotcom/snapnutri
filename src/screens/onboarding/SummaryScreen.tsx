import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { saveProfile } from '../../api/profiles';
import {
  AppText,
  Banner,
  Button,
  Card,
  InfoRow,
  ScreenContainer,
  StatTile,
} from '../../components';
import { ACTIVITY_LABELS, GOAL_LABELS } from '../../constants/profileOptions';
import { calculateDailyTargets } from '../../lib/nutrition';
import { formatHeight, formatWeight } from '../../lib/units';
import type { OnboardingScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../theme';

export function SummaryScreen({ navigation }: OnboardingScreenProps<'Summary'>) {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);
  const toMeasurements = useOnboardingStore((state) => state.toMeasurements);
  const resetDraft = useOnboardingStore((state) => state.reset);

  const measurements = toMeasurements();
  const targets = useMemo(
    () => (measurements ? calculateDailyTargets(measurements) : null),
    [measurements],
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!measurements || !targets) {
    return (
      <ScreenContainer
        center
        title="We lost a couple of answers 😅"
        subtitle="Let's run back through the questions quickly."
        footer={<Button label="Restart setup" onPress={() => navigation.navigate('Gender')} />}
      />
    );
  }

  const handleSave = async () => {
    if (!user) {
      setError('Your session expired. Log in again to save your targets.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const profile = await saveProfile({
        userId: user.id,
        email: user.email ?? null,
        measurements,
        targets,
      });
      resetDraft();
      // Setting the profile flips the root navigator over to the tab app.
      setProfile(profile);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      eyebrow="All set"
      title="Here are your daily targets 🎯"
      subtitle="Built from your numbers with the Mifflin-St Jeor equation."
      footer={
        <Button
          label="Start journaling"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        />
      }
    >
      <View style={{ gap: theme.spacing.lg }}>
        {error ? <Banner message={error} /> : null}

        <Card tone="brand" elevation="soft">
          <View style={{ gap: theme.spacing.xs, alignItems: 'center' }}>
            <AppText variant="label" color="secondary">
              DAILY CALORIES
            </AppText>
            <AppText variant="metric" color="brand">
              {targets.calories.toLocaleString()}
            </AppText>
            <AppText variant="caption" color="secondary">
              kcal per day
            </AppText>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <StatTile
            label="Protein"
            value={String(targets.protein)}
            unit="g"
            accentColor={theme.colors.protein}
          />
          <StatTile
            label="Carbs"
            value={String(targets.carbs)}
            unit="g"
            accentColor={theme.colors.carbs}
          />
          <StatTile
            label="Fat"
            value={String(targets.fat)}
            unit="g"
            accentColor={theme.colors.fat}
          />
        </View>

        <Card padding="md">
          <AppText variant="label" color="muted">
            HOW WE GOT THERE
          </AppText>
          <InfoRow label="Resting burn (BMR)" value={`${targets.bmr.toLocaleString()} kcal`} />
          <InfoRow label="With activity (TDEE)" value={`${targets.tdee.toLocaleString()} kcal`} />
          <InfoRow label="Activity level" value={ACTIVITY_LABELS[measurements.activityLevel]} />
          <InfoRow label="Goal" value={GOAL_LABELS[measurements.goal]} />
          <InfoRow label="Height" value={formatHeight(measurements.height)} />
          <InfoRow label="Weight" value={formatWeight(measurements.weight)} last />
        </Card>
      </View>
    </ScreenContainer>
  );
}
