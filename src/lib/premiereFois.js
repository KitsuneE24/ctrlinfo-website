/**
 * La mémoire des choses qu'on ne montre qu'une fois — le tutoriel d'un jeu.
 *
 * Tout passe par `localStorage` et tout est enveloppé : en navigation privée
 * ou derrière un blocage de cookies, y écrire lève une exception. En cas
 * d'échec on répond « oui, c'est la première fois » et le tutoriel se
 * remontre.
 */
const PREFIXE = 'alert-nc:vu:'

function stockage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** L'utilisateur a-t-il déjà vu `cle` ? */
export function dejaVu(cle) {
  try {
    return stockage()?.getItem(PREFIXE + cle) === '1'
  } catch {
    return false
  }
}

/** Retenir que `cle` a été vue. Sans effet si le stockage est indisponible. */
export function marquerVu(cle) {
  try {
    stockage()?.setItem(PREFIXE + cle, '1')
  } catch {
    // Au pire, ce sera montré à nouveau.
  }
}
