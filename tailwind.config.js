/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-dim': 'var(--accent-dim)',
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        light: 'var(--text-primary)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', '-apple-system', 'sans-serif'],
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
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
}
