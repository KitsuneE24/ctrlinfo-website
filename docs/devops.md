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

## 4. Conteneurisation : reportée

Tant que le projet est un site statique, un conteneur n'apporterait rien que
GitHub Pages ne fasse déjà. La conteneurisation est donc reportée à l'arrivée
d'un back-end, où elle devient nécessaire : il faudra alors un processus qui
tourne en continu, avec sa version de Node, ses variables d'environnement et sa
base de données.

Ce que ça donnera à ce moment-là :

- un `Dockerfile` par service, et un `compose.yml` qui décrit la stack
  complète — c'est le volet **IaC** du tableau du §1 ;
- un conteneur `ctrl-info-app` réunissant le front servi et l'API ;
- un `HEALTHCHECK` par service — le volet **observabilité** ;
- une étape de plus dans la CI : construire l'image et la pousser sur un
  registre, l'image devenant alors l'artefact déployé.
