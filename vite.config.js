import { existsSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

/** Renomme le dossier d'administration selon CHEMIN_ADMIN. */
function finirLeBundle() {
  return {
    name: 'finir-le-bundle',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')

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
