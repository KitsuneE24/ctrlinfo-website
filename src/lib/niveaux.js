/** Vitesse de lecture prudente, et le temps de décider une fois lu. */
const MOTS_PAR_SECONDE = 3
const DECISION_SECONDES = 10

/** Le chrono d'une publication : jamais moins que le temps de la lire. */
export function dureePour(post, dureeNiveau) {
  if (!dureeNiveau || !post) return null
  const texte = [post.titre, post.texte, ...(post.commentaires ?? []).map((c) => c.texte)].join(' ')
  const mots = texte.split(/\s+/).filter(Boolean).length
  return Math.max(dureeNiveau, Math.ceil(mots / MOTS_PAR_SECONDE) + DECISION_SECONDES)
}

/**
 * Les règles d'un niveau du fil. Au-delà du dernier niveau décrit, on garde ses
 * règles et le chrono raccourcit de `accelerationSecondes` par niveau.
 */
export function reglesDuNiveau(niveaux, level) {
  if (niveaux.length === 0) return null
  const tries = [...niveaux].sort((a, b) => a.level - b.level)
  const dernier = tries[tries.length - 1]
  const exact = tries.find((n) => n.level === level)
  if (exact) return exact

  const ecart = level - dernier.level
  const duree = dernier.dureeSecondes
    ? Math.max(
        dernier.dureeMinimumSecondes ?? dernier.dureeSecondes,
        dernier.dureeSecondes - ecart * (dernier.accelerationSecondes ?? 0)
      )
    : null

  return {
    ...dernier,
    level,
    titre: `Niveau ${level}`,
    sousTitre: duree ? `Même difficulté, ${duree} secondes par publication.` : dernier.sousTitre,
    dureeSecondes: duree,
  }
}
