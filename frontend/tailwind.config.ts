/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        micro: {
          navy: 'rgb(var(--micro-navy-rgb) / <alpha-value>)',
          'navy-dark': 'rgb(var(--micro-navy-dark-rgb) / <alpha-value>)',
          blue: 'rgb(var(--micro-blue-rgb) / <alpha-value>)',
          cyan: 'rgb(var(--micro-cyan-rgb) / <alpha-value>)',
          orange: 'rgb(var(--micro-orange-rgb) / <alpha-value>)',
          yellow: 'rgb(var(--micro-yellow-rgb) / <alpha-value>)',
          ink: 'rgb(var(--micro-ink-rgb) / <alpha-value>)',
          muted: 'rgb(var(--micro-muted-rgb) / <alpha-value>)',
          bg: 'rgb(var(--micro-bg-rgb) / <alpha-value>)',
          line: 'rgb(var(--micro-line-rgb) / <alpha-value>)',
          success: 'rgb(var(--micro-success-rgb) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Ubuntu', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
