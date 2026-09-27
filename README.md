# CTRL INFO

Jeu web de sensibilisation à la désinformation en Nouvelle-Calédonie.
React 19 + Vite + Tailwind.

Le contenu — publications, conversations, thèmes, ressources — vient
de l'API [ctrlinfo-app](../ctrlinfo-app). **Le front ne fonctionne pas sans
elle** : il n'embarque plus aucune publication.

La progression des joueurs, en revanche, ne quitte pas leur navigateur : il n'y
a ni compte, ni e-mail, ni mot de passe. Un joueur qui veut la retrouver
ailleurs exporte un code qu'il recolle sur l'autre appareil (voir
[architecture.md](docs/architecture.md), § 5 ter).

```
ctrlinfo/
├── ctrlinfo-website/   ce dépôt — le front
└── ctrlinfo-app/       l'API (NestJS + PostgreSQL)
```

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | comment le code est organisé : coque, écrans, données, styles, persistance |
| [docs/contenu.md](docs/contenu.md) | ajouter une publication, une conversation, un thème, une source |
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

## Les adresses

Chaque écran a la sienne : un lien se partage, un rechargement ne renvoie plus
à l'accueil, et le bouton « précédent » du navigateur fait ce qu'on attend.

| Adresse | Écran |
| --- | --- |
| `/` | l'accueil |
| `/fil` | le fil d'actualité |
| `/conversations` · `/conversations/:slug` | la boîte de réception, puis une discussion |
| `/ressources` | les thèmes à comprendre |
| `/ressources/comprendre/:slug` | un thème |
| `/profil` | la progression du joueur et son code de sauvegarde |

Elles sont décrites une seule fois, dans [src/routes.js](src/routes.js).

Sur un hébergement statique (GitHub Pages), une adresse profonde demande un
fichier qui n'existe pas. Le build recopie donc `index.html` en `404.html` :
l'application démarre, lit l'adresse et affiche le bon écran. Voir
[vite.config.js](vite.config.js).

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
| les discussions et leurs branches | base — table `conversation` |
| les sites où vérifier une info | base — table `ressource`, servis en stories |
| les stories de l'accueil et leurs brèves | base — tables `story` et `astuce` |
| les jeux et leurs tutoriels | base — tables `game` et `volet_tutoriel` |
| les thèmes de « Comprendre » | base — tables `chapitre` et `bloc_chapitre` |

Marche à suivre détaillée dans [docs/contenu.md](docs/contenu.md).

## Un mot sur l'historique

Jusqu'à la mise en place de l'API, tout le contenu était écrit à la main dans
`src/data/` et livré avec le bundle. Ces fichiers ont été exportés en JSON
(`ctrlinfo-app/prisma/data/`), chargés en base par le seed, puis supprimés
d'ici. Le script qui a servi à l'export est conservé dans
[scripts/export-contenu.mjs](scripts/export-contenu.mjs) : il ne sert plus à
rien au quotidien, il documente la migration.
