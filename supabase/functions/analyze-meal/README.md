# analyze-meal Edge Function

The Snap tab sends a compressed meal photo here. This function calls OpenAI
(`gpt-4o-mini`, image `detail: "low"`). The API key is a **Supabase secret** —
never a `VITE_` variable, never in the git repo.

## Deploy (PowerShell)

From the repo root (`SnapNutri App`):

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy analyze-meal
npx supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

`YOUR_PROJECT_REF` is the subdomain in your Supabase URL
(`https://YOUR_PROJECT_REF.supabase.co`).

Paste the OpenAI key yourself on that last command. Do not commit it.

The function reads `OPENAI_API_KEY` immediately after you set the secret — no
second deploy is required.

## Check

```powershell
npx supabase secrets list
npx supabase functions list
```

## What the app sends

Signed-in users only (JWT required).

**Snap analyze**

```json
{ "image": "data:image/jpeg;base64,..." }
```

Snap analyze also returns a short `description` of the dish, which pre-fills the Description field on the meal form.

**Meal insight** — sent once, right after a meal is saved (photo or manual).

```json
{ "mode": "insight", "meal_id": "uuid-of-the-saved-meal", "timezone_offset_minutes": 420 }
```

The function loads that meal, the caller's goal and targets, and that day's other meals, then asks
`gpt-4o-mini` (text only, no image) for a short summary plus 1–2 suggestions. The result is saved
to `meals.ai_insight`. If the meal already has one, the stored copy is returned and OpenAI is not
called, so each meal costs at most one text call. Requires `supabase/meal-insights.sql`.

There is no chat mode. The OpenAI key never leaves the function. After code changes:

```powershell
npx supabase functions deploy analyze-meal
```
