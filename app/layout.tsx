import type { Metadata, Viewport } from 'next';
import { display, inter, mono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physicsmn — MEB Müfredatına Uygun Adım Adım Fizik Çözücü',
  description:
    'Lise fizik problemlerini yazın veya fotoğrafını yükleyin. Physicsmn, MEB müfredatına tam uyumlu, LaTeX formatında adım adım türetimler üretir.',
  openGraph: {
    title: 'Physicsmn — MEB Müfredatına Uygun Adım Adım Fizik Çözücü',
    description:
      'Lise fizik problemlerini yazın veya fotoğrafını yükleyin. Physicsmn, MEB müfredatına tam uyumlu, LaTeX formatında adım adım türetimler üretir.',
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
    <html lang="tr" className={`${display.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
