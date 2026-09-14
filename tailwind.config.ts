import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f1e5a',
          'navy-deep': '#0a1540',
          'navy-mid': '#1a2a6c',
          'navy-light': '#e8edf8',
          gold: '#f5a623',
          'gold-light': '#fdf0d5',
        },
        surface: {
          DEFAULT: '#f0f4ff',
          white: '#ffffff',
          card: '#ffffff',
          muted: '#f8faff',
        },
        text: {
          primary: '#0f1e5a',
          secondary: '#6b7280',
          muted: '#9ca3af',
          inverse: '#ffffff',
        },
        status: {
          optimal: '#22c55e',
          growing: '#f59e0b',
          critical: '#ef4444',
          'optimal-bg': '#dcfce7',
          'growing-bg': '#fef3c7',
          'critical-bg': '#fee2e2',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,30,90,0.08), 0 1px 2px rgba(15,30,90,0.04)',
        'card-hover': '0 4px 12px rgba(15,30,90,0.12)',
        sidebar: '2px 0 8px rgba(15,30,90,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
