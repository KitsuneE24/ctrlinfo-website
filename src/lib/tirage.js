export const melanger = (tableau) => {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

function varier(disponibles, taille) {
  const choisis = []
  const procedes = new Set()
  const maxArticles = Math.floor(taille * 0.5)
  const articles = () => choisis.filter((p) => p.format === 'article').length
  for (const post of disponibles) {
    if (choisis.length === taille) break
    if (post.isFake && procedes.has(post.biais)) continue
    if (post.format === 'article' && articles() >= maxArticles) continue
    choisis.push(post)
    if (post.isFake) procedes.add(post.biais)
  }
  for (const post of disponibles) {
    if (choisis.length === taille) break
    if (!choisis.includes(post)) choisis.push(post)
  }
  return choisis
}

const equilibrer = (disponibles, taille) => {
  const choisis = varier(disponibles, taille)
  if (choisis.length < taille) return choisis

  for (const attendu of [false, true]) {
    if (choisis.some((post) => post.isFake === attendu)) continue
    const remplacant = disponibles.find(
      (post) => post.isFake === attendu && !choisis.includes(post)
    )
    if (remplacant) choisis[choisis.length - 1] = remplacant
  }

  return choisis
}

export const niveauDeContenu = (posts, level) => {
  const max = Math.max(1, ...posts.map((post) => post.level ?? 1))
  return Math.min(level, max)
}

export function inedites(posts, { level, vus = [] }) {
  const cible = niveauDeContenu(posts, level)
  const dejaVus = new Set(vus)
  return posts.filter((post) => post.level === cible && !dejaVus.has(post.slug)).length
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
