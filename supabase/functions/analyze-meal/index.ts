import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MODEL = 'gpt-4o-mini';
const MAX_IMAGE_CHARS = 1_800_000;
const MAX_COACH_MESSAGE = 1_200;
const MAX_HISTORY = 12;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Keep in step with public.ai_daily_limit in supabase/ai-usage-limits.sql.
const DAILY_LIMITS = { snap: 20, coach: 40 } as const;

const ANALYZE_PROMPT = `You are SnapNutri's meal photo analyst.
Return ONLY JSON with this shape:
{
  "needs_retake": boolean,
  "reason": string or null,
  "confidence": number between 0 and 1,
  "food_name": string or null,
  "description": string or null,
  "foods": array of strings,
  "vegetable_servings": number,
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
- description is one short plain sentence (under 140 characters) about what you see: main items and rough portion (e.g. "Chicken burrito bowl with rice, black beans, and salsa."). Only mention what is visible.
- foods lists each visible item separately, short and specific, most prominent first (e.g. ["Chicken thigh", "Brown rice", "Broccoli"]). At most 6 items. Empty array when needs_retake is true.
- vegetable_servings estimates vegetables on the plate in standard servings (1 serving ≈ 1 cup raw leafy greens or ½ cup cooked vegetables), one decimal. 0 when there are none.
- Do not invent drinks or sides you cannot see.
- Write reason, food_name, description and every foods item in English only.`;

const INSIGHT_PROMPT = `You are SnapNutri's meal reviewer for college students.
You get ONE meal the user just logged, their goal, their daily targets, and what they have eaten that day.
Return ONLY JSON with this shape:
{
  "summary": string,
  "suggestions": [string]
}

Rules:
- summary: 1-2 short sentences. Say what the meal is and its rough nutrition quality (for example protein-rich, carb-heavy, light on veg, high in fat, well balanced). Use the logged numbers; never invent new ones.
- suggestions: 1 or 2 items. Each is one short, actionable sentence about the user's next choices, personalized to their goal and what is left of today's targets (for example "You still need about 60 g protein today, so make your next meal protein-first."). Include a number or name the goal when it makes the advice clearer.
- Follow the goal's priority (protein first for recomposition, carbs for athletic performance, reaching the surplus for building muscle, staying in a deficit with filling foods for weight loss, balance and variety for general health).
- If they are already over a target, say so plainly without shame and suggest a lighter next step.
- Under 70 words in total. No medical advice, no supplement lectures, no emojis. Sound like a sharp friend, not a textbook.`;

const COACH_PROMPT = `You are SnapNutri's Coach for college students.
Give short, punchy, useful nutrition advice using ONLY the log context you are given.
Rules:
- The context names the user's Goal, a Goal focus, and a Goal-priority check. Every recommendation must reflect that goal and their targets, not generic advice. Lead food suggestions with the goal's priority (for example protein first for recomposition, carbs for athletic performance, calories for a muscle-building surplus, fullness and a deficit for weight loss).
- When you suggest a meal, name the goal in a few words so it is clear why (for example "for your recomp, ...") and include rough numbers that close today's gap on the priority macro.
- Never invent meals, calories, or macros that are not in the log or clearly visible in an attached photo.
- If the log is empty, say so and invite them to Snap a plate or type a meal. Still answer generally if they want ideas.
- Use today / yesterday / last 7 days exactly as labeled in the context.
- For dinner or "what should I eat", compare today's totals to targets and suggest a plate that fills the gap. If they already blew past a target, say so without shame and suggest a lighter close.
- If a photo is attached, identify the food, rough portions, and how it fits today's remaining targets. This is conversational — do not pretend it was saved to the journal unless the log already has it.
- Not medical advice. No supplements lecture. Keep replies under 160 words.
- Talk like a sharp friend, not a textbook.
- Reply in the same language the user writes in.`;

// Opt-in voice for the prototype-v1 front end (body.persona === 'pika').
const PIKA_VOICE = `You are Pika, the gentle companion inside SnapNutri. Speak warmly and simply, in first person, like a kind friend. Never shame food choices.`;

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
    return json({ error: 'You need to be signed in to use Snap AI.' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Send JSON.' }, 400);
  }

  // Isaac's one-shot review of a logged meal (original app).
  if (body.mode === 'insight') {
    return mealInsight(supabase, user.id, openaiKey, body);
  }

  if (body.mode === 'coach') {
    return coachReply(supabase, user.id, openaiKey, body);
  }

  return analyzeMeal(supabase, openaiKey, body);
});

