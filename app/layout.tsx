import type { Metadata, Viewport } from 'next';
import { display, inter, mono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physicsmn — AI-Assisted High School Physics Solver',
  description:
    'Type or photograph high school physics problems. Physicsmn generates step-by-step LaTeX derivations aligned with the MEB curriculum for students to review and verify.',
  openGraph: {
    title: 'Physicsmn — AI-Assisted High School Physics Solver',
    description:
      'Type or photograph high school physics problems. Physicsmn generates step-by-step LaTeX derivations aligned with the MEB curriculum for students to review and verify.',
    type: 'website',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

/*
 * html/body margin, padding, #000 background, #F5F5F7 text and horizontal
 * overflow clipping are enforced in globals.css (kept out of inline styles so the
 * `overflow-x: clip` upgrade can keep `position: sticky` working).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
