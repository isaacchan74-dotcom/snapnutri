import { AppText, Card, ScreenContainer } from '../components';

const STEPS = [
  'Create a project at supabase.com and open Project Settings → API.',
  'Copy the Project URL and the publishable key (sb_publishable_…).',
  'Paste them into a .env file in the project root as VITE_ vars (see .env.example).',
  'Run the SQL in supabase/schema.sql in the Supabase SQL editor if you have not already.',
  'Restart the dev server with `npm run dev`.',
];

export function SetupRequiredScreen() {
  return (
    <ScreenContainer
      eyebrow="Almost there"
      title="Connect Supabase 🔌"
      subtitle="SnapNutri needs a backend before you can sign up."
    >
      <div className="stack stack--md">
        {STEPS.map((step, index) => (
          <Card key={step} tone="muted" padding="sm">
            <div className="row">
              <AppText as="span" variant="bodyStrong" color="brand">
                {index + 1}.
              </AppText>
              <AppText as="span" variant="body">
                {step}
              </AppText>
            </div>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
}
