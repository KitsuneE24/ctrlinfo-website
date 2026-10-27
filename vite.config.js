import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const lire = (nom) => {
  const fichier = resolve(import.meta.dirname, nom)
  return existsSync(fichier) ? JSON.parse(readFileSync(fichier, 'utf8')) : {}
}

// Chemin réel lu dans config.local.json (non versionné).
const CHEMIN_ADMIN =
  process.env.ADMIN_PATH ??
  lire('config.local.json').admin?.chemin ??
  lire('config.json').admin?.chemin ??
  'admin'

// Adresse devinable ou laissée à l'exemple (ancien compris) : pas d'admin dans le build.
const ADRESSE_CHOISIE = /^[a-z0-9-]{12,}$/i.test(CHEMIN_ADMIN) && !/^(admin|A-CHOISIR|gestion-3f9a2c)$/i.test(CHEMIN_ADMIN)

const HTPASSWD = process.env.ADMIN_HTPASSWD ?? lire('config.local.json').admin?.htpasswd ?? null

function finirLeBundle() {
  return {
    name: 'finir-le-bundle',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')

      if (process.env.NETLIFY) {
        rmSync(resolve(dist, 'admin'), { recursive: true, force: true })
        console.log('  administration : retirée (Netlify)')
        return
      }

      if (!ADRESSE_CHOISIE) {
        rmSync(resolve(dist, 'admin'), { recursive: true, force: true })
        console.log('  administration : retirée (adresse à choisir dans config.local.json, 12 caractères ou plus)')
        return
      }

      if (CHEMIN_ADMIN !== 'admin') {
        const depuis = resolve(dist, 'admin')
        const vers = resolve(dist, CHEMIN_ADMIN)
        if (existsSync(depuis)) {
          rmSync(vers, { recursive: true, force: true })
          renameSync(depuis, vers)
        }
      }
      const htaccess = resolve(dist, CHEMIN_ADMIN, '.htaccess')
      if (HTPASSWD && existsSync(htaccess)) {
        if (!HTPASSWD.startsWith('/') || /\s/.test(HTPASSWD)) {
          throw new Error(`admin.htpasswd doit être un chemin absolu sans espace : ${HTPASSWD}`)
        }
        const texte = readFileSync(htaccess, 'utf8')
        writeFileSync(htaccess, texte.replace('/CHEMIN/ABSOLU/A/REGLER/.htpasswd', HTPASSWD))
      }
      console.log(`  administration : dist/${CHEMIN_ADMIN}/`)
      console.log(`  mot de passe   : ${HTPASSWD ?? 'à régler (admin.htpasswd dans config.local.json)'}`)
    },
  }
}

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
