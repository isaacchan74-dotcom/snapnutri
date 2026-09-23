import { useNavigate } from 'react-router-dom';

import {
  AppText,
  Banner,
  Button,
  Card,
  GearIcon,
  IconButton,
  InfoRow,
  ScreenContainer,
  StatTile,
} from '../../components';
import { ACTIVITY_LABELS, GENDER_LABELS, GOAL_LABELS } from '../../constants/profileOptions';
import { formatHeight, formatWeight } from '../../lib/units';
import { useAuthStore } from '../../store/authStore';

export function ProfileScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const initial = (user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <ScreenContainer
      title="Profile"
      subtitle="Your numbers and daily targets."
      headerRight={
        <IconButton label="Settings" onClick={() => navigate('/settings')}>
          <GearIcon />
        </IconButton>
      }
    >
      <div className="stack">
        <Card>
          <div className="row">
            <div className="avatar">
              <AppText as="span" variant="title" color="brand">
                {initial}
              </AppText>
            </div>
            <div className="stack stack--sm">
              <AppText variant="subtitle">{user?.email ?? 'Signed in'}</AppText>
              <AppText variant="caption" color="secondary">
                {profile?.goal ? GOAL_LABELS[profile.goal] : 'Goal not set yet'}
              </AppText>
            </div>
          </div>
        </Card>

        <div className="stack stack--md">
          <div className="row row--spread">
            <AppText as="h2" variant="heading">
              Daily targets
            </AppText>
            <Button
              label="Edit"
              size="sm"
              fullWidth={false}
              variant="secondary"
              onClick={() => navigate('/profile/edit')}
            />
          </div>

          {profile?.daily_calorie_target != null ? (
            <>
              <Card tone="brand">
                <div className="metric-block">
                  <AppText variant="label" color="secondary">
                    Calories
                  </AppText>
                  <AppText variant="metric" color="brand">
                    {profile.daily_calorie_target.toLocaleString()}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    kcal per day
                  </AppText>
                </div>
              </Card>
              <div className="row row--grow">
                <StatTile
                  label="Protein"
                  value={String(profile.daily_protein_target ?? 0)}
                  unit="g"
                  accentVar="--color-protein"
                />
                <StatTile
                  label="Carbs"
                  value={String(profile.daily_carb_target ?? 0)}
                  unit="g"
                  accentVar="--color-carbs"
                />
                <StatTile
                  label="Fat"
                  value={String(profile.daily_fat_target ?? 0)}
                  unit="g"
                  accentVar="--color-fat"
                />
              </div>
            </>
          ) : (
            <Banner tone="info" message="Finish onboarding to unlock your personalised targets." />
          )}
        </div>

        <div className="stack stack--md">
          <div className="row row--spread">
            <AppText as="h2" variant="heading">
              Your details
            </AppText>
            <Button
              label="Edit"
              size="sm"
              fullWidth={false}
              variant="secondary"
              onClick={() => navigate('/profile/edit')}
            />
          </div>
          <Card>
            <InfoRow label="Sex" value={profile?.gender ? GENDER_LABELS[profile.gender] : '—'} />
            <InfoRow label="Age" value={profile?.age ? `${profile.age} years` : '—'} />
            <InfoRow label="Height" value={profile?.height ? formatHeight(profile.height) : '—'} />
            <InfoRow label="Weight" value={profile?.weight ? formatWeight(profile.weight) : '—'} />
            <InfoRow
              label="Activity"
              value={profile?.activity_level ? ACTIVITY_LABELS[profile.activity_level] : '—'}
              last
            />
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
}
