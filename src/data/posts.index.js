/**
 * Point d'entrée unique des posts du jeu.
 *
 * Si l'agent a produit src/data/posts.generated.js, ce sont ces posts qui
 * alimentent le feed. Sinon, on retombe sur le jeu écrit à la main.
 * Ce repli garantit que le jeu reste jouable même sans génération.
 *
 * Pour forcer le jeu manuel malgré une génération existante :
 *   VITE_USE_GENERATED=false npm run dev
 */

import handwrittenPosts, { remediationPosts } from './posts'

// import.meta.glob évite une erreur de build quand le fichier généré n'existe pas.
const generatedModules = import.meta.glob('./posts.generated.js', { eager: true })
const generated = generatedModules['./posts.generated.js']

const useGenerated =
  import.meta.env.VITE_USE_GENERATED !== 'false' &&
  Array.isArray(generated?.default) &&
  generated.default.length > 0

const posts = useGenerated ? generated.default : handwrittenPosts

export const source = useGenerated ? 'agent' : 'manuel'
export const meta = useGenerated ? generated.meta : null
export { remediationPosts }
export default posts
