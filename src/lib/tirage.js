const melanger = (tableau) => {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

// Sujet d’un post : le fait ou l’événement dont il parle, vrai ou faux.
const sujetDe = (post) => post.fait ?? post.scenario?.replace(/^fait-/, '') ?? post.slug

function varier(disponibles, taille) {
  const choisis = []
  const procedes = new Set()
  const sujets = new Set()
  const maxArticles = Math.floor(taille * 0.5)
  const articles = () => choisis.filter((p) => p.format === 'article').length
  for (const post of disponibles) {
    if (choisis.length === taille) break
    if (post.isFake && procedes.has(post.biais)) continue
    if (sujets.has(sujetDe(post))) continue
    if (post.format === 'article' && articles() >= maxArticles) continue
    choisis.push(post)
    sujets.add(sujetDe(post))
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
    const gardes = new Set(choisis.slice(0, -1).map(sujetDe))
    const remplacant = disponibles.find(
      (post) => post.isFake === attendu && !choisis.includes(post) && !gardes.has(sujetDe(post))
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

  const parSlug = new Map(posts.map((post) => [post.slug, post]))
  // Un sujet vu dans les 30 derniers posts passe après les autres.
  const recents = new Set(vus.slice(-30).map((slug) => parSlug.get(slug)).filter(Boolean).map(sujetDe))
  const melanges = melanger(duNiveau.filter((post) => !dejaVus.has(post.slug)))
  const inedits = [...melanges.filter((post) => !recents.has(sujetDe(post))), ...melanges.filter((post) => recents.has(sujetDe(post)))]
  const revus = vus.map((slug) => parSlug.get(slug)).filter((post) => post?.level === cible)

  return equilibrer([...inedits, ...revus], taille)
}
