/**
 * « Est-ce la première fois ? » — la mémoire des choses qu'on ne montre qu'une
 * fois, le tutoriel d'un jeu par exemple.
 *
 * Tout passe par `localStorage`, et tout est enveloppé : en navigation privée,
 * sur un stockage plein ou derrière un blocage de cookies, y écrire lève une
 * exception. Un tutoriel ne vaut pas d'écran blanc — en cas d'échec on répond
 * simplement « oui, c'est la première fois », et il se remontrera. C'est le bon
 * sens du défaut : mieux vaut réexpliquer que priver.
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
    // Rien à faire : au pire, ce sera montré à nouveau.
  }
}

/** Repartir de zéro — utile pour retester un tutoriel depuis la console. */
export function oublier(cle) {
  try {
    stockage()?.removeItem(PREFIXE + cle)
  } catch {
    // idem
  }
}
