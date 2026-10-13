import { localDayKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { CoachAskInput } from '../types/coach';

export async function askCoach(input: CoachAskInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>(
    'analyze-meal',
    {
      body: {
        mode: 'coach',
        persona: 'pika',
        message: input.message,
        history: input.history,
        photo: input.photo ?? null,
        local_day: localDayKey(new Date()),
        timezone_offset_minutes: new Date().getTimezoneOffset(),
      },
    },
  );

  if (error) {
    // supabase-js keeps a failed function's JSON body on error.context, not data.
    const fromBody = await readErrorBody(error);
    throw new Error(friendlyCoachError(fromBody || error.message));
  }

  if (!data?.reply?.trim()) {
    throw new Error(data?.error ? friendlyCoachError(data.error) : 'The coach came back empty.');
  }

  return data.reply.trim();
}

async function readErrorBody(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown }).context;
  if (!(context instanceof Response)) return null;
  try {
    const body = (await context.clone().json()) as { error?: unknown };
    return typeof body.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}

function friendlyCoachError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('not found') || lower.includes('404') || lower.includes('data:image')) {
    return 'Pika’s chat is still waking up. Please try again a little later.';
  }
  if (lower.includes('authorization') || lower.includes('jwt') || lower.includes('401')) {
    return 'Your session expired. Log in again, then ask.';
  }
  if (lower.includes('openai') || lower.includes('api key')) {
    return 'The OpenAI secret is missing on Supabase. Set OPENAI_API_KEY, then try again.';
  }
  return message || 'Could not reach the coach.';
}
