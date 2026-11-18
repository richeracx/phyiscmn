import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        'bone-white': '#ffffff',
        'ash-gray': '#9a9a9a',
        'silver-mist': '#bdbdbd',
        'electric-iris': '#8052ff',
        'saffron-spark': '#ffb829',
        'deep-verdant': '#15846e',
        starlight: '#ffffff',
        supernova: '#8052ff',
        ash: '#9a9a9a',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
