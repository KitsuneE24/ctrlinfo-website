# Ajouter et modifier du contenu

Presque tout le contenu de CTRL INFO est éditable sans toucher à un composant :
les écrans lisent des listes, et ajouter une entrée suffit. Ce guide décrit la
forme attendue de chaque type de contenu.

Voir [architecture.md](architecture.md) pour le code.

## Où va quoi

| Je veux… | Fichier |
| --- | --- |
| ajouter une publication au fil | [src/data/posts.js](../src/data/posts.js) |
| ajouter une manche d'indices | [src/data/detect.js](../src/data/detect.js) |
| ajouter une conversation | [src/data/conversations.js](../src/data/conversations.js) |
| ajouter une ressource | [src/data/resources.js](../src/data/resources.js) |
| retoucher un tutoriel de jeu | [src/data/games.js](../src/data/games.js) |

## 1. Une publication du fil

Le fichier est écrit à la main : c'est la seule source des publications du fil.
Elles sont groupées par niveau, du plus grossier au plus subtil.

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
   le biais qu'il illustre, repris à l'identique d'une publication existante —
   c'est cette chaîne qui relie le post à sa publication de remédiation.

Rappel utile : `correctAction: 'ignore'` est atteint en laissant filer le
chrono, il n'y a pas de bouton « ignorer ».

### Les publications de remédiation

`remediationPosts`, plus bas dans le même fichier, est un objet **indexé par nom de
biais**. Après deux erreurs sur le même biais, la publication correspondante est
insérée dans la file comme entraînement ciblé. Les clés doivent correspondre
exactement à celles de `BIASES` — une faute de frappe rend la remédiation
silencieusement inactive.

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

`CATEGORIES`, en tête du fichier, pilote les filtres de l'écran. La recherche est
tolérante aux fautes et aux accents ([search.js](../src/lib/search.js)) : « deco »
comme « dekodeurs » ramènent « Les Décodeurs ».

## 5. Les couleurs

Les fichiers de données importent `brand` depuis
[src/css/colors.js](../src/css/colors.js) plutôt que d'écrire un code
hexadécimal. Ce module double les jetons de `jetons.css` pour les endroits qui ne
peuvent pas lire du CSS — il doit rester aligné sur eux.

Exception assumée : les faux comptes du fil et de « Repère les indices » portent
des couleurs « alarmistes » codées en dur, hors palette de marque. C'est
volontaire, elles ne sont pas de la marque.

## 6. Vérifier son ajout

```bash
npm run lint     # syntaxe, imports, règles React
npm run dev      # et on joue le passage modifié
```

Il n'y a pas de tests automatisés — la relecture à l'écran est le seul filet.
Pour une publication, vérifier en particulier que le score de la bonne action
est bien le plus élevé : rien ne le signale à l'exécution, c'est à la relecture
de l'attraper.