/** Counts one AI call against the user's daily quota. Returns a 429 response once it is used up. */
async function quotaExceeded(supabase: SupabaseClient, kind: keyof typeof DAILY_LIMITS): Promise<Response | null> {
  const { data, error } = await supabase.rpc('consume_ai_quota', { p_kind: kind });
  if (error) {
    // Quota table not installed yet: allow the call rather than break the app.
    console.error('consume_ai_quota failed:', error.message);
    return null;
  }
  if (data !== false) return null;
  return json(
    {
      error:
        kind === 'snap'
          ? `Pika needs a rest — you've used today's ${DAILY_LIMITS.snap} photo checks. Come back tomorrow, or add this meal manually.`
          : `Pika needs a rest — that's ${DAILY_LIMITS.coach} questions today. Let's talk again tomorrow.`,
    },
    429,
  );
}

async function analyzeMeal(supabase: SupabaseClient, openaiKey: string, body: Record<string, unknown>) {
  const image = body.image;

  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return json({ error: 'Send a data:image… payload.' }, 400);
  }

  if (image.length > MAX_IMAGE_CHARS) {
    return json({ error: 'That photo is too large. Try a closer, smaller snap.' }, 413);
  }

  const limited = await quotaExceeded(supabase, 'snap');
  if (limited) return limited;

  const completion = await completeChat(openaiKey, {
    temperature: 0.2,
    max_tokens: 420,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ANALYZE_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this meal photo for a nutrition log.' },
          { type: 'image_url', image_url: { url: image, detail: 'low' } },
        ],
      },
    ],
  });

  if (!completion.ok) return completion.response;
  return json(parseModelJson(completion.content), 200);
}

async function coachReply(
  supabase: SupabaseClient,
  userId: string,
  openaiKey: string,
  body: Record<string, unknown>,
) {
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return json({ error: 'Send a message.' }, 400);
  }
  if (message.length > MAX_COACH_MESSAGE) {
    return json({ error: 'Keep it a bit shorter so I can keep up.' }, 400);
  }

  const photo = typeof body.photo === 'string' && body.photo.startsWith('data:image/') ? body.photo : null;
  if (photo && photo.length > MAX_IMAGE_CHARS) {
    return json({ error: 'That photo is too large. Try a closer, smaller snap.' }, 413);
  }

  const localDay = typeof body.local_day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.local_day)
    ? body.local_day
    : utcDayKey(new Date());
  const offsetMinutes = Number(body.timezone_offset_minutes);
  const tzOffset = Number.isFinite(offsetMinutes) ? offsetMinutes : 0;

  const limited = await quotaExceeded(supabase, 'coach');
  if (limited) return limited;

  const context = await buildLogContext(supabase, userId, localDay, tzOffset);
  const history = sanitizeHistory(body.history);

  const userContent = photo
    ? [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: photo, detail: 'low' as const } },
      ]
    : message;

  const completion = await completeChat(openaiKey, {
    temperature: 0.5,
    max_tokens: 360,
    messages: [
      { role: 'system', content: COACH_PROMPT },
      ...(body.persona === 'pika' ? [{ role: 'system', content: PIKA_VOICE }] : []),
      { role: 'system', content: context },
      ...history,
      { role: 'user', content: userContent },
    ],
  });

  if (!completion.ok) return completion.response;

  const reply = completion.content.trim();
  if (!reply) {
    return json({ error: 'The coach came back empty. Try that again.' }, 502);
  }

  return json({ reply: reply.slice(0, 2_000) }, 200);
}

