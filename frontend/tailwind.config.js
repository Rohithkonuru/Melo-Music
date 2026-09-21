/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        melomix: {
          bg: '#F8F8FA',
          card: '#FFFFFF',
          border: '#E4E4E7',
          text: '#18181B',
          muted: '#71717A',
          accent: '#7C3AED',
          accentHover: '#6D28D9',
          darkBg: '#09090B',
          darkCard: '#18181B',
          darkBorder: '#27272A',
          darkText: '#FAFAFA',
          darkMuted: '#A1A1AA',
          darkAccent: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
