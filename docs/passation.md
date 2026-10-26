# Passation — mettre CTRL INFO en ligne

Ce document s'adresse à la personne qui met le site en ligne chez le
commanditaire. L'équipe étudiante qui l'a réalisé n'en assure plus le suivi :
tout ce qu'il faut savoir tient ici.

## Ce qu'est le site

Un jeu éducatif sur la désinformation. C'est un **site statique** : des
fichiers HTML, CSS, JavaScript, images et JSON. Il n'y a ni base de données, ni
compte utilisateur, ni donnée personnelle collectée. La progression des joueurs
reste dans leur navigateur.

## Ce qu'il faut mettre en ligne

Le contenu du dossier **`dist/`**, et rien d'autre. Si le dossier n'est pas
fourni, il se fabrique ainsi (Node.js 24 requis) :

```bash
npm ci
npm run build
```

Copier ensuite tout le contenu de `dist/` à la racine du site chez
l'hébergeur.

## Le seul réglage à faire : les adresses

Chaque écran a sa propre adresse (`/fil`, `/profil`, `/mentions-legales`…),
mais un seul fichier existe vraiment : `index.html`. L'hébergeur doit donc
servir `index.html` pour toute adresse qui ne correspond pas à un fichier.
Sans ce réglage, recharger une page autre que l'accueil affiche une erreur 404.

| Hébergement | Réglage |
| --- | --- |
| Apache (la plupart des hébergements mutualisés) | rien à faire : le fichier `.htaccess` fourni dans `dist/` s'en charge |
| Netlify | rien à faire : `netlify.toml` s'en charge |
| Nginx | ajouter `try_files $uri $uri/ /index.html;` dans le bloc `location /` |
| Autre | chercher « SPA fallback » ou « rewrite to index.html » dans sa documentation |

## L'administration : à supprimer, sauf besoin précis

Le dossier `dist/admin/` contient une page qui permet de modifier le contenu
en ligne. Elle ne fonctionne que sur un hébergement **Apache + PHP**, avec un
mot de passe à configurer (`.htaccess` et fichier `.htpasswd`).

**Si personne ne doit modifier le contenu, supprimez le dossier `admin/`**
après la copie. Le site fonctionne parfaitement sans lui, et un formulaire
d'écriture oublié sur un serveur est une porte d'entrée inutile.

## À faire une fois, avant la mise en ligne

Compléter les **mentions légales**, obligatoires. Elles se trouvent dans
`donnees/contenu.json`, à la clé `mentionsLegales`. Chaque information
manquante y est marquée `[À compléter : …]` et s'affiche sur fond magenta sur
la page `/mentions-legales` tant qu'elle n'est pas remplie :

- le nom, la forme juridique, l'adresse et le RIDET du commanditaire, qui est
  l'éditeur du site ;
- la personne responsable de la publication chez le commanditaire ;
- une adresse e-mail de contact qui restera active ;
- le nom et l'adresse de l'hébergeur ;
- ce que prévoit la convention de projet sur les droits d'auteur.

Le fichier se modifie avec n'importe quel éditeur de texte. Attention à garder
les guillemets et les virgules : une erreur de syntaxe empêche tout le contenu
de s'afficher.

## Ce qui se passe sans entretien

- **Le contenu est figé.** Les publications, conversations et fiches restent
  celles livrées. Le jeu fonctionne indéfiniment ainsi.
- **Les liens externes vieilliront.** Certains sites cités (médias, outils de
  vérification) peuvent changer d'adresse. Les mentions légales préviennent le
  lecteur que le site n'est plus mis à jour.
- **Aucune mise à jour de sécurité n'est nécessaire** côté site : il n'exécute
  aucun code sur le serveur, à part la page d'administration si elle est
  gardée.

## Pour aller plus loin (facultatif)

Si quelqu'un reprend un jour le projet : [README.md](../README.md) pour
démarrer, [architecture.md](architecture.md) pour le code, et
[contenu.md](contenu.md) pour le contenu.
