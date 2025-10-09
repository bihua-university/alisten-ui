/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量引用 color.css 中定义的颜色
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        dark: 'var(--color-bg-main)',
        light: 'var(--color-bg-light)',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
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
