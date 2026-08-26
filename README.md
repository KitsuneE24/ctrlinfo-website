# CTRL INFO

Jeu web de sensibilisation à la désinformation en Nouvelle-Calédonie.
React 19 + Vite + Tailwind. Les publications du jeu sont écrites à la main
dans `src/data/`.

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | comment le code est organisé : coque, écrans, données, styles, persistance |
| [docs/contenu.md](docs/contenu.md) | ajouter une publication, une manche, une conversation, une source |
| [docs/devops.md](docs/devops.md) | notes CI / déploiement — à mettre en place |
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

## Contenu du jeu

Tout le contenu est écrit à la main, sans génération automatique :

| Fichier | Contenu |
| --- | --- |
| [src/data/posts.js](src/data/posts.js) | les publications du fil, par niveau |
| [src/data/detect.js](src/data/detect.js) | les manches de « Repère les indices » |
| [src/data/conversations.js](src/data/conversations.js) | les discussions et leurs branches |
| [src/data/resources.js](src/data/resources.js) | l'onglet Sources |

Marche à suivre détaillée dans [docs/contenu.md](docs/contenu.md).
