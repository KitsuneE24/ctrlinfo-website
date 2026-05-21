/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#1800ad',
          magenta: '#791561',
          cream:   '#fffaf9',
        },
      },
    },
  },
  plugins: [],
}
