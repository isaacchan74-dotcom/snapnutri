import { localDayKey } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { CoachAskInput } from '../types/coach';

export type CoachGuardKind = 'quota' | 'content_blocked';

export class CoachGuardError extends Error {
  readonly kind: CoachGuardKind;

  constructor(kind: CoachGuardKind, message: string) {
    super(message);
    this.name = 'CoachGuardError';
    this.kind = kind;
  }
}

export async function askCoach(input: CoachAskInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string; code?: string }>(
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
    const body = await readErrorPayload(error);
    throw guardOrFriendly(body?.error || error.message, body?.code);
  }

  if (data?.code === 'quota' || data?.code === 'content_blocked') {
    throw new CoachGuardError(data.code, data.error || defaultGuardMessage(data.code));
  }

  if (!data?.reply?.trim()) {
    throw new Error(data?.error ? friendlyCoachError(data.error) : 'The coach came back empty.');
  }

  return data.reply.trim();
}

async function readErrorPayload(error: unknown): Promise<{ error?: string; code?: string } | null> {
  const context = (error as { context?: unknown }).context;
  if (!(context instanceof Response)) return null;
  try {
    return (await context.clone().json()) as { error?: string; code?: string };
  } catch {
    return null;
  }
}

function defaultGuardMessage(kind: CoachGuardKind): string {
  return kind === 'quota'
    ? "You've reached today's AI limit — come back tomorrow"
    : 'I only help with nutrition and fitness. Try a question about meals, goals, or how your day looks.';
}

function guardOrFriendly(message: string, code?: string): Error {
  if (code === 'quota' || code === 'content_blocked') {
    return new CoachGuardError(code, message || defaultGuardMessage(code));
  }
  const lower = message.toLowerCase();
  if (lower.includes("today's ai limit") || lower.includes('come back tomorrow')) {
    return new CoachGuardError('quota', message);
  }
  if (lower.includes('only help with nutrition')) {
    return new CoachGuardError('content_blocked', message);
  }
  return new Error(friendlyCoachError(message));
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
