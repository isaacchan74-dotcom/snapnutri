# SnapNutri

An AI nutrition coach for college students: photograph a meal, get a visual food journal.

**Stage 1 of a staged build.** What exists today: the design system, auth, onboarding with
personalised target calculation, and the Profile screen. Camera, AI analysis, journal, dashboard,
and the character system come in later stages.

## Running it

```bash
npm install
cp .env.example .env    # then fill in your Supabase URL + anon key
npm start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator. Until `.env` has real
credentials the app shows a setup screen instead of the login form.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy the Project URL and the `anon` public key into `.env`.
3. **SQL Editor**: run [`supabase/schema.sql`](supabase/schema.sql) to create the `profiles`
   table, its row level security policies, and the signup trigger.
4. **Authentication → Providers → Email**: for faster local testing, turn off "Confirm email".

## Project layout

```
src/
  api/          Supabase queries (profiles)
  components/   Token-driven base components (Button, Card, ScreenContainer, …)
  constants/    Onboarding option copy and input limits
  lib/          Supabase client, env, nutrition math, unit conversions
  navigation/   Root gate + auth / onboarding / tab navigators
  screens/      auth · onboarding · main (Camera, Journal, Dashboard, Profile)
  store/        Zustand stores (auth, onboarding draft, theme)
  theme/        Design tokens, palettes, ThemeProvider
  types/        Shared domain types
supabase/       schema.sql
```

## Design system

Everything visual is a token. **No screen or component defines a raw colour, spacing value, font
size, or radius** — they all read from `useTheme()`. To restyle the whole app, edit two files:

- `src/theme/tokens.ts` — spacing, radii, font sizes, typography presets, layout measurements.
  These are identical across all themes.
- `src/theme/palettes.ts` — the colour set for each mode. Three modes ship: `light`, `dark`,
  and `blue`. Every palette must define every key, which is what keeps modes swappable.

The active mode lives in `useThemeStore` and persists to AsyncStorage. Users switch it from
**Profile → Appearance**.

## Target calculation

`src/lib/nutrition.ts` turns onboarding answers into daily targets:

1. **BMR** — Mifflin-St Jeor: `10 × kg + 6.25 × cm − 5 × age + (male: +5 / female: −161)`.
2. **TDEE** — BMR × activity multiplier (1.2 sedentary → 1.9 athlete).
3. **Calories** — TDEE × goal factor (lose 0.8, maintain 1.0, gain 1.12), floored at 1500 kcal
   for men and 1200 for women so an aggressive deficit can't produce an unsafe number.
4. **Macros** — protein from bodyweight (1.6–2.0 g/kg depending on goal, capped at 40% of
   calories), fat at 27% of calories with a 0.5 g/kg floor, carbs take the remainder.

Heights are stored in centimetres and weights in kilograms; the UI converts for ft/in and lb.

## Navigation gating

`RootNavigator` picks one of four states: setup screen (no Supabase credentials), auth stack
(no session), onboarding stack (session but no completed profile), or the tab app. "Completed"
means every measurement plus a calorie target is present on the profile row, so returning users
skip onboarding automatically.
