import { supabase } from '../lib/supabase';
import type { Coords, Place } from '../types/snap';

export type NearbyPlace = { name: string; distance: number };

/**
 * Restaurants and cafes around a point, nearest first.
 * The lookup runs in the Edge Function so the map provider can change without a new app build.
 */
export async function fetchNearbyPlaces(coords: Coords): Promise<NearbyPlace[]> {
  const { data, error } = await supabase.functions.invoke<{ places?: unknown }>('analyze-meal', {
    body: { mode: 'nearby', lat: coords.lat, lon: coords.lon },
  });
  if (error) throw new Error('Nearby places are not available right now. Use Search to enter a place.');
  if (!Array.isArray(data?.places)) return [];
  return data.places
    .filter(
      (item): item is NearbyPlace =>
        !!item && typeof (item as NearbyPlace).name === 'string' && typeof (item as NearbyPlace).distance === 'number',
    )
    .slice(0, 8);
}

const KEY = 'snapnutri-places-v1';
const MAX_RECENT = 10;

function readAll(): Record<string, Place[]> {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown;
    return data && typeof data === 'object' ? (data as Record<string, Place[]>) : {};
  } catch {
    return {};
  }
}

/** Places this user picked before, newest first. Kept on this device only. */
export function recentPlaces(userId: string | undefined): Place[] {
  const places = userId ? readAll()[userId] : undefined;
  return Array.isArray(places) ? places.filter((place) => place && typeof place.name === 'string') : [];
}

export function rememberPlace(userId: string | undefined, place: Place | undefined): void {
  if (!userId || !place || place.type === 'home') return;
  const all = readAll();
  const others = recentPlaces(userId).filter((item) => item.name.toLowerCase() !== place.name.toLowerCase());
  all[userId] = [place, ...others].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: recent places are a convenience only.
  }
}
