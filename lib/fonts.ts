import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

export const display = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-display',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'greek'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
