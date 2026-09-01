/**
 * La mémoire des choses qu'on ne montre qu'une fois — le tutoriel d'un jeu.
 *
 * Tout passe par `localStorage` et tout est enveloppé : en navigation privée
 * ou derrière un blocage de cookies, y écrire lève une exception. En cas
 * d'échec on répond « oui, c'est la première fois » et le tutoriel se
 * remontre.
 */
const PREFIXE = 'ctrl-info:vu:'

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

/** Le jour courant, sous une forme comparable : « 2026-09-01 ». */
const today = () => new Date().toISOString().slice(0, 10)

/**
 * Comme `dejaVu`, mais pour ce qui revient chaque jour — la brève « Le
 * saviez-vous ? ». Ce n'est pas la même question : on ne demande pas si ça a
 * déjà été vu un jour, mais si ça a été vu **aujourd'hui**.
 */
export function seenToday(key) {
  try {
    return stockage()?.getItem(PREFIXE + key) === today()
  } catch {
    return false
  }
}

export function markSeenToday(key) {
  try {
    stockage()?.setItem(PREFIXE + key, today())
  } catch {
    // Au pire, ce sera montré à nouveau.
  }
}
