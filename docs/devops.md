# DevOps sur CTRL INFO

> **État : à mettre en place.** Les workflows décrits au §2 ne sont pas encore
> dans le dépôt — `.github/` n'existe pas. Ce document sert de plan de mise en
> œuvre, pas de description de l'existant.

## 1. Le cours en une page

DevOps consiste à supprimer le mur entre le développement (qui livre du
changement) et l'exploitation (qui veut de la stabilité), en automatisant toute
la chaîne qui va du commit à la production.

| Notion | Définition courte | Où c'est dans ce projet |
| --- | --- | --- |
| CI — intégration continue | À chaque push, une machine neutre installe, lint et build. | `.github/workflows/ci.yml` |
| CD — déploiement continu | Une branche `main` verte part automatiquement en ligne. | `.github/workflows/deploy.yml` |
| Artefact immuable | On construit une fois, on déploie le même résultat partout. | l'artefact `dist` produit par la CI |
| IaC — infra as code | L'environnement est décrit dans un fichier versionné, pas installé à la main. | pas encore, voir §4 |
| Observabilité | Savoir que ça casse avant l'utilisateur. | pas encore, voir §4 |

Boucle DevOps : Plan → Code → Build → Test → Release → Deploy → Operate →
Monitor → Plan.

Les trois indicateurs qui mesurent réellement une équipe (DORA) : fréquence de
déploiement, délai entre commit et production, temps de rétablissement après
incident.

## 2. La chaîne mise en place

```
commit ──> push GitHub
             │
             ├──> CI (ci.yml) ........ npm ci → lint → build → artefact dist
             │      pull request : signale si ça casse
             │
             └──> Deploy (deploy.yml) . build avec BASE_PATH → GitHub Pages
                    seulement sur main
```

Le site étant entièrement statique aujourd'hui, GitHub Pages suffit : pas de
serveur à administrer, pas de conteneur à faire tourner.

### CI — `.github/workflows/ci.yml`

Se déclenche sur chaque push et chaque pull request vers `main`.

- `npm ci` installe **exactement** le `package-lock.json` : mêmes versions
  qu'en local, contrairement à `npm install`.
- `npm run lint` puis `npm run build` : une erreur ESLint ou une importation
  cassée fait échouer le job.
- Le dossier `dist` est conservé 7 jours comme artefact téléchargeable.
- `concurrency` annule le run précédent si on repush : pas de file d'attente.

### CD — `.github/workflows/deploy.yml`

Se déclenche sur `main` (ou à la main via *Run workflow*).

Le site est servi depuis `https://<utilisateur>.github.io/CTRL_INFO/`, donc les
assets ne sont pas à la racine du domaine. Le workflow passe `BASE_PATH=/CTRL_INFO/`
et `vite.config.js` le lit pour préfixer les URLs générées.

**Activation nécessaire une seule fois** : dépôt GitHub → *Settings* → *Pages* →
*Source* → **GitHub Actions**.

## 3. Ce qui manque et vaut le coup ensuite

1. **Des tests.** La CI ne vérifie aujourd'hui que « ça compile ». Ajouter
   Vitest plus React Testing Library, puis une étape `npm test` dans `ci.yml`,
   est le plus gros gain de valeur restant.
2. **Protection de branche.** *Settings* → *Branches* → exiger que le job CI
   passe avant toute fusion dans `main` : sans ça, la CI informe mais n'empêche
   rien.
3. **Dependabot.** Un `.github/dependabot.yml` pour les mises à jour de
   sécurité npm automatiques.

## 4. Conteneurisation : faite, côté back

La conteneurisation était reportée « à l'arrivée d'un back-end ». Il est
arrivé : [ctrlinfo-app](../../ctrlinfo-app) tourne en continu, avec sa version
de Node, ses variables d'environnement et sa base de données. Ce qui existe
aujourd'hui :

| Élément | Où | Volet DevOps |
| --- | --- | --- |
| `Dockerfile` multi-étapes (install → build → image mince) | `ctrlinfo-app/Dockerfile` | artefact immuable |
| `docker-compose.yml` : PostgreSQL + API + Adminer (profil `outils`) | `ctrlinfo-app/docker-compose.yml` | **IaC** |
| `HEALTHCHECK` sur les deux services, l'API attend une base saine | idem | **observabilité** |
| migrations et seed joués au démarrage du conteneur | `ctrlinfo-app/docker-entrypoint.sh` | reproductibilité |
| tests de la logique métier | `npm test` dans `ctrlinfo-app` | qualité |

```bash
cd ../ctrlinfo-app
docker compose up -d          # base + API
docker compose --profile outils up -d adminer
```

Le front reste hors du compose : il est statique, et Vercel ou GitHub Pages
suffit à le servir. Il lui faut seulement connaître l'adresse de l'API
(`VITE_API_URL`, injectée au build).

### Ce qui manque encore

- **Le front n'est pas conteneurisé.** Ce serait un `nginx` servant `dist/` —
  utile seulement si l'on veut tout déployer d'un bloc.
- **La CI ne construit pas encore l'image** ni ne la pousse sur un registre :
  c'est l'étape qui ferait de l'image l'artefact déployé.
- **Pas de sauvegarde de la base.** Le volume `donnees-postgres` vit sur la
  machine hôte ; un `pg_dump` planifié est le premier filet à poser avant toute
  mise en ligne réelle.
- **Les secrets sont dans `.env`.** Suffisant en local, à remplacer par les
  secrets de l'hébergeur en production — les deux clés JWT en particulier.
