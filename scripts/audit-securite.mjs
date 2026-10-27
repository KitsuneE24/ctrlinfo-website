// npm run audit:securite : sort en erreur s'il reste un ÉCHEC.
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const RACINE = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const lire = (chemin) => (existsSync(join(RACINE, chemin)) ? readFileSync(join(RACINE, chemin), 'utf8') : '')
const resultats = []
const noter = (domaine, regle, etat, detail = '') =>
  resultats.push({ domaine, regle, etat, detail: etat === 'OK' ? '' : detail })
const verifier = (domaine, regle, condition, detail = '', siFaux = 'ÉCHEC') =>
  noter(domaine, regle, condition ? 'OK' : siFaux, condition ? '' : detail)

function fichiers(dossier, extensions) {
  const liste = []
  for (const nom of readdirSync(join(RACINE, dossier))) {
    const chemin = join(RACINE, dossier, nom)
    if (statSync(chemin).isDirectory()) liste.push(...fichiers(relative(RACINE, chemin), extensions))
    else if (extensions.some((e) => nom.endsWith(e))) liste.push(relative(RACINE, chemin).replaceAll('\\', '/'))
  }
  return liste
}

// ── 01 Authentification ──────────────────────────────────────────────────────
const htAdmin = lire('public/admin/.htaccess')
const php = lire('public/admin/enregistrer.php')
verifier('01 Authentification', "L'administration demande un mot de passe", /Require valid-user/.test(htAdmin), 'public/admin/.htaccess sans Require valid-user')
verifier('01 Authentification', 'Le script refuse si personne n’est identifié', /REMOTE_USER/.test(php) && /sortir\(401/.test(php), 'enregistrer.php ne revérifie pas l’utilisateur')
const configLocale = lire('config.local.json') ? JSON.parse(lire('config.local.json')) : {}
const htpasswd = process.env.ADMIN_HTPASSWD ?? configLocale.admin?.htpasswd
noter('01 Authentification', 'Chemin du .htpasswd réglé pour le build', htpasswd?.startsWith('/') && htpasswd !== '/home/compte/.htpasswd' ? 'OK' : 'ALERTE',
  'admin.htpasswd absent de config.local.json ou laissé à l’exemple : l’admin construite restera fermée (erreur 500), à régler au déploiement')
const cheminAdmin = process.env.ADMIN_PATH ?? configLocale.admin?.chemin ?? 'admin'
noter('01 Authentification', 'Adresse de l’admin choisie et non devinable',
  /^[a-z0-9-]{12,}$/i.test(cheminAdmin) && !/^(admin|A-CHOISIR|gestion-3f9a2c)$/i.test(cheminAdmin) ? 'OK' : 'ALERTE',
  'admin.chemin absent ou trop simple dans config.local.json : l’admin sera retirée du build')
verifier('01 Authentification', 'Le .htpasswd n’est pas dans le dossier public', !existsSync(join(RACINE, 'public/admin/.htpasswd')) && !existsSync(join(RACINE, 'public/.htpasswd')), '.htpasswd présent dans public/')

// ── 02-03 Protection des données ─────────────────────────────────────────────
const ht = lire('public/.htaccess')
const netlify = lire('netlify.toml')
verifier('02 Protection des données', 'HTTPS imposé (Apache)', /RewriteCond %\{HTTPS\} !=on/.test(ht), 'pas de redirection vers HTTPS')
verifier('02 Protection des données', 'HSTS (Apache et Netlify)', /Strict-Transport-Security/.test(ht) && /Strict-Transport-Security/.test(netlify), 'en-tête HSTS absent')
const flux = lire('.github/workflows/generation.yml')
verifier('02 Protection des données', 'Envoi automatique sans FTP en clair', !/ftp:ssl-allow no/.test(flux) && /ssl-force true/.test(flux),
  'le workflow accepte un FTP sans chiffrement : le mot de passe circule en clair')
verifier('02 Protection des données', 'Clé du serveur SFTP vérifiée', !/auto-confirm yes/.test(flux) && /StrictHostKeyChecking=yes/.test(flux),
  'n’importe quel serveur est accepté (interception possible)')
const suivis = execSync('git ls-files', { cwd: RACINE, encoding: 'utf8' }).split('\n')
verifier('02 Protection des données', 'Aucun fichier secret versionné', !suivis.some((f) => /(^|\/)(\.env|config\.local\.json|\.htpasswd|journal\.log)$/.test(f)), 'un fichier secret est suivi par git')
const SECRET = /(-----BEGIN [A-Z ]*PRIVATE KEY|password\s*[:=]\s*['"][^'"]{4,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})/i
const fuites = suivis.filter((f) => /\.(m?js|jsx|json|php|ya?ml|toml|md)$/.test(f) && SECRET.test(lire(f)))
verifier('02 Protection des données', 'Aucun mot de passe ou clé dans le code', fuites.length === 0, fuites.join(', '))

// ── 04-06 Sécurité applicative ───────────────────────────────────────────────
verifier('04 Sécurité applicative', 'Pas de listing de répertoire', /Options -Indexes/.test(ht), 'Options -Indexes manquant')
verifier('04 Sécurité applicative', 'Sauvegardes et journal non servis', /bak[^"]*\|log/.test(ht) && /\\\.log/.test(htAdmin), '.bak ou .log accessibles')
for (const entete of ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy']) {
  verifier('04 Sécurité applicative', `En-tête ${entete}`, ht.includes(entete) && netlify.includes(entete), 'absent de .htaccess ou netlify.toml')
}
const imagesLocales = (texte) => /img-src 'self';/.test(texte)
verifier('04 Sécurité applicative', 'Images chargées depuis le site seulement (CSP)', imagesLocales(ht) && imagesLocales(netlify), 'img-src autorise d’autres sites : l’adresse IP des joueurs leur est transmise')
verifier('04 Sécurité applicative', 'Liste blanche des fichiers modifiables', /in_array\(\$nom, \[/.test(php), 'paramètre fichier non contrôlé')
verifier('04 Sécurité applicative', 'Envoi depuis un autre site refusé (CSRF)', /application\/json/.test(php) && /HTTP_SEC_FETCH_SITE/.test(php), 'pas de contrôle Content-Type / origine')
verifier('04 Sécurité applicative', 'Messages d’erreur sans détail technique', !/sortir\(\d+, '[^']*' \. json_last_error_msg/.test(php), 'json_last_error_msg renvoyé au navigateur')
verifier('04 Sécurité applicative', 'Écriture sur disque tracée', /function tracer/.test(php) && /tracer\('succes'/.test(php), 'aucun journal des enregistrements')
verifier('04 Sécurité applicative', 'Administration absente du build Netlify', /process\.env\.NETLIFY/.test(lire('vite.config.js')), 'admin publiée sans mot de passe sur Netlify')

verifier('04 Sécurité applicative', 'Erreur de chargement sans détail technique pour le visiteur', /import\.meta\.env\.DEV && erreur\?\.message/.test(lire('src/components/ui/Chargement.jsx')), 'le message brut de l’erreur est affiché')
verifier('04 Sécurité applicative', 'Plusieurs versions du contenu gardées', /\.bak\.' \. gmdate/.test(php), 'une seule sauvegarde .bak')
verifier('04 Sécurité applicative', 'Fichier temporaire supprimé en cas d’échec', /unlink\(\$temporaire\);[\s\S]*écriture du fichier temporaire/.test(php), 'un temporaire peut rester dans donnees/')
verifier('04 Sécurité applicative', 'Suppression confirmée dans l’administration', /window\.confirm\([^)]*\) && retirer/.test(lire('src/admin/Champs.jsx')), 'retrait sans confirmation')

// ── 07 Entrée / Sortie ───────────────────────────────────────────────────────
const sources = fichiers('src', ['.js', '.jsx'])
const dangereux = sources.filter((f) => /dangerouslySetInnerHTML|\beval\(|new Function\(|\.innerHTML\s*=/.test(lire(f)))
verifier('07 Entrée / Sortie', 'Aucune injection HTML ni eval', dangereux.length === 0, dangereux.join(', '))
const sansNoopener = sources.filter((f) => /target="_blank"(?![^>]*noopener)/s.test(lire(f).replace(/\n\s*/g, ' ')))
verifier('07 Entrée / Sortie', 'Liens externes en noopener', sansNoopener.length === 0, sansNoopener.join(', '))
verifier('07 Entrée / Sortie', 'Liens des sources filtrés (http/https)', /CLES_ADRESSE = \/\^\(url\|/.test(lire('scripts/verifier-donnees.mjs')), 'adresses des sources non contrôlées')
const generateur = lire('scripts/generer-contenu.mjs')
verifier('07 Entrée / Sortie', 'Flux sous licence libre nettoyés (liens, balises, longueur)', /lienWeb\(item\.link\)/.test(generateur) && /propre\(item\.title, \d+\)/.test(generateur),
  'titre ou lien d’un flux repris sans contrôle')
verifier('07 Entrée / Sortie', 'Code de progression borné', /propre\.length > /.test(lire('src/lib/codeProgression.js')), 'aucune limite de taille')
verifier('07 Entrée / Sortie', 'Publications fabriquées relues avant usage', /filter\(estLocal/.test(lire('src/state/generes.js')) && /estConnu/.test(lire('src/state/contenu.js')),
  'le stockage local est repris sans contrôle')
try {
  execSync('node scripts/verifier-donnees.mjs', { cwd: RACINE, stdio: 'pipe' })
  noter('07 Entrée / Sortie', 'Contenu publié valide (adresses comprises)', 'OK')
} catch (erreur) {
  noter('07 Entrée / Sortie', 'Contenu publié valide (adresses comprises)', 'ÉCHEC', String(erreur.stderr).trim().split('\n')[0])
}

// ── 08 Test & recette ────────────────────────────────────────────────────────
const bavards = sources.filter((f) => lire(f).split('\n').some((l) => /console\.(log|debug|info)\(/.test(l) && !/import\.meta\.env\.DEV/.test(l)))
verifier('08 Test & recette', 'Pas de console.log résiduel dans le site', bavards.length === 0, bavards.join(', '), 'ALERTE')
const restes = sources.filter((f) => /\b(debugger|TODO|FIXME)\b/.test(lire(f)))
verifier('08 Test & recette', 'Pas de debugger / TODO oublié', restes.length === 0, restes.join(', '), 'ALERTE')
verifier('08 Test & recette', 'Contrôle automatique à chaque modification', /audit:securite/.test(lire('.github/workflows/securite.yml')), 'aucun workflow ne rejoue l’audit')

// ── 09 Environnement de test ─────────────────────────────────────────────────
const contenuBrut = ['contenu', 'posts-vrais', 'posts-faux'].map((n) => lire(`public/donnees/${n}.json`)).join('\n')
const courriels = [...new Set(contenuBrut.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [])]
noter('09 Environnement de test', 'Aucune donnée personnelle dans le contenu', courriels.length === 0 ? 'OK' : 'ALERTE',
  `adresses trouvées (vérifier qu’elles sont publiques) : ${courriels.join(', ')}`)

// ── 10 Veille ────────────────────────────────────────────────────────────────
verifier('10 Veille', 'Veille des dépendances (Dependabot)', /package-ecosystem: npm/.test(lire('.github/dependabot.yml')), '.github/dependabot.yml absent', 'ALERTE')
const toutesActions = ['generation', 'securite'].map((n) => lire(`.github/workflows/${n}.yml`)).join('\n')
const nonEpinglees = [...toutesActions.matchAll(/uses:\s*([^\s#]+)/g)].map((m) => m[1]).filter((u) => !/@[0-9a-f]{40}$/.test(u))
verifier('10 Veille', 'Actions GitHub épinglées par empreinte', nonEpinglees.length === 0, nonEpinglees.join(', '), 'ALERTE')
for (const [portee, options] of [['site publié', '--omit=dev'], ['outils de développement', '']]) {
  let rapport
  try {
    rapport = JSON.parse(execSync(`npm audit --json ${options}`, { cwd: RACINE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
  } catch (erreur) {
    rapport = erreur.stdout ? JSON.parse(erreur.stdout) : null
  }
  const n = rapport?.metadata?.vulnerabilities
  if (!n) noter('10 Veille', `Dépendances (${portee})`, 'ALERTE', 'npm audit injoignable')
  else verifier('10 Veille', `Dépendances (${portee}) sans faille haute`, n.high + n.critical === 0,
    `${n.high} haute(s), ${n.critical} critique(s) : npm audit fix`, portee === 'site publié' ? 'ÉCHEC' : 'ALERTE')
}

// ── Rapport ──────────────────────────────────────────────────────────────────
const SIGNE = { OK: '  ok  ', ALERTE: 'ALERTE', ÉCHEC: 'ÉCHEC ' }
let domaine = ''
for (const r of resultats) {
  if (r.domaine !== domaine) console.log(`\n${(domaine = r.domaine)}`)
  console.log(`  [${SIGNE[r.etat]}] ${r.regle}${r.detail ? `\n             → ${r.detail}` : ''}`)
}
const compte = (etat) => resultats.filter((r) => r.etat === etat).length
console.log(`\n${compte('OK')} ok, ${compte('ALERTE')} alerte(s), ${compte('ÉCHEC')} échec(s).`)
if (compte('ÉCHEC') > 0) process.exit(1)