async function buildLogContext(
  supabase: SupabaseClient,
  userId: string,
  localDay: string,
  tzOffset: number,
) {
  const weekStart = shiftLocalDay(localDay, -6);
  const rangeStart = localDayStartUtc(weekStart, tzOffset);

  const loadMeals = (columns: string) =>
    supabase
      .from('meals')
      .select(columns)
      .eq('user_id', userId)
      .gte('logged_at', rangeStart.toISOString())
      .order('logged_at', { ascending: true });

  const [profileResult, withDescription] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'goal, activity_level, weight, daily_calorie_target, daily_protein_target, daily_carb_target, daily_fat_target',
      )
      .eq('id', userId)
      .maybeSingle(),
    loadMeals('food_name, description, foods, meal_type, calories, protein, carbs, fat, logged_at'),
  ]);

  // If the description column has not been added yet, fall back to the original columns.
  const mealResult = withDescription.error
    ? await loadMeals('food_name, calories, protein, carbs, fat, logged_at')
    : withDescription;

  const profile = profileResult.data;
  const meals = ((mealResult.data ?? []) as unknown) as MealLog[];
  const yesterday = shiftLocalDay(localDay, -1);

  const todayMeals = meals.filter((meal) => localKey(meal.logged_at, tzOffset) === localDay);
  const yesterdayMeals = meals.filter((meal) => localKey(meal.logged_at, tzOffset) === yesterday);

  const weekLines = Array.from({ length: 7 }, (_, index) => {
    const key = shiftLocalDay(weekStart, index);
    const dayMeals = meals.filter((meal) => localKey(meal.logged_at, tzOffset) === key);
    const totals = sumMeals(dayMeals);
    const label = key === localDay ? 'Today' : key === yesterday ? 'Yesterday' : key;
    if (dayMeals.length === 0) return `- ${label}: no meals logged`;
    return `- ${label}: ${dayMeals.length} meal(s) · ${Math.round(totals.calories)} kcal · P ${round1(totals.protein)} C ${round1(totals.carbs)} F ${round1(totals.fat)}`;
  });

  const todayTotals = sumMeals(todayMeals);
  const weekTotals = sumMeals(meals);
  const targets = {
    calories: numberOrNull(profile?.daily_calorie_target),
    protein: numberOrNull(profile?.daily_protein_target),
    carbs: numberOrNull(profile?.daily_carb_target),
    fat: numberOrNull(profile?.daily_fat_target),
  };

  const goalKey = typeof profile?.goal === 'string' ? profile.goal : '';
  const goal = GOAL_GUIDE[goalKey];
  const loggedDays = weekLines.filter((line) => !line.endsWith('no meals logged')).length;

  return [
    `User local day: ${localDay}.`,
    goal
      ? `Goal: ${goal.label}.`
      : 'Goal: not set. Give balanced advice and suggest they pick a goal in Profile.',
    goal ? `Goal focus: ${goal.focus}` : '',
    goal
      ? `Goal-priority check (${goal.priorityLabel}): ${formatPriority(goal.priority, todayTotals, targets)}.`
      : '',
    typeof profile?.activity_level === 'string' ? `Activity level: ${profile.activity_level}.` : '',
    numberOrNull(profile?.weight) != null ? `Weight: ${numberOrNull(profile?.weight)} kg.` : '',
    `Daily targets: ${formatTargets(targets)}.`,
    `Today remaining vs targets: ${formatRemaining(todayTotals, targets)}.`,
    '',
    `TODAY (${localDay}):`,
    formatMealList(todayMeals, tzOffset),
    `Today totals: ${formatTotals(todayTotals)}.`,
    '',
    `YESTERDAY (${yesterday}):`,
    formatMealList(yesterdayMeals, tzOffset),
    '',
    'LAST 7 DAYS:',
    ...weekLines,
    `Week totals: ${formatTotals(weekTotals)}.`,
    loggedDays > 0
      ? `Average per logged day (${loggedDays} day(s)): ${formatTotals(divideTotals(weekTotals, loggedDays))}. Compare to daily targets above.`
      : '',
    meals.length === 0
      ? 'The journal is empty for this range. Do not invent any logged food.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * One-shot summary + suggestions for a single logged meal.
 * The result is stored on the meal row; later calls return the stored copy
 * instead of calling OpenAI again, so each meal costs at most one text call.
 */
async function mealInsight(
  supabase: SupabaseClient,
  userId: string,
  openaiKey: string,
  body: Record<string, unknown>,
) {
  const mealId = typeof body.meal_id === 'string' ? body.meal_id : '';
  if (!UUID_PATTERN.test(mealId)) {
    return json({ error: 'Send the meal_id of a logged meal.' }, 400);
  }

  const offsetMinutes = Number(body.timezone_offset_minutes);
  const tzOffset = Number.isFinite(offsetMinutes) ? offsetMinutes : 0;

  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select('id, food_name, description, calories, protein, carbs, fat, logged_at, ai_insight')
    .eq('id', mealId)
    .eq('user_id', userId)
    .maybeSingle();

  if (mealError) {
    return json({ error: setupMessage(mealError.message) }, 500);
  }
  if (!meal) {
    return json({ error: 'That meal is not in your journal.' }, 404);
  }

  const stored = readInsight(meal.ai_insight);
  if (stored) {
    return json(stored, 200);
  }

  const day = localKey(meal.logged_at, tzOffset);
  const dayStart = localDayStartUtc(day, tzOffset);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);

  const [profileResult, dayResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'goal, activity_level, weight, daily_calorie_target, daily_protein_target, daily_carb_target, daily_fat_target',
      )
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('meals')
      .select('food_name, calories, protein, carbs, fat, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', dayStart.toISOString())
      .lt('logged_at', dayEnd.toISOString())
      .order('logged_at', { ascending: true }),
  ]);

  const context = buildInsightContext(
    meal as MealLog,
    (dayResult.data ?? []) as MealLog[],
    profileResult.data,
  );

  const completion = await completeChat(openaiKey, {
    temperature: 0.4,
    max_tokens: 220,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: INSIGHT_PROMPT },
      { role: 'user', content: context },
    ],
  });

  if (!completion.ok) return completion.response;

  const insight = parseInsight(completion.content);
  if (!insight) {
    return json({ error: 'The AI came back empty on that meal. Try again.' }, 502);
  }

  const { data: saved, error: saveError } = await supabase
    .from('meals')
    .update({ ai_insight: insight })
    .eq('id', mealId)
    .is('ai_insight', null)
    .select('ai_insight')
    .maybeSingle();

  if (saveError) {
    return json({ error: setupMessage(saveError.message) }, 500);
  }

  // A parallel request may have stored its insight first; keep that one.
  return json(readInsight(saved?.ai_insight) ?? insight, 200);
}

