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

/** Les jeux et leurs tutoriels. */
export const getJeux = () => requete('/jeux')

/**
 * Un tirage de publications pour un niveau.
 *
 * Le serveur écarte celles que ce joueur a déjà traitées : deux parties de
 * suite ne se ressemblent pas, et le fil ne se réduit pas aux quinze mêmes
 * publications.
 */
export const getTirage = (level, taille = 5) =>
  requete(`/posts/tirage?level=${level}&taille=${taille}`)

/** Les publications d'entraînement ciblé, indexées par nom de biais. */
export const getRemediations = () => requete('/posts/remediations')

/** Les niveaux existants et leur volume. */
export const getNiveaux = () => requete('/posts/niveaux')

export const getPost = (slugOuId) => requete(`/posts/${encodeURIComponent(slugOuId)}`)

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

export const getRessources = () => requete('/ressources')

export const getCategories = () => requete('/ressources/categories')

export const getParcours = () => api('/parcours', { authentifie: false })

export const getUnParcours = (slug) =>
  api(`/parcours/${encodeURIComponent(slug)}`, { authentifie: false })

/** D'où vient le contenu : la liste des flux suivis et leur dernier passage. */
export const getFlux = () => requete('/flux')
