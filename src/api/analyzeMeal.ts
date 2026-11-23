import { supabase } from '../lib/supabase';
import type { AnalyzeMealResult } from '../types/analyze';
import type { SnapDraft } from '../types/snap';

/** Sends the photo plus everything the user added on the details screen. */
export async function analyzeMealPhoto(imageDataUrl: string, draft?: SnapDraft): Promise<AnalyzeMealResult> {
  const product = draft?.product;
  const { data, error } = await supabase.functions.invoke<AnalyzeMealResult | { error?: string }>(
    'analyze-meal',
    {
      body: {
        image: imageDataUrl,
        ...(draft?.label ? { label: draft.label } : {}),
        ...(draft && draft.servings !== 1 ? { servings: draft.servings } : {}),
        ...(draft?.notes.trim() ? { notes: draft.notes.trim() } : {}),
        ...(draft?.place ? { place: draft.place.name, place_type: draft.place.type } : {}),
        ...(product
          ? {
              product: {
                name: product.name,
                brand: product.brand,
                basis: product.basis,
                serving_size: product.servingSize,
                calories: product.calories,
                protein: product.protein,
                carbs: product.carbs,
                fat: product.fat,
              },
            }
          : {}),
      },
    },
  );

  if (error) {
    const context = (error as { context?: unknown }).context;
    let fromBody: string | null = null;
    if (context instanceof Response) {
      const body = (await context.clone().json().catch(() => null)) as { error?: unknown } | null;
      fromBody = typeof body?.error === 'string' ? body.error : null;
    }
    throw new Error(friendlyInvokeError(fromBody || error.message));
  }

  if (!data || typeof data !== 'object' || !('needs_retake' in data)) {
    throw new Error('The analyzer returned an empty response.');
  }

  return data as AnalyzeMealResult;
}

function friendlyInvokeError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('not found') || lower.includes('404')) {
    return 'The analyze-meal Edge Function is not deployed yet. Follow the steps in supabase/functions/analyze-meal/README.md.';
  }
  if (lower.includes('authorization') || lower.includes('jwt') || lower.includes('401')) {
    return 'Your session expired. Log in again, then snap.';
  }
  if (lower.includes('openai') || lower.includes('api key') || lower.includes('401')) {
    return 'The OpenAI secret is missing on Supabase. Set OPENAI_API_KEY, then try again.';
  }
  if (lower.includes("today's ai limit") || lower.includes('come back tomorrow')) {
    return "You've reached today's AI limit — come back tomorrow";
  }
  return message || 'Could not analyze that photo.';
}
