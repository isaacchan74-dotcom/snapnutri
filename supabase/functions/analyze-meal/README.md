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

**AI Coach** — same function, same secret. Redeploy after pulling this update.

```json
{
  "mode": "coach",
  "message": "What did I eat today?",
  "history": [{ "role": "user", "content": "..." }],
  "photo": null,
  "local_day": "2026-10-12",
  "timezone_offset_minutes": 420
}
```

Coach mode loads the caller's meals and targets from Supabase (today, yesterday, last 7 days). The OpenAI key never leaves the function. After code changes:

```powershell
npx supabase functions deploy analyze-meal
```
