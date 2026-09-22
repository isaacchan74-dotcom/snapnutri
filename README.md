# SnapNutri

An AI nutrition coach for college students: photograph a meal, get a visual food journal.

**Stage 1 of a staged build.** What exists today: the design system, auth, onboarding with
personalised target calculation, and the Profile screen. Camera, AI analysis, journal, dashboard,
and the character system come in later stages.

This is a **mobile-first React web app** (Vite + TypeScript). It looks like a phone app in the
browser and can deploy free to Vercel.

## Preview it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Supabase

Keys live in `.env` as `VITE_` variables (see `.env.example`). `.env` is gitignored.

1. Project Settings → API: Project URL + publishable key (`sb_publishable_…`).
2. SQL Editor: run [`supabase/schema.sql`](supabase/schema.sql) if the `profiles` table is not
   already there.
3. For faster local testing, turn off **Authentication → Providers → Email → Confirm email**.

## Design system

Everything visual is a token. Screens and components use CSS variables (`var(--color-primary)`,
`var(--space-lg)`, …) that are injected from `src/theme`. To restyle the whole app, edit:

- `src/theme/tokens.ts` — spacing, radii, font sizes, typography, layout
- `src/theme/palettes.ts` — colour sets for `light`, `dark`, and `blue`

The active mode lives in Zustand and persists to `localStorage`. Switch it from
**Profile → Appearance**.

## Target calculation

`src/lib/nutrition.ts`:

1. **BMR** — Mifflin-St Jeor: `10 × kg + 6.25 × cm − 5 × age + (male: +5 / female: −161)`
2. **TDEE** — BMR × activity multiplier (1.2 → 1.9)
3. **Calories** — TDEE × goal factor (lose 0.8, maintain 1.0, gain 1.12), floored at 1500 / 1200
4. **Macros** — protein from bodyweight, fat at 27% of calories, carbs take the remainder

Heights are stored in centimetres and weights in kilograms.

## Deploy to Vercel

Connect this GitHub repo. Vercel will run `vite build` and serve `dist`. `vercel.json` already
rewrites all routes to `index.html` so React Router works. Add the same two `VITE_` env vars in
the Vercel project settings.