function buildInsightContext(
  meal: MealLog,
  dayMeals: MealLog[],
  profile: Record<string, unknown> | null,
): string {
  const targets = {
    calories: numberOrNull(profile?.daily_calorie_target),
    protein: numberOrNull(profile?.daily_protein_target),
    carbs: numberOrNull(profile?.daily_carb_target),
    fat: numberOrNull(profile?.daily_fat_target),
  };
  const totals = sumMeals(dayMeals);
  const goal = GOAL_GUIDE[typeof profile?.goal === 'string' ? profile.goal : ''];
  const description =
    typeof meal.description === 'string' && meal.description.trim()
      ? meal.description.trim().slice(0, 200)
      : 'none given';

  return [
    'JUST LOGGED:',
    `- ${meal.food_name} (${description})`,
    `- ${formatTotals(sumMeals([meal]))}`,
    '',
    goal ? `Goal: ${goal.label}.` : 'Goal: not set. Give balanced advice.',
    goal ? `Goal focus: ${goal.focus}` : '',
    goal
      ? `Goal-priority check (${goal.priorityLabel}): ${formatPriority(goal.priority, totals, targets)}.`
      : '',
    typeof profile?.activity_level === 'string' ? `Activity level: ${profile.activity_level}.` : '',
    numberOrNull(profile?.weight) != null ? `Weight: ${numberOrNull(profile?.weight)} kg.` : '',
    `Daily targets: ${formatTargets(targets)}.`,
    '',
    `THAT DAY SO FAR (${dayMeals.length} meal(s), including this one): ${formatTotals(totals)}.`,
    `Remaining vs targets: ${formatRemaining(totals, targets)}.`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

type MealInsight = {
  summary: string;
  suggestions: string[];
  generated_at: string;
};

function parseInsight(raw: unknown): MealInsight | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(typeof raw === 'string' ? raw : '{}') as Record<string, unknown>;
  } catch {
    return null;
  }

  const summary = typeof data.summary === 'string' ? data.summary.trim().slice(0, 320) : '';
  const suggestions = Array.isArray(data.suggestions)
    ? data.suggestions
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 2)
        .map((item) => item.trim().slice(0, 220))
    : [];

  if (!summary || suggestions.length === 0) return null;
  return { summary, suggestions, generated_at: new Date().toISOString() };
}

