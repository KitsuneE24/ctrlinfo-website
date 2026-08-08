/**
 * Recherche tolérante aux fautes et aux accents.
 *
 * Objectif : « deco », « décodeur » ou « dekodeurs » doivent tous ramener
 * « Les Décodeurs ». Trois niveaux de tolérance, du moins coûteux au plus
 * coûteux, et on s'arrête au premier qui répond :
 *
 *   1. accents et casse mis de côté, le texte contient la saisie ;
 *   2. la saisie est le début d'un mot, à une ou deux fautes près ;
 *   3. la saisie est un mot entier, à une ou deux fautes près.
 *
 * La distance d'édition (Levenshtein) est bornée : au-delà du budget de
 * fautes, on abandonne la ligne sans finir le calcul.
 */

/** Minuscules, sans accents ni signes diacritiques. */
export function normalize(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Budget de fautes accordé à un mot saisi. Trois lettres ou moins, aucune :
 * sur un mot aussi court, une faute tolérée ramènerait n'importe quoi.
 */
function budgetFautes(mot) {
  if (mot.length <= 3) return 0
  if (mot.length <= 5) return 1
  return 2
}

/** Distance d'édition, abandonnée dès qu'elle dépasse `max`. */
function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1

  let ligne = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const suivante = [i]
    let minimum = i

    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1
      const valeur = Math.min(
        ligne[j] + 1, // suppression
        suivante[j - 1] + 1, // insertion
        ligne[j - 1] + cout // substitution
      )
      suivante.push(valeur)
      if (valeur < minimum) minimum = valeur
    }

    // Toute la ligne dépasse le budget : les suivantes ne feront que grandir.
    if (minimum > max) return max + 1
    ligne = suivante
  }

  return ligne[b.length]
}

/** Le mot saisi correspond-il à ce mot du texte, fautes comprises ? */
function motCorrespond(saisi, mot, budget) {
  if (mot.startsWith(saisi)) return true
  if (budget === 0) return false
  // Comparé au début du mot : « decodeur » saisi doit trouver « décodeurs ».
  if (distance(saisi, mot.slice(0, saisi.length), budget) <= budget) return true
  return distance(saisi, mot, budget) <= budget
}

/**
 * `texte` répond-il à la recherche `query` ? Tous les mots saisis doivent
 * correspondre — chacun peut le faire à un endroit différent du texte.
 */
export function correspond(query, texte) {
  const saisie = normalize(query).trim()
  if (saisie === '') return true

  const cible = normalize(texte)
  const mots = cible.split(/[^a-z0-9]+/).filter(Boolean)

  return saisie
    .split(/\s+/)
    .every((saisi) => {
      if (cible.includes(saisi)) return true
      const budget = budgetFautes(saisi)
      return mots.some((mot) => motCorrespond(saisi, mot, budget))
    })
}
