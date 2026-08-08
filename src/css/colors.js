/**
 * La palette de marque, côté JavaScript.
 *
 * Elle double les jetons de `jetons.css` pour les deux endroits qui ne peuvent
 * pas lire du CSS : tailwind.config.js, et les fichiers de données qui
 * attribuent une couleur à un élément. Les deux doivent rester alignés.
 *
 * Les dégradés, eux, ne sont plus ici : ils vivent dans les jetons CSS
 * (`--brand-gradient`), lus par les feuilles de style qui en ont besoin.
 */
export const brand = {
  blue:         '#1800ad',
  magenta:      '#791561',
  magentaLight: '#e0309a',
  cream:        '#fffaf9',
}
