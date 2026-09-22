import { useNavigate } from 'react-router-dom';

import { AppText, Button, Card, ScreenContainer } from '../../components';

const PERKS = [
  { emoji: '📸', text: 'Snap a photo, skip the search bar.' },
  { emoji: '🎯', text: 'Targets built around your body and your goal.' },
  { emoji: '🔥', text: 'Streaks that make it stupidly easy to keep going.' },
];

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <ScreenContainer
      center
      footer={<Button label="Let's go" onClick={() => navigate('/onboarding/gender')} />}
    >
      <div className="stack stack--center">
        <AppText as="span" variant="display">
          🥑
        </AppText>
        <div className="stack stack--sm">
          <AppText variant="title" align="center">
            Welcome to SnapNutri
          </AppText>
          <AppText variant="body" color="secondary" align="center">
            Six quick questions and we'll build your daily targets. No clipboards, we promise.
          </AppText>
        </div>
        <div className="stack stack--md stack--stretch">
          {PERKS.map((perk) => (
            <Card key={perk.emoji} tone="muted" padding="sm">
              <div className="row">
                <AppText as="span" variant="subtitle">
                  {perk.emoji}
                </AppText>
                <AppText as="span" variant="body">
                  {perk.text}
                </AppText>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
}
