# Ajouter et modifier du contenu

Le contenu des jeux vit dans [public/donnees/](../public/donnees/), pas dans le
code : les publications dans `posts-vrais.json` et `posts-faux.json`, le reste
dans `contenu.json`. Ce guide décrit **la forme attendue de chaque type de
contenu** et les règles à ne pas violer.

Voir [architecture.md](architecture.md) pour le code.

## Où va quoi

| Je veux… | Où |
| --- | --- |
| ajouter une publication au fil | `posts-vrais.json` ou `posts-faux.json` |
| ajouter une conversation | `conversations` |
| ajouter une ressource | `ressources` (et sa story dans `stories`) |
| retoucher un tutoriel de jeu | `jeux`, `niveaux` |
| ajouter un flux de presse | `flux` dans [config.json](../config.json) |
| retoucher un thème de « Comprendre » | `chapitres` |
| modifier les mentions légales | `mentionsLegales` |

## Comment modifier le contenu

1. **Par l'administration** — la page d'administration (dossier `admin/`,
   renommé au build selon `config.local.json`) affiche un formulaire par
   collection. « Enregistrer » renvoie les trois fichiers à
   `public/admin/enregistrer.php`, qui garde la version précédente en `.bak`
   et refuse un faux dans `posts-vrais.json` (et l'inverse).
   Il faut un hébergement Apache + PHP : sur Netlify, l'enregistrement ne
   fonctionne pas.
2. **À la main** — modifier les fichiers de `public/donnees/` dans l'éditeur, puis
   redéployer.

## 1. Une publication du fil

Une entrée de `posts-vrais.json` ou `posts-faux.json` :

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
  level: 1,                           // 1 (gros signaux) à 5 (un seul détail)
  origine: 'MANUEL',                  // 'MANUEL' ou 'RSS'
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
  indices: [                          // montrés dans « Ce qu'il fallait voir »
    { nature: 'ALERTE', cible: 'TITRE', picto: 'Megaphone', libelle: '…', explication: '…' },
  ],
  analyseVrai: '…', analyseFaux: '…', // ce qui est vrai / faux dans le post
  commentaires: [                     // cohérents avec le post : ils servent d'indice
    { auteur: 'Louise M.', couleur: '#14663f', texte: '…', posture: 'VERIFIE' },
  ],
}
```

**Deux règles à ne pas violer** :

1. `scores[correctAction]` doit être le **maximum** des trois scores.
2. Un vrai post porte un `biais` commençant par « Aucun » ; un faux post nomme
   le biais qu'il illustre, repris à l'identique d'une clé de `remediations` —
   c'est ce libellé qui relie le post à sa publication de remédiation.

Rien ne les vérifie automatiquement : relisez-les après chaque ajout.

Rappel utile : `correctAction: 'ignore'` est atteint en laissant filer le
chrono, il n'y a pas de bouton « ignorer ».

### Les publications de remédiation

`remediations` est un objet **indexé par nom de biais**. Après deux
erreurs sur le même biais, la publication correspondante est insérée dans la
file comme entraînement ciblé, sans compter dans l'avancement du niveau.

Le libellé doit correspondre exactement au `biais` des publications — une
faute de frappe rend la remédiation silencieusement inactive.

### Les publications fabriquées à partir des flux

`node scripts/recolter-flux.mjs` lit les flux de [config.json](../config.json)
et fabrique des publications à partir d'articles de presse réels :

- un article donne une **vraie** (reprise telle quelle) ou une **fausse**
  (habillée par un gabarit de [scripts/gabarits.mjs](../scripts/gabarits.mjs)) ;
- un faux croise une **catégorie** (ce qui est ajouté : urgence, source
  anonyme, peur, chiffre, faux expert, conclusion, lien insinué, « c'est
  confirmé ») et un **niveau** (l'emballage : compte qui crie au niveau 1,
  copie quasi parfaite d'une vraie rédaction au niveau 5). Chaque niveau
  contient toutes les catégories ;
- les niveaux se remplissent selon `recolte.poidsNiveaux` (le niveau 5 reçoit
  plus de contenu, c'est là que le joueur passe le plus de temps) ;
- chaque publication reçoit ses indices et trois commentaires liés à son
  contenu (qui y croit, qui doute, qui a vérifié) ;
- les articles sur un sujet grave (`recolte.sujetsSensibles`) sont écartés : ni vrais, ni faux ;
- jusqu'à `recolte.maxConversations` conversations sont fabriquées à partir des
  faux du lot ([scripts/gabarits-conversations.mjs](../scripts/gabarits-conversations.mjs)).

La récolte tourne seule chaque jour à 6 h (heure de Nouméa) :
[.github/workflows/recolte.yml](../.github/workflows/recolte.yml) l'exécute sur
GitHub, enregistre les fichiers dans `main`, et Netlify redéploie. Pour la
lancer à la main : onglet **Actions** du dépôt → « Récolte des flux » →
**Run workflow**, ou `npm run recolter` en local.

Tout porte `origine: RSS` et le lien vers l'article d'origine. Options :
`--essai` (rien n'est écrit), `--max 50` (taille du lot), `--refaire` (retire
d'abord tout ce que les flux ont produit).

### Le fil sans fin

Chaque niveau de `niveaux` sert `taille` publications, puis le fil passe au
suivant sans s'arrêter. Après le dernier niveau décrit, ses règles restent et le
chrono baisse de `accelerationSecondes` par niveau, sans descendre sous
`dureeMinimumSecondes`. Le chrono d'une publication n'est jamais plus court que
le temps de la lire (3 mots par seconde, plus 10 s pour décider :
[lib/niveaux.js](../src/lib/niveaux.js)). Le fil ne sert jamais un niveau plus facile : quand le niveau n'a plus
d'inédit, ses publications les plus anciennes reviennent. Relancer la récolte
régulièrement garde le fil neuf.

## 2. Une conversation

```js
{
  id: 'apprenti',
  name: 'Tuteur journalisme',
  subtitle: 'Mode pédagogie',       // le mot après « Mode » sert d'étiquette
  preview: 'On révise les réflexes de base ?',
  color: '#1f4fd1',                 // couleur propre au contenu
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

## 3. Une ressource

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

`categoriesRessources` pilote les filtres de l'écran ; « Tout », en tête, est
un filtre et non une catégorie. Une ressource dont la catégorie n'y figure pas
n'apparaît dans aucun filtre. La recherche, tolérante aux fautes et aux accents
([search.js](../src/lib/search.js)) : « deco » comme « dekodeurs » ramènent
« Les Décodeurs ».

## 4. Un thème de « Comprendre »

Dans `chapitres`. Le haut de l'entrée est ce que montre la galerie ; les
`blocs` sont le corps du thème.

```js
{
  id: 'familles',
  numero: '01',
  icone: 'Layers',                    // un nom connu de src/data/icones.js
  couleur: '#1800ad',
  onglet: 'Les 4 familles',           // le libellé court
  titre: 'Quatre familles de fausses infos',
  resume: '…',                        // 60 à 260 caractères : la vignette
  chapo: '…',                         // 1 à 2 phrases, en tête du thème
  lien: {                             // la sortie de secours du thème
    texte: 'Les fiches du CLEMI',
    url: 'https://www.clemi.fr/',
  },
  blocs: [ … ],
}
```

**Chaque thème doit mener quelque part** : `lien.url` est obligatoire, en
`https`. C'est la promesse faite au lecteur — la fiche est courte, mais elle dit où aller ensuite.

Un bloc porte un `genre`, qui décide de sa mise en page et de rien d'autre :

| Genre | Ce qu'il porte | Rendu |
| --- | --- | --- |
| `TEXTE` | `texte` — paragraphes séparés par une ligne vide | des paragraphes |
| `LISTE` | `entrees` | des cartes, en une ou deux colonnes |
| `CHIFFRES` | `entrees` où `titre` est la valeur (« 2,6 Md$ ») | trois nombres en avant |
| `CONSEIL` | `titre` (l'intitulé) et `texte` | l'encadré « à retenir » |

Une entrée de liste a toujours la même forme, quel que soit le sujet :

```js
{
  surtitre: '1',                      // facultatif — un rang, une année
  titre: 'Inventée de toutes pièces',
  texte: '…',
  notes: [                            // facultatif — les encadrés
    { label: 'Cas réel', texte: '…' },
  ],
}
```

**Ajouter un thème ne demande donc aucune modification du front** : l'écran sait
dessiner quatre formes de blocs, et n'a rien à savoir des thèmes eux-mêmes.

## 5. Les couleurs

Les couleurs du site sont toutes dans [src/css/jetons.css](../src/css/jetons.css).
Le contenu (`contenu.json`) porte ses propres couleurs — celle d'un compte,
d'une conversation, d'un thème — en hexadécimal : ce sont des données,
modifiables depuis l'administration. Le texte posé dessus (initiales) choisit
seul le blanc ou l'encre selon le contraste.

Exception assumée : les faux comptes du fil portent des couleurs
« alarmistes » codées en dur, hors palette de marque. C'est volontaire, elles ne
sont pas de la marque.

## 6. Vérifier son ajout

```bash
npm run lint         # syntaxe, imports, règles React
npm run dev          # et on joue le passage modifié
```

Rien ne vérifie le contenu automatiquement : le score de la bonne action, l'accord
entre `isFake` et le biais, le lien `https` d'un thème, la catégorie d'une
ressource, le ton, et le fait que `reply` et `explication` ne se ressemblent
pas demandent une relecture à l'écran.
