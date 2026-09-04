/**
 * Le contenu du jeu, lu depuis l'API.
 *
 * Chaque fonction rend exactement la forme que les écrans attendaient quand
 * les données étaient écrites en dur dans `src/data/` : `date`, `scores`,
 * `consequences`, `apercu`, `steps.choices`… Le changement est dans l'origine
 * des données, pas dans leur forme.
 */
import { api } from './client'

const requete = (chemin) => api(chemin, { authentifie: false })

/** La galerie d'avatars. Ouverte : on la voit avant d'avoir un compte. */
export const getAvatars = () => requete('/avatars')

/** Les jeux et leurs tutoriels. */
export const getJeux = () => requete('/jeux')

/**
 * Les stories de l'accueil, destination déjà résolue par l'API : chacune porte
 * soit une `url` extérieure, soit le slug d'un `chapitre` d'ici.
 */
export const getStories = () => requete('/stories')

/** La brève « Le saviez-vous ? » du jour. */
export const getDailyTip = () => requete('/astuces/du-jour')

/**
 * Un tirage de publications pour un niveau.
 *
 * Le serveur écarte celles que ce joueur a déjà traitées : deux parties de
 * suite ne se ressemblent pas, et le fil ne se réduit pas aux quinze mêmes
 * publications.
 */
export const getTirage = (level, { taille, themes } = {}) => {
  const parametres = new URLSearchParams({ level })
  if (taille) parametres.set('taille', taille)
  if (themes?.length) parametres.set('themes', themes.join(','))
  return requete(`/posts/tirage?${parametres}`)
}

/** Les publications d'entraînement ciblé, indexées par nom de biais. */
export const getRemediations = () => requete('/posts/remediations')

/** Les niveaux existants et leur volume. */
export const getNiveaux = () => requete('/posts/niveaux')

export const getConversations = () => requete('/conversations')

export const getConversation = (slug) => requete(`/conversations/${encodeURIComponent(slug)}`)

/**
 * Les thèmes de « Comprendre », en version galerie : titre, résumé, lien
 * d'aide. Le corps d'un chapitre ne vient qu'à son ouverture, avec
 * `getChapitre` — huit chapitres entiers pour afficher huit vignettes seraient
 * du gâchis.
 */
export const getChapitres = () => requete('/chapitres')

export const getChapitre = (slug) => requete(`/chapitres/${encodeURIComponent(slug)}`)
