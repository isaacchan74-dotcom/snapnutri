import type { Coords } from '../types/snap';

function valid(lat: unknown, lon: unknown): Coords | undefined {
  if (typeof lat !== 'number' || typeof lon !== 'number') return undefined;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || (lat === 0 && lon === 0)) return undefined;
  return { lat, lon };
}

/**
 * Where an uploaded photo was taken, from its EXIF data.
 * Must run on the original file: resizing through a canvas drops EXIF.
 * Phones often strip location when a web page picks a photo, so this is best-effort.
 */
export async function photoCoords(file: File): Promise<Coords | undefined> {
  try {
    const { gps } = await import('exifr');
    const found = await gps(file);
    return valid(found?.latitude, found?.longitude);
  } catch {
    return undefined;
  }
}

/** Asks the browser where the phone is right now. Shows the permission prompt on first use. */
export function deviceCoords(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This browser cannot share a location.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = valid(position.coords.latitude, position.coords.longitude);
        if (coords) resolve(coords);
        else reject(new Error('Could not read your location.'));
      },
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Location is turned off for this site. Use Search to enter a place.'
              : 'Could not find your location. Use Search to enter a place.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}
