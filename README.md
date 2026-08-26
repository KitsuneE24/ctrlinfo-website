# CTRL INFO

Jeu web de sensibilisation à la désinformation en Nouvelle-Calédonie.
React 19 + Vite + Tailwind. Le dossier `agent/` contient la chaîne hors-ligne
qui collecte les articles et fabrique les jeux de cartes.

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | comment le code est organisé : coque, écrans, données, styles, persistance |
| [docs/agent.md](docs/agent.md) | la chaîne de génération en cinq étapes, ses règles et ses garde-fous |
| [docs/contenu.md](docs/contenu.md) | ajouter une publication, une manche, une conversation, une source |
| [docs/devops.md](docs/devops.md) | CI, déploiement, et ce qui manque encore |
| [docs/MOBILE_EXPORT.md](docs/MOBILE_EXPORT.md) | mise en ligne et pistes PWA / mobile |

## Démarrer

```bash
npm ci        # installe les versions exactes du lock
npm run dev   # http://localhost:5173
```

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build localement |
| `npm run lint` | ESLint |
| `npm run agent` | chaîne de collecte, phase 1 |

## Génération de contenu

L'agent rédige les posts à partir des flux RSS déclarés dans
`agent/config/sources.js`. Il lui faut une clé API :

```bash
cp .env.example .env    # puis colle ta clé dans ANTHROPIC_API_KEY
npm run agent           # phase 1 : vrais posts uniquement
npm run agent:phase2    # phase 2 : vrais posts + faux posts
```

`.env` est ignoré par git — la clé ne part jamais sur le dépôt.

Pour tester toute la chaîne sans dépenser un appel au modèle :
`npm run agent -- --dry-run`. Les textes produits sont des brouillons
marqués `[Brouillon sans IA]`, à ne jamais publier — supprime
`src/data/posts.generated.js` après un essai pour revenir au jeu écrit
à la main.

## DevOps

- **CI** — `.github/workflows/ci.yml` : lint et build sur chaque push et pull
  request vers `main`.
- **Déploiement** — `.github/workflows/deploy.yml` : `main` est publiée sur
  GitHub Pages. À activer dans *Settings* → *Pages* → *Source : GitHub Actions*.

Détail et explications dans [docs/devops.md](docs/devops.md).
