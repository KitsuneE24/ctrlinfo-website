/**
 * Point d'entrée unique des posts du jeu.
 *
 * Les publications sont écrites à la main dans posts.js. Ce module existe pour
 * que les écrans n'aient qu'un seul import à connaître.
 */

import posts, { remediationPosts } from './posts'

export { remediationPosts }
export default posts
