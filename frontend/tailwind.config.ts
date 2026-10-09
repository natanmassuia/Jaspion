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
          navy: '#2E2D4D',
          'navy-dark': '#212038',
          blue: '#3A3B7D',
          cyan: '#5F6EC3',
          orange: '#EF7F22',
          yellow: '#FABE49',
          ink: '#2E2D4D',
          muted: '#6F7488',
          bg: '#F7F7FB',
          line: '#E2E3EE',
          success: '#1B8F60'
        }
      },
      fontFamily: {
        sans: ['Ubuntu', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
