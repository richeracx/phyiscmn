import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#06080D',
        obsidian: '#0C1018',
        elevated: '#121824',
        'accent-blue': '#2E8BFF',
        'cryo-cyan': '#BAE0FF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        widestTechnical: '0.08em',
      },
      borderColor: {
        hairline: 'rgba(255, 255, 255, 0.08)',
        elevated: 'rgba(255, 255, 255, 0.12)',
      },
      boxShadow: {
        'subtle-blue': '0 0 20px rgba(46, 139, 255, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
