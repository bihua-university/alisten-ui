/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#D4A853',
        'accent-hover': '#C49A4A',
        'accent-dim': 'rgba(212, 168, 83, 0.12)',
        base: '#0a0a0a',
        surface: '#111111',
        'surface-elevated': '#181818',
        'text-primary': '#f0f0f0',
        'text-secondary': '#8a8a8a',
        'text-muted': '#555555',
        light: '#f0f0f0',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      height: {
        'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
      },
      minHeight: {
        'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      boxShadow: {
        'accent': '0 4px 20px rgba(212, 168, 83, 0.12)',
        'surface': '0 4px 16px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}
