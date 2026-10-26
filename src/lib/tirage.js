/**
 * Le tirage d'une manche, toujours au niveau demandé (jamais plus facile) :
 * d'abord les inédites, puis les déjà vues, les plus anciennes d'abord.
 */

const melanger = (tableau) => {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

/** Un lot varié : un procédé différent par faux tant que possible. */
function varier(disponibles, taille) {
  const choisis = []
  const procedes = new Set()
  for (const post of disponibles) {
    if (choisis.length === taille) break
    if (post.isFake && procedes.has(post.biais)) continue
    choisis.push(post)
    if (post.isFake) procedes.add(post.biais)
  }
  for (const post of disponibles) {
    if (choisis.length === taille) break
    if (!choisis.includes(post)) choisis.push(post)
  }
  return choisis
}

/** Au moins une vraie et une fausse dans le lot, quand le vivier le permet. */
const equilibrer = (disponibles, taille) => {
  const choisis = varier(disponibles, taille)
  if (choisis.length < taille) return choisis

  for (const attendu of [false, true]) {
    if (choisis.some((post) => post.isFake === attendu)) continue
    const remplacant = disponibles.find(
      (post) => post.isFake === attendu && !choisis.includes(post)
    )
    // La dernière du lot est sacrifiée, jamais la première.
    if (remplacant) choisis[choisis.length - 1] = remplacant
  }

  return choisis
}

/** Au-delà du niveau le plus difficile du contenu, on y reste. */
export const niveauDeContenu = (posts, level) => {
  const max = Math.max(1, ...posts.map((post) => post.level ?? 1))
  return Math.min(level, max)
}

export function tirer(posts, { level, taille, vus = [] }) {
  const cible = niveauDeContenu(posts, level)
  const duNiveau = posts.filter((post) => post.level === cible)
  const dejaVus = new Set(vus)

  const inedits = melanger(duNiveau.filter((post) => !dejaVus.has(post.slug)))
  const parSlug = new Map(duNiveau.map((post) => [post.slug, post]))
  const revus = vus.map((slug) => parSlug.get(slug)).filter(Boolean)

  return equilibrer([...inedits, ...revus], taille)
}
