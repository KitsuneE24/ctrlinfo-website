# Ajouter et modifier du contenu

Le contenu des jeux vit dans la base de [ctrlinfo-app](../../ctrlinfo-app), pas
dans ce dépôt. Ce guide décrit **la forme attendue de chaque type de contenu** —
les règles à ne pas violer sont les mêmes qu'avant, seul l'endroit a changé.

Voir [architecture.md](architecture.md) pour le code du front, et
[ctrlinfo-app/docs/architecture.md](../../ctrlinfo-app/docs/architecture.md)
pour celui de l'API.

## Où va quoi

| Je veux… | Où |
| --- | --- |
| ajouter une publication au fil | table `post` (+ `option_post`) |
| ajouter une manche d'indices | tables `manche_detect` et `indice_detect` |
| ajouter une conversation | tables `conversation`, `etape_conversation`, `choix_conversation` |
| ajouter une ressource | table `ressource` |
| retoucher un tutoriel de jeu | tables `game` et `volet_tutoriel` |
| ajouter un flux de presse | table `flux` — voir [flux-rss.md](../../ctrlinfo-app/docs/flux-rss.md) |
| retoucher un chapitre de « Comprendre » | [src/data/learn.js](../src/data/learn.js), dans ce dépôt |

## Comment écrire en base

Trois façons, de la plus durable à la plus rapide :

1. **Par le seed** — ajouter l'entrée dans
   [`ctrlinfo-app/prisma/data/*.json`](../../ctrlinfo-app/prisma/data), puis
   `npm run db:seed`. Le semis est idempotent : il met à jour ce qui existe et
   crée ce qui manque, sans doublon. C'est la seule façon dont le contenu
   survit à une base recréée — **à privilégier**.
2. **Par Prisma Studio** — `npm run prisma:studio` ouvre un éditeur de tables
   dans le navigateur. Pratique pour corriger une faute de frappe.
3. **Par SQL** — `docker compose --profile outils up -d adminer`, puis
   http://localhost:8080.

## 1. Une publication du fil

Une ligne de `post` et ses trois lignes de `option_post` — une par geste
possible. Dans `posts.json`, cela s'écrit encore comme avant :

```js
{
  id: 12,
  source: 'ALERTE-VÉRITÉ.net',        // le nom affiché du compte
  sourceColor: '#dc2626',             // couleur de l'avatar
  domain: 'alerte-verite.net',        // affiché sous le nom
  date: 'Il y a 30 minutes',          // texte libre, pas une vraie date
  titre: '…',                         // le titre de l'article partagé
  texte: '…',                         // la légende du post (≥ 40 caractères)
  image: 'https://…/600/340',
  isFake: true,
  level: 1,                           // 1, 2 ou 3
  correctAction: 'report',            // 'share' | 'ignore' | 'report'
  biais: 'Urgence artificielle',      // 'Aucun (…)' pour un vrai post
  explication: '…',                   // pourquoi, montré après le choix
  consequences: {                     // une par action, > 20 caractères
    share: '…', ignore: '…', report: '…',
  },
  scores: { share: -80, ignore: 10, report: 100 },
  sourceUrl: 'https://…',
  learnMoreUrl: 'https://…',
  learnMoreTips: 'https://…',
  encouragement: '…',                 // si le joueur a vu juste
  warning: '…',                       // s'il s'est trompé
  reactionCount: 45832,
  commentCount: 2156,
}
```

**Deux règles à ne pas violer** :

1. `scores[correctAction]` doit être le **maximum** des trois scores.
2. Un vrai post porte un `biais` commençant par « Aucun » ; un faux post nomme
   le biais qu'il illustre, repris à l'identique de la table `biais` — c'est ce
   libellé qui relie le post à sa publication de remédiation.

Les deux sont désormais **vérifiées au seed** : une incohérence fait échouer le
chargement avec le numéro de la publication fautive, au lieu de passer
inaperçue jusqu'à la partie. C'est le filet qui manquait quand tout était en
dur.

Rappel utile : `correctAction: 'ignore'` est atteint en laissant filer le
chrono, il n'y a pas de bouton « ignorer ».

### Les publications de remédiation

`posts-remediation.json` est un objet **indexé par nom de biais** ; en base, ce
sont des `post` de genre `REMEDIATION` rattachés à leur `biais`. Après deux
erreurs sur le même biais, la publication correspondante est insérée dans la
file comme entraînement ciblé, sans compter dans l'avancement du niveau.

Le libellé doit correspondre exactement à celui de la table `biais` — une faute
de frappe rend la remédiation silencieusement inactive.

### Les publications fabriquées à partir des flux

La majorité des publications ne sont plus écrites : elles sont fabriquées
toutes les six heures à partir d'articles de presse réels. Elles obéissent aux
mêmes règles, portent `origine: RSS`, et gardent le lien vers leur article
d'origine. Voir
[flux-rss.md](../../ctrlinfo-app/docs/flux-rss.md) — en particulier les
garde-fous, qui ne sont pas négociables.

## 2. Une manche de « Repère les indices »

```js
{
  id: 'urgence',
  titre: 'Publication n°1',
  contexte: 'Un post partagé dans un groupe familial, ce matin.',
  apercu: { compte: 'ALERTE-VÉRITÉ.net', couleur: '#dc2626', titre: '…' },
  indices: [
    {
      id: 'nom',
      label: 'Nom du compte',
      valeur: 'ALERTE-VÉRITÉ.net',
      suspect: true,
      explication: '…',   // montrée à la validation, suspect ou non
    },
  ],
}
```

