import type { Metadata, Viewport } from 'next';
import { display, inter, mono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physicsmn — Physics, solved with rigor',
  description:
    'Type or photograph a physics problem. Physicsmn returns a complete, unit-checked derivation in the MEB high-school style.',
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
