/**
 * Until supabase/journal-and-pet.sql is run, the prototype-only fields
 * (meal type, foods, drafts, name, preferences, Pika's progress) live in
 * this browser so the app stays fully clickable. Once the tables exist,
 * everything is read from and written to Supabase instead.
 */
const KEY = 'snapnutri-preview-v1';

type PreviewData = {
  meals: Record<string, Record<string, unknown>>;
  profiles: Record<string, Record<string, unknown>>;
  pets: Record<string, Record<string, unknown>>;
};

function read(): PreviewData {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<PreviewData>;
    return { meals: data.meals ?? {}, profiles: data.profiles ?? {}, pets: data.pets ?? {} };
  } catch {
    return { meals: {}, profiles: {}, pets: {} };
  }
}

function write(data: PreviewData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: keep working in memory for this session.
  }
}

export function previewGet(table: keyof PreviewData, id: string): Record<string, unknown> | undefined {
  return read()[table][id];
}

export function previewSet(table: keyof PreviewData, id: string, patch: Record<string, unknown>): Record<string, unknown> {
  const data = read();
  data[table][id] = { ...(data[table][id] ?? {}), ...patch };
  write(data);
  return data[table][id];
}

export function previewDelete(table: keyof PreviewData, id: string): void {
  const data = read();
  delete data[table][id];
  write(data);
}

/** True when Supabase rejected a column or table that journal-and-pet.sql adds. */
export function isMissingSchema(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    (lower.includes('column') || lower.includes('could not find') || lower.includes('does not exist') || lower.includes('schema cache')) &&
    /display_name|night_mode|reminders|meal_type|foods|portion|shared_with|vegetable_servings|reviewed|pet_progress/.test(lower)
  );
}
