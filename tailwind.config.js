import { brand } from './src/styles/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { brand },
      fontFamily: {
        // Instagram s'appuie sur la police système : c'est ce qui donne
        // l'impression d'une app native. Archivo Black reste pour la marque.
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          'Helvetica', 'Arial', 'sans-serif',
        ],
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
