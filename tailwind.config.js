/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        'graffiti': ['Bangers', 'cursive'],
        'condensed': ['Roboto Condensed', 'sans-serif'],
        'chinese': ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        'graffiti': {
          'yellow': '#FFF500',
          'pink': '#FF0077',
          'blue': '#00FFFF',
          'green': '#00FF88',
          'purple': '#8A2BE2',
        },
        'bg': {
          'dark-brick': '#1a1a1a',
          'concrete': 'rgba(40, 40, 40, 0.8)',
        },
        'text': {
          'light-gray': '#EAEAEA',
        }
      },
      animation: {
        'graffiti-hover': 'graffiti-hover 0.2s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
      },
      keyframes: {
        'graffiti-hover': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-3px) rotate(-2deg)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
