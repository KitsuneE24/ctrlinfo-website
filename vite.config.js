import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Le site est servi depuis un sous-chemin sur GitHub Pages
 * (`https://…github.io/CTRL_INFO/`) : le déploiement passe `BASE_PATH` et
 * toutes les URL générées en héritent. En local, la racine suffit.
 */
const base = process.env.BASE_PATH ?? '/'

/**
 * Le repli des adresses profondes, pour un hébergement statique.
 *
 * Depuis que chaque écran a son adresse, ouvrir `/fil` directement demande au
 * serveur un fichier qui n'existe pas. GitHub Pages n'a pas de règle de
 * réécriture, mais il sert `404.html` pour tout ce qu'il ne trouve pas : en y
 * mettant une copie de la page d'accueil, l'application démarre, lit l'adresse
 * et affiche le bon écran. L'adresse reste celle que le visiteur a tapée.
 */
function deepLinkFallback() {
  return {
    name: 'deep-link-fallback',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), deepLinkFallback()],
})
