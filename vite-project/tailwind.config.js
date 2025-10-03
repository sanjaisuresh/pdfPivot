/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#2D9B2B',
        gold: '#FFD700',
        orangeweb: '#FFA500',
        redcmyk: '#E12C2C',
        engineering: '#D40000',
      },
    },
  },
  plugins: [],
};
