export const LIMITS = {
  problemChars: 4000,
  imageBytes: 4 * 1024 * 1024,
  /** Vercel rejects function bodies above 4.5 MB. */
  requestBytes: 4.5 * 1024 * 1024,
  imageMaxEdge: 2048,
} as const;

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];
