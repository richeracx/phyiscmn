import 'server-only';
import type { Lang } from '@/lib/i18n';
import { SolverError } from '../errors';
import { IMAGE_TYPES, LIMITS, type ImageType } from '../limits';
import { config } from './config';

export interface SolveInput {
  problem: string;
  lang: Lang;
  image?: { data: Buffer; mimeType: ImageType };
}

/** Rejects cross-site calls: the endpoint only serves this site's own pages. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || (site && site !== 'same-origin')) throw new SolverError('forbidden');

  const allowed = config.allowedOrigins();
  if (allowed.length > 0) {
    if (!allowed.includes(origin)) throw new SolverError('forbidden');
    return;
  }
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new SolverError('forbidden');
  }
  if (!host || originHost !== host) throw new SolverError('forbidden');
}

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return request.headers.get('x-real-ip')?.trim() || forwarded || 'unknown';
}

const MAGIC: ReadonlyArray<{ type: ImageType; matches: (b: Buffer) => boolean }> = [
  { type: 'image/jpeg', matches: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    type: 'image/png',
    matches: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    type: 'image/webp',
    matches: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
];

/** Identifies the image by its bytes, never by the client-declared type or file name. */
function sniffImage(data: Buffer): ImageType | undefined {
  return MAGIC.find((entry) => entry.matches(data))?.type;
}

export async function readSolveInput(request: Request): Promise<SolveInput> {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > LIMITS.requestBytes) throw new SolverError('request_too_large');
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) throw new SolverError('bad_request');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new SolverError('bad_request');
  }

  const problemField = form.get('problem');
  const langField = form.get('lang');
  const imageField = form.get('image');

  if (problemField !== null && typeof problemField !== 'string') throw new SolverError('bad_request');
  const rawProblem = (problemField ?? '').replace(/\r\n/g, '\n').trim();
  // Strip null bytes and unprintable control characters to prevent injection/buffer attacks
  const problem = rawProblem.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (problem.length > LIMITS.problemChars) throw new SolverError('text_too_long');

  const lang: Lang = langField === 'tr' ? 'tr' : 'en';

  let image: SolveInput['image'];
  if (imageField !== null) {
    if (!(imageField instanceof File)) throw new SolverError('bad_request');
    if (imageField.size > LIMITS.imageBytes) throw new SolverError('image_too_large');
    if (imageField.size > 0) {
      const data = Buffer.from(await imageField.arrayBuffer());
      const mimeType = sniffImage(data);
      if (!mimeType || !IMAGE_TYPES.includes(mimeType)) throw new SolverError('image_type');
      image = { data, mimeType };
    }
  }

  if (!problem && !image) throw new SolverError('empty_input');
  return { problem, lang, image };
}
