function normalize(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function budgetFautes(mot) {
  if (mot.length <= 3) return 0
  if (mot.length <= 5) return 1
  return 2
}

function distance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1

  let ligne = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const suivante = [i]
    let minimum = i

    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1
      const valeur = Math.min(
        ligne[j] + 1,
        suivante[j - 1] + 1,
        ligne[j - 1] + cout
      )
      suivante.push(valeur)
      if (valeur < minimum) minimum = valeur
    }

    if (minimum > max) return max + 1
    ligne = suivante
  }

  return ligne[b.length]
}

function motCorrespond(saisi, mot, budget) {
  if (mot.startsWith(saisi)) return true
  if (budget === 0) return false
  if (distance(saisi, mot.slice(0, saisi.length), budget) <= budget) return true
  return distance(saisi, mot, budget) <= budget
}

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
