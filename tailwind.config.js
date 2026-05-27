/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#D4A853',
        'primary-hover': '#C49A4A',
        dark: '#0C0A09',
        surface: '#1C1917',
        'surface-elevated': '#292524',
        light: '#FAFAF9',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      height: {
        'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
      },
      minHeight: {
        'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
      },
    },
  },
  plugins: [],
}
