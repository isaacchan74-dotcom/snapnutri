import { localDayKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { CoachAskInput } from '../types/coach';

export async function askCoach(input: CoachAskInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>(
    'analyze-meal',
    {
      body: {
        mode: 'coach',
        message: input.message,
        history: input.history,
        photo: input.photo ?? null,
        local_day: localDayKey(new Date()),
        timezone_offset_minutes: new Date().getTimezoneOffset(),
      },
    },
  );

  if (error) {
    const fromBody = data && typeof data === 'object' && 'error' in data ? data.error : null;
    throw new Error(friendlyCoachError(fromBody || error.message));
  }

  if (!data?.reply?.trim()) {
    throw new Error(data?.error ? friendlyCoachError(data.error) : 'The coach came back empty.');
  }

  return data.reply.trim();
}

function friendlyCoachError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('not found') ||
    lower.includes('404') ||
    lower.includes('non-2xx') ||
    lower.includes('data:image')
  ) {
    return 'Redeploy the analyze-meal Edge Function so Coach mode is live. Same OPENAI_API_KEY as Snap.';
  }
  if (lower.includes('authorization') || lower.includes('jwt') || lower.includes('401')) {
    return 'Your session expired. Log in again, then ask.';
  }
  if (lower.includes('openai') || lower.includes('api key')) {
    return 'The OpenAI secret is missing on Supabase. Set OPENAI_API_KEY, then try again.';
  }
  return message || 'Could not reach the coach.';
}
