import { brand } from './src/css/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Ces modificateurs sont composés par interpolation dans le JSX
  // (`annot__puce--${nature}`) : Tailwind ne voit jamais le nom entier et
  // purgeait la règle de `@layer components`. Motif étroit à dessein — un motif
  // large sur `--` ramène 78 Ko d'utilitaires inutilisés.
  safelist: [{ pattern: /^(annot__puce|annot__cadre|indice|cagou)--/ }],
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
