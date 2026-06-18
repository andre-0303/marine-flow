/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#042c53',
          700: '#185fa5',
          500: '#378add',
          200: '#b5d4f4',
          50:  '#eaf5fb',
        },
        teal: {
          700: '#0f6e56',
          500: '#1d9e75',
          200: '#5dcaa5',
          50:  '#e1f5ee',
        },
        risk: {
          600: '#a32d2d',
          400: '#e24b4a',
          50:  '#fcebeb',
        },
        warn: {
          600: '#ba7517',
          400: '#ef9f27',
          50:  '#faeeda',
        },
      },
    },
  },
  plugins: [],
}