function readInsight(value: unknown): MealInsight | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.summary !== 'string' || !Array.isArray(row.suggestions)) return null;
  return {
    summary: row.summary,
    suggestions: row.suggestions.filter((item): item is string => typeof item === 'string'),
    generated_at: typeof row.generated_at === 'string' ? row.generated_at : '',
  };
}

function setupMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('ai_insight') || lower.includes('description')) {
    return 'Meal insights need a quick database update. Run supabase/meal-insights.sql in the SQL editor.';
  }
  return message;
}

type Priority = 'calories' | 'protein' | 'carbs' | 'balanced';

type GoalGuide = {
  label: string;
  focus: string;
  priority: Priority;
  priorityLabel: string;
};

// Keep in step with GOAL_PLANS in src/lib/nutrition.ts.
const GOAL_GUIDE: Record<string, GoalGuide> = {
  lose: {
    label: 'Lose weight (steady deficit)',
    focus:
      'Stay at or just under the calorie target without crash dieting. Keep protein high to protect muscle. Favor filling, high-volume foods.',
    priority: 'calories',
    priorityLabel: 'stay at or under calories, protein high',
  },
  maintain: {
    label: 'Maintain weight',
    focus: 'Land close to the calorie target with steady protein. Consistency beats perfection.',
    priority: 'calories',
    priorityLabel: 'land near calories',
  },
  gain: {
    label: 'Gain weight / build muscle (calorie surplus)',
    focus:
      'Hit the calorie target (under-eating is the usual miss) and high protein. Suggest easy calorie-dense additions.',
    priority: 'calories',
    priorityLabel: 'reach the surplus calories, protein high',
  },
  recomp: {
    label: 'Recomposition (lose fat and gain muscle)',
    focus:
      'Protein first at every meal. Keep calories near or slightly under target and do not under-eat on training days.',
    priority: 'protein',
    priorityLabel: 'protein first',
  },
  athletic: {
    label: 'Athletic performance / high activity',
    focus:
      'Carbs are the fuel: hit the carb target and time carbs around training. Protein supports recovery. Do not cut calories.',
    priority: 'carbs',
    priorityLabel: 'carbs first',
  },
  health: {
    label: 'General health / eat more balanced',
    focus:
      'Aim for variety, fiber, fruit and veg, and a balanced macro split. No obsessing over exact numbers.',
    priority: 'balanced',
    priorityLabel: 'balance and variety',
  },
};

type MealLog = {
  food_name: string;
  description?: string | null;
  foods?: unknown;
  meal_type?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
};

type Totals = { calories: number; protein: number; carbs: number; fat: number };

type Targets = { calories: number | null; protein: number | null; carbs: number | null; fat: number | null };

function formatMealList(meals: MealLog[], tzOffset: number): string {
  if (meals.length === 0) return '- none';
  return meals
    .map((meal) => {
      const time = localTime(meal.logged_at, tzOffset);
      const items = Array.isArray(meal.foods) ? meal.foods.filter((f) => typeof f === 'string') : [];
      const note =
        typeof meal.description === 'string' && meal.description.trim()
          ? ` (${meal.description.trim().slice(0, 140)})`
          : items.length
            ? ` (${items.join(', ').slice(0, 140)})`
            : '';
      const type = typeof meal.meal_type === 'string' && meal.meal_type ? `${meal.meal_type}: ` : '';
      return `- ${time} ${type}${meal.food_name}${note} · ${Math.round(Number(meal.calories) || 0)} kcal · P ${round1(meal.protein)} C ${round1(meal.carbs)} F ${round1(meal.fat)}`;
    })
    .join('\n');
}

