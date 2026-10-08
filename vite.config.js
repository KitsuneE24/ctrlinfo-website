import { copyFileSync, existsSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Le site est servi depuis un sous-chemin sur GitHub Pages
 * (`https://…github.io/CTRL_INFO/`) : le déploiement passe `BASE_PATH` et
 * toutes les URL générées en héritent. En local, la racine suffit.
 */
const base = process.env.BASE_PATH ?? '/'

const lire = (nom) => {
  const fichier = resolve(import.meta.dirname, nom)
  return existsSync(fichier) ? JSON.parse(readFileSync(fichier, 'utf8')) : {}
}

/**
 * Où sort l'administration.
 *
 * `config.local.json` n'est pas versionné : c'est là que vit le vrai chemin.
 * Il n'est **jamais** envoyé au navigateur — il est appliqué à la
 * construction, en renommant le dossier produit. Rien dans le site public ne
 * mène à l'administration, et aucun fichier servi ne la nomme.
 */
const CHEMIN_ADMIN =
  process.env.ADMIN_PATH ??
  lire('config.local.json').admin?.chemin ??
  lire('config.json').admin?.chemin ??
  'admin'

/**
 * Le repli des adresses profondes, pour un hébergement statique.
 *
 * Depuis que chaque écran a son adresse, ouvrir `/fil` directement demande au
 * serveur un fichier qui n'existe pas. GitHub Pages n'a pas de règle de
 * réécriture, mais il sert `404.html` pour tout ce qu'il ne trouve pas : en y
 * mettant une copie de la page d'accueil, l'application démarre, lit l'adresse
 * et affiche le bon écran.
 */
function finirLeBundle() {
  return {
    name: 'finir-le-bundle',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))

      if (CHEMIN_ADMIN !== 'admin') {
        const depuis = resolve(dist, 'admin')
        const vers = resolve(dist, CHEMIN_ADMIN)
        if (existsSync(depuis)) {
          rmSync(vers, { recursive: true, force: true })
          renameSync(depuis, vers)
        }
      }
      console.log(`  administration : dist/${CHEMIN_ADMIN}/`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), finirLeBundle()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
