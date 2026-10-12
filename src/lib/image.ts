const MAX_EDGE = 768;
const JPEG_QUALITY = 0.72;

/** Shrink a photo before it leaves the device so the Edge Function stays cheap. */
export async function fileToLowDetailDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Could not prepare that photo.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export function canvasToLowDetailDataUrl(video: HTMLVideoElement): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
  const width = Math.max(1, Math.round(video.videoWidth * scale));
  const height = Math.max(1, Math.round(video.videoHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not capture that frame.');

  context.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