function sumMeals(meals: MealLog[]): Totals {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + (Number(meal.calories) || 0),
      protein: totals.protein + (Number(meal.protein) || 0),
      carbs: totals.carbs + (Number(meal.carbs) || 0),
      fat: totals.fat + (Number(meal.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function divideTotals(totals: Totals, days: number): Totals {
  return {
    calories: totals.calories / days,
    protein: totals.protein / days,
    carbs: totals.carbs / days,
    fat: totals.fat / days,
  };
}

function formatPriority(
  priority: Priority,
  today: Totals,
  targets: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null },
): string {
  const left = (current: number, target: number | null, unit: string) => {
    if (target == null) return `${unit} target unknown`;
    const gap = Math.round((target - current) * 10) / 10;
    return gap >= 0 ? `${gap}${unit} still to go today` : `${Math.abs(gap)}${unit} over target today`;
  };

  switch (priority) {
    case 'protein':
      return left(today.protein, targets.protein, 'g protein');
    case 'carbs':
      return left(today.carbs, targets.carbs, 'g carbs');
    case 'calories':
      return `${left(today.calories, targets.calories, ' kcal')}; ${left(today.protein, targets.protein, 'g protein')}`;
    default:
      return `${left(today.calories, targets.calories, ' kcal')}; aim for a balanced mix, not one macro`;
  }
}

function formatTotals(totals: Totals): string {
  return `${Math.round(totals.calories)} kcal · P ${round1(totals.protein)} C ${round1(totals.carbs)} F ${round1(totals.fat)}`;
}

function formatTargets(targets: {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}): string {
  return `${targets.calories ?? '—'} kcal, ${targets.protein ?? '—'}g protein, ${targets.carbs ?? '—'}g carbs, ${targets.fat ?? '—'}g fat`;
}

function formatRemaining(
  today: Totals,
  targets: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null },
): string {
  const part = (current: number, target: number | null, unit: string) => {
    if (target == null) return `${unit} unknown`;
    const left = Math.round((target - current) * 10) / 10;
    if (left >= 0) return `${left}${unit} left`;
    return `${Math.abs(left)}${unit} over`;
  };
  return [
    part(today.calories, targets.calories, ' kcal'),
    part(today.protein, targets.protein, 'g protein'),
    part(today.carbs, targets.carbs, 'g carbs'),
    part(today.fat, targets.fat, 'g fat'),
  ].join(', ');
}

function sanitizeHistory(raw: unknown): { role: 'user' | 'assistant'; content: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is { role: 'user' | 'assistant'; content: string } => {
      if (!item || typeof item !== 'object') return false;
      const row = item as { role?: unknown; content?: unknown };
      return (row.role === 'user' || row.role === 'assistant') && typeof row.content === 'string';
    })
    .slice(-MAX_HISTORY)
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_COACH_MESSAGE),
    }))
    .filter((item) => item.content.length > 0);
}

async function completeChat(
  openaiKey: string,
  payload: Record<string, unknown>,
): Promise<{ ok: true; content: string } | { ok: false; response: Response }> {
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      ...payload,
    }),
  });

  if (!openaiResponse.ok) {
    await openaiResponse.text();
    return {
      ok: false,
      response: json(
        {
          error:
            openaiResponse.status === 401
              ? 'OpenAI rejected the secret. Check OPENAI_API_KEY.'
              : 'The AI could not answer just now.',
        },
        502,
      ),
    };
  }

  const completion = await openaiResponse.json();
  const content = completion?.choices?.[0]?.message?.content;
  return { ok: true, content: typeof content === 'string' ? content : '' };
}

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
    description:
      typeof data.description === 'string' ? data.description.trim().slice(0, 200) : '',
    foods: foodList(data.foods),
    vegetable_servings: macroNumber(data.vegetable_servings),
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
    description: null,
    foods: [],
    vegetable_servings: null,
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  };
}

function foodList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim().slice(0, 60))
    .slice(0, 6);
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

function numberOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftLocalDay(key: string, delta: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + delta));
  return next.toISOString().slice(0, 10);
}

function localDayStartUtc(localDay: string, tzOffsetMinutes: number): Date {
  const [year, month, day] = localDay.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day) + tzOffsetMinutes * 60_000);
}

function localKey(iso: string, tzOffsetMinutes: number): string {
  return new Date(new Date(iso).getTime() - tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

function localTime(iso: string, tzOffsetMinutes: number): string {
  const shifted = new Date(new Date(iso).getTime() - tzOffsetMinutes * 60_000);
  const hours = shifted.getUTCHours();
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
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
