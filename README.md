# CTRL INFO

Jeu web de sensibilisation à la désinformation en Nouvelle-Calédonie.
React 19 + Vite, site statique hébergé par le commanditaire.

Le contenu — publications, conversations, thèmes, ressources — est lu dans
`public/donnees/` (`contenu.json`, `posts-vrais.json`, `posts-faux.json`),
modifiable depuis la page d'administration.
Le code n'embarque aucune publication.

La progression des joueurs, en revanche, ne quitte pas leur navigateur : il n'y
a ni compte, ni e-mail, ni mot de passe. Un joueur qui veut la retrouver
ailleurs exporte un code qu'il recolle sur l'autre appareil (voir
[architecture.md](docs/architecture.md), § 5.3).

## Documentation

| Document | Contenu |
| --- | --- |
| [docs/synthese.md](docs/synthese.md) | le projet en une page : stack, fonctionnement, composants |
| [docs/architecture.md](docs/architecture.md) | comment le code est organisé : coque, écrans, données, styles, persistance |
| [docs/contenu.md](docs/contenu.md) | ajouter une publication, une conversation, un thème, une source |
| [docs/passation.md](docs/passation.md) | mettre le site en ligne chez le commanditaire, sans entretien |

## Démarrer

```bash
npm ci                     # installe les versions exactes du lock
npm run dev                # http://localhost:5173
```

Le contenu est lu dans `public/donnees/`. S'il manque ou est
illisible, les écrans le disent au lieu d'afficher une page vide.

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
| `/mentions-legales` | les mentions légales et la politique de données |

Elles sont décrites une seule fois, dans [src/routes.js](src/routes.js).

Une adresse profonde (`/fil`) doit être servie par `index.html` : c'est le rôle
de [public/.htaccess](public/.htaccess) sur Apache et de [netlify.toml](netlify.toml)
sur Netlify. Autres hébergeurs : voir [docs/passation.md](docs/passation.md).

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build localement |
| `npm run lint` | ESLint |
| `npm run recolter` | fabrique des publications et des conversations à partir des flux RSS (`config.json`) ; lancé chaque matin par [.github/workflows/recolte.yml](.github/workflows/recolte.yml) |
| `node scripts/generer-sprite-cagou.mjs` | refait les planches du compagnon depuis `scripts/sprites/` |

## Où vit le contenu

Les publications sont dans [posts-vrais.json](public/donnees/posts-vrais.json)
et [posts-faux.json](public/donnees/posts-faux.json) ; le reste dans
[contenu.json](public/donnees/contenu.json), une clé par collection :

| Contenu | Clé |
| --- | --- |
| les publications d'entraînement ciblé | `remediations` |
| les discussions et leurs branches | `conversations` |
| les sites où vérifier une info, servis en stories | `ressources`, `categoriesRessources`, `stories` |
| les brèves du jour | `astuces` |
| les jeux, leurs niveaux et leurs tutoriels | `jeux`, `niveaux` |
| les thèmes de « Comprendre » | `chapitres` |
| les avatars | `avatars` |
| les mentions légales | `mentionsLegales` |

Marche à suivre détaillée dans [docs/contenu.md](docs/contenu.md).
