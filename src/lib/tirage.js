/**
 * Le tirage d'une manche, porté du serveur (posts.service.ts) vers le front.
 *
 * Les thèmes ordonnent, ils n'excluent pas. Les publications déjà traitées
 * passent en dernier, de la plus ancienne à la plus récente, plutôt que de
 * rendre une manche amputée.
 */

const melanger = (tableau) => {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

/** Au moins une vraie et une fausse dans le lot, quand le vivier le permet. */
const equilibrer = (disponibles, taille) => {
  const choisis = disponibles.slice(0, taille)
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

export function tirer(posts, { level, taille, themes = [], vus = [] }) {
  const duNiveau = posts.filter((post) => post.level === level)
  if (duNiveau.length === 0) return []

  const aime = (post) => post.theme != null && themes.includes(post.theme)
  const dejaVus = new Set(vus)
  const frais = duNiveau.filter((post) => !dejaVus.has(post.slug))

  const melanges =
    themes.length > 0
      ? [...melanger(frais.filter(aime)), ...melanger(frais.filter((post) => !aime(post)))]
      : melanger(frais)

  const parSlug = new Map(duNiveau.map((post) => [post.slug, post]))
  const revus = vus.map((slug) => parSlug.get(slug)).filter(Boolean)

  return equilibrer([...melanges, ...revus], taille)
}
