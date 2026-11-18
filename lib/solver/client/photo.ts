import { SolverError } from '../errors';
import { LIMITS } from '../limits';

export interface Photo {
  blob: Blob;
  url: string;
  name: string;
}

const QUALITIES = [0.9, 0.82, 0.72, 0.6] as const;

function toBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * Re-encodes a user photo as a JPEG no larger than the upload limit. Drawing through a
 * canvas also drops EXIF metadata such as GPS location before anything leaves the device.
 */
export async function preparePhoto(file: Blob, name = 'photo.jpg'): Promise<Photo> {
  if (!file.type.startsWith('image/')) throw new SolverError('image_type');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new SolverError('image_type');
  }

  const scale = Math.min(1, LIMITS.imageMaxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new SolverError('internal');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of QUALITIES) {
    const blob = await toBlob(canvas, quality);
    if (blob && blob.size <= LIMITS.imageBytes) {
      return { blob, url: URL.createObjectURL(blob), name };
    }
  }
  throw new SolverError('image_too_large');
}

export function releasePhoto(photo: Photo | null) {
  if (photo) URL.revokeObjectURL(photo.url);
}
