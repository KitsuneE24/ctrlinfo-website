# CTRL INFO

Jeu web de sensibilisation à la désinformation en Nouvelle-Calédonie.
React 19 + Vite + Tailwind.

Le contenu des jeux — publications, manches, conversations, ressources — vient
de l'API [ctrlinfo-app](../ctrlinfo-app), qui garde aussi la progression des
joueurs. **Le front ne fonctionne pas sans elle** : il n'embarque plus aucune
publication.

```
ctrlinfo/
├── ctrlinfo-website/   ce dépôt — le front
└── ctrlinfo-app/       l'API (NestJS + PostgreSQL)
```

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | comment le code est organisé : coque, écrans, données, styles, persistance |
| [docs/contenu.md](docs/contenu.md) | ajouter une publication, une manche, une conversation, un chapitre, une source |
| [docs/devops.md](docs/devops.md) | notes CI / déploiement — à mettre en place |
| [docs/MOBILE_EXPORT.md](docs/MOBILE_EXPORT.md) | mise en ligne et pistes PWA / mobile |
| [../ctrlinfo-app/README.md](../ctrlinfo-app/README.md) | l'API : routes, base, flux RSS |

## Démarrer

D'abord l'API, dans l'autre dépôt :

```bash
cd ../ctrlinfo-app
cp .env.example .env       # remplacer les deux secrets JWT
docker compose up -d db
npm ci && npm run prisma:deploy && npm run db:seed
npm run start:dev          # http://localhost:3000/api
```

Puis le front :

```bash
cp .env.example .env       # VITE_API_URL=http://localhost:3000/api
npm ci                     # installe les versions exactes du lock
npm run dev                # http://localhost:5173
```

Si l'API est éteinte, les écrans le disent au lieu d'afficher une page vide.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build localement |
| `npm run lint` | ESLint |

## Où vit le contenu

| Contenu | Où |
| --- | --- |
| les publications du fil | base — table `post`, semée puis alimentée par les flux RSS |
| les manches de « Repère les indices » | base — table `manche_detect` |
| les discussions et leurs branches | base — table `conversation` |
| l'onglet Sources | base — table `ressource` |
| les jeux et leurs tutoriels | base — tables `game` et `volet_tutoriel` |
| les chapitres de « Comprendre » | [src/data/learn.js](src/data/learn.js) — le seul texte encore dans ce dépôt |

Marche à suivre détaillée dans [docs/contenu.md](docs/contenu.md).

## Un mot sur l'historique

Jusqu'à la mise en place de l'API, tout le contenu était écrit à la main dans
`src/data/` et livré avec le bundle. Ces fichiers ont été exportés en JSON
(`ctrlinfo-app/prisma/data/`), chargés en base par le seed, puis supprimés
d'ici. Le script qui a servi à l'export est conservé dans
[scripts/export-contenu.mjs](scripts/export-contenu.mjs) : il ne sert plus à
rien au quotidien, il documente la migration.
