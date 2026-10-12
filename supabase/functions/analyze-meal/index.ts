import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MODEL = 'gpt-4o-mini';
const MAX_IMAGE_CHARS = 1_800_000;

const SYSTEM_PROMPT = `You are SnapNutri's meal photo analyst.
Return ONLY JSON with this shape:
{
  "needs_retake": boolean,
  "reason": string or null,
  "confidence": number between 0 and 1,
  "food_name": string or null,
  "calories": number or null,
  "protein": number or null,
  "carbs": number or null,
  "fat": number or null
}

Rules:
- If the image is blurry, dark, empty, a screenshot, a person, a room, or not a meal, set needs_retake true, give a short friendly reason, and null the food fields.
- If you cannot identify the food with reasonable confidence (under 0.55), set needs_retake true.
- Otherwise estimate a single meal portion for a college student. Integers for calories, one decimal for macros.
- food_name should be short and specific (e.g. "Dining hall burrito").
- Do not invent drinks or sides you cannot see.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Use POST.' }, 405);
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return json({ error: 'OPENAI_API_KEY is not set on this function.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnon) {
    return json({ error: 'Supabase environment is missing.' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json({ error: 'You need to be signed in to analyze a meal.' }, 401);
  }

  let image: unknown;
  try {
    const body = await req.json();
    image = body?.image;
  } catch {
    return json({ error: 'Send JSON with an image data URL.' }, 400);
  }

  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return json({ error: 'Send a data:image… payload.' }, 400);
  }

  if (image.length > MAX_IMAGE_CHARS) {
    return json({ error: 'That photo is too large. Try a closer, smaller snap.' }, 413);
  }

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 280,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this meal photo for a nutrition log.' },
            {
              type: 'image_url',
              image_url: { url: image, detail: 'low' },
            },
          ],
        },
      ],
    }),
  });

  if (!openaiResponse.ok) {
    await openaiResponse.text();
    return json(
      {
        error:
          openaiResponse.status === 401
            ? 'OpenAI rejected the secret. Check OPENAI_API_KEY.'
            : 'The vision model could not read that photo.',
      },
      502,
    );
  }

  const completion = await openaiResponse.json();
  const raw = completion?.choices?.[0]?.message?.content;
  const parsed = parseModelJson(raw);
  return json(parsed, 200);
});

function parseModelJson(raw: unknown) {
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(typeof raw === 'string' ? raw : '{}') as Record<string, unknown>;
  } catch {
    return retake('Could not read that photo. Try better light.');
  }

  const confidence = clamp01(Number(data.confidence));
  const needsRetake =
    data.needs_retake === true ||
    confidence < 0.55 ||
    typeof data.food_name !== 'string' ||
    !data.food_name.trim();

  if (needsRetake) {
    return retake(
      typeof data.reason === 'string' && data.reason.trim()
        ? data.reason.trim()
        : 'That snap is too unclear. Get closer to the plate and try again.',
      confidence,
    );
  }

  return {
    needs_retake: false,
    reason: null,
    confidence,
    food_name: String(data.food_name).trim().slice(0, 80),
    calories: wholeNumber(data.calories),
    protein: macroNumber(data.protein),
    carbs: macroNumber(data.carbs),
    fat: macroNumber(data.fat),
  };
}

function retake(reason: string, confidence = 0) {
  return {
    needs_retake: true,
    reason,
    confidence,
    food_name: null,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  };
}

function wholeNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}

function macroNumber(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 10) / 10;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}
