/**
 * Les centres d'intérêt du joueur — les sujets qu'il veut voir passer en
 * premier dans son fil.
 *
 * Ils vivent dans le navigateur, pas en base : un invité y a droit comme les
 * autres, et rien n'est enregistré sur personne. Le serveur ne fait qu'ordonner
 * le tirage, il n'exclut jamais — un fil qui ne montrerait que ce qu'on aime
 * serait exactement la bulle qu'on cherche à faire voir.
 */
const CLE = 'ctrl-info:interets'

/** Les sujets proposés. Ils doivent correspondre à `contenu.post.theme`. */
export const THEMES = [
  { id: 'sante', label: 'Santé' },
  { id: 'politique', label: 'Politique' },
  { id: 'economie', label: 'Économie' },
  { id: 'science', label: 'Sciences' },
  { id: 'environnement', label: 'Environnement' },
  { id: 'societe', label: 'Société' },
  { id: 'medias', label: 'Médias' },
  { id: 'local', label: 'Nouvelle-Calédonie' },
  { id: 'international', label: 'International' },
]

const CONNUS = new Set(THEMES.map((theme) => theme.id))

export function lireInterets() {
  try {
    const brut = JSON.parse(window.localStorage.getItem(CLE) ?? '[]')
    // On refiltre à la lecture : un thème retiré du jeu ne doit pas continuer
    // de vider le fil de quelqu'un qui l'avait coché il y a six mois.
    return Array.isArray(brut) ? brut.filter((id) => CONNUS.has(id)) : []
  } catch {
    return []
  }
}

export function ecrireInterets(themes) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(themes))
  } catch {
    // Sans stockage, le fil reste celui de tout le monde. Rien de cassé.
  }
}