**Chaque manche doit contenir des indices sains** (`suspect: false`), et ils
doivent être eux aussi expliqués. C'est le point de conception du jeu :
sur-signaler coûte un point, pour ne pas apprendre au joueur à se méfier de
tout. Une manche entièrement suspecte n'enseigne rien.

Le barème est automatique : +1 par indice suspect repéré, −1 par fausse alerte,
plancher à 0.

## 3. Une conversation

```js
{
  id: 'apprenti',
  name: 'Tuteur journalisme',
  subtitle: 'Mode pédagogie',       // le mot après « Mode » sert d'étiquette
  preview: 'On révise les réflexes de base ?',
  color: brand.blue,                // importé de src/css/colors.js
  intro: ['…', '…'],                // messages d'ouverture, avant le premier choix
  steps: [
    {
      prompt: '…',                  // le message qui interroge
      choices: [
        {
          text: '…',                // la bulle proposée au joueur
          correct: true,
          reply: '…',               // ce que le personnage répond, en bulle
          explication: '…',         // la voix pédagogique, hors fiction
        },
      ],
    },
  ],
  outro: { high: '…', low: '…' },   // bilan, selon le nombre de bons choix
}
```

**`reply` et `explication` ne doivent jamais se ressembler.** Le premier est de
la conversation : le personnage reste dans son rôle, la bulle s'affiche avec un
délai de frappe. Le second est hors fiction, affiché dans un bloc à part, sans
avatar. Trois registres cohabitent à l'écran — la question, la réplique,
l'explication — et les confondre casse l'effet.

`outro.high` s'affiche à partir de `steps.length - 1` bons choix.

L'écran et la boîte de réception se mettent à jour tout seuls : ajouter une
entrée à la liste suffit.

## 4. Une ressource

```js
{
  id: 'decodeurs',
  titre: 'Les Décodeurs',
  editeur: 'Le Monde',
  categorie: 'Vérifier une info',   // doit exister dans CATEGORIES
  description: '…',
  url: 'https://…',
  color: brand.blue,
}
```

La table `categorie_ressource` pilote les filtres de l'écran ; l'API y ajoute
« Tout » en tête, qui est un filtre et non une catégorie. Une ressource dont la
catégorie n'existe pas fait échouer le seed, avec son nom. La recherche reste
côté front, tolérante aux fautes et aux accents
([search.js](../src/lib/search.js)) : « deco » comme « dekodeurs » ramènent
« Les Décodeurs ».

## 5. Un chapitre de « Comprendre »

[learn.js](../src/data/learn.js) porte **tout** le texte de l'onglet : l'écran
n'en contient aucun. Le fichier est en deux temps.

`CHAPITRES` ne décrit que les en-têtes, et fixe au passage l'ordre des sections
comme celui du sommaire :

```js
{
  id: 'familles',              // sert d'ancre au sommaire
  numero: '01',
  Icon: Layers,                // importée de lucide-react
  onglet: 'Les 4 familles',    // le texte de la pastille du sommaire
  titre: 'Quatre familles de fausses infos',
  chapo: '…',                  // 1 à 2 phrases, sous le titre
}
```

Les blocs de chaque chapitre sont exportés à part, sous leur propre nom
(`FAMILLES`, `CHIFFRES`, `QUESTIONS`, `BIAIS`, `CAS`…), parce qu'ils n'ont
pas tous la même forme. Chacun est câblé une fois dans
[LearnScreen.jsx](../src/screens/LearnScreen.jsx) : **ajouter une entrée à une
liste existante suffit**, ajouter un chapitre entier demande en revanche de
poser sa mise en page dans l'écran.

Une convention à respecter : un chapitre ajouté à `CHAPITRES` doit avoir son
`<Chapitre>` correspondant dans l'écran, sinon il apparaît au sommaire et ne
mène nulle part.

## 6. Les couleurs

Les fichiers de données importent `brand` depuis
[src/css/colors.js](../src/css/colors.js) plutôt que d'écrire un code
hexadécimal. Ce module double les jetons de `jetons.css` pour les endroits qui ne
peuvent pas lire du CSS — il doit rester aligné sur eux.

Exception assumée : les faux comptes du fil et de « Repère les indices » portent
des couleurs « alarmistes » codées en dur, hors palette de marque. C'est
volontaire, elles ne sont pas de la marque.

## 7. Vérifier son ajout

```bash
cd ../ctrlinfo-app
npm run db:seed      # échoue et dit pourquoi si le contenu est incohérent
npm test             # les règles du jeu sont vérifiées ici

cd ../ctrlinfo-website
npm run lint         # syntaxe, imports, règles React
npm run dev          # et on joue le passage modifié
```

Le seed vérifie ce qui ne se voyait pas à l'exécution : que le score de la
bonne action est bien le plus élevé, que `isFake` s'accorde avec le biais
annoncé, qu'une manche contient des indices sains, qu'une ressource vise une
catégorie existante. Le reste — le ton, la justesse d'une explication, le fait
que `reply` et `explication` ne se ressemblent pas — demande toujours une
relecture à l'écran.
