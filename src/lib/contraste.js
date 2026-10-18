import { couleur } from './couleurs'

/** Couleur de texte (blanc ou encre) la plus contrastée sur un fond `#rrggbb`. */

function luminance(hex) {
  const valeur = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(valeur)) return null
  const canal = (i) => {
    const c = parseInt(valeur.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
}

export function texteSur(fond) {
  const l = typeof fond === 'string' ? luminance(fond) : null
  // Couleur non lisible (variable CSS…) : blanc par défaut.
  if (l === null) return 'var(--blanc)'
  const surBlanc = (luminance(couleur('blanc')) + 0.05) / (l + 0.05)
  const surEncre = (l + 0.05) / (luminance(couleur('papier-encre')) + 0.05)
  return surBlanc >= surEncre ? 'var(--blanc)' : 'var(--papier-encre)'
}
