/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1a1a2e',
          dark: '#16213e',
        },
        gold: {
          DEFAULT: '#c9a96e',
          dark: '#b08968',
        },
        cream: {
          DEFAULT: '#faf9f6',
          warm: '#f5f0e8',
        },
        ink: '#2d2d2d',
      },
    },
  },
  plugins: [],
}
