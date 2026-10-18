/** Lit une couleur de jetons.css (`couleur('magenta')` → valeur de --magenta). */
export function couleur(nom) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${nom}`).trim()
}
