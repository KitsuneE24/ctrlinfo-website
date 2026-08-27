# Architecture de CTRL INFO

Vue d'ensemble du code : ce qui se trouve où, et pourquoi. Pour ajouter ou
modifier du contenu, voir [contenu.md](contenu.md) ; pour la CI et le
déploiement, [devops.md](devops.md).

## 1. En une phrase

Une application React 19 qui ne porte plus aucun contenu de jeu : publications,
manches, conversations, ressources et tutoriels viennent de l'API
[ctrlinfo-app](../../ctrlinfo-app), et la progression du joueur y retourne.

> **Ce document décrit l'état actuel.** Jusqu'à la mise en place du back, le
> site était entièrement statique et son contenu écrit à la main dans
> `src/data/`. Ces fichiers n'existent plus — seuls restent `icones.js` (du
> code) et `learn.js` (le texte de l'onglet « Comprendre », qui n'est pas du
> contenu de jeu).

## 2. Arborescence

```
index.html            point d'entrée Vite
vite.config.js        configuration Vite (plugin React)
tailwind.config.js    Tailwind, aligné sur la palette de src/css/colors.js

src/
  main.jsx            montage React + import de la feuille de style
  App.jsx             pose le fournisseur des jeux au-dessus de la coque
  api/                le lien avec l'API : client, contenu, progression
  components/         coque, navigation, briques de jeu
    ui/Page.jsx       gabarit commun à tous les écrans
    ui/Chargement.jsx « ça charge » et « l'API ne répond pas »
  screens/            un fichier par écran
  data/               icônes (du code) et le texte de « Comprendre »
  css/                quatorze feuilles assemblées par index.css
  lib/                utilitaires purs + les crochets de chargement
  state/              état hors de React (sessions de conversation, jeux)

docs/                 cette documentation
public/               fichiers servis tels quels (logo)
```

## 3. Coque et navigation

Tout l'état de navigation vit dans un seul composant :
[AppShell.jsx](../src/components/AppShell.jsx). Il n'y a **pas de routeur** —
l'application n'a pas d'URL par écran.

```
AppShell
├─ AppHeader ──── TopNav          barre du haut (ordinateur)
├─ app__main ──── HomeScreen | LearnScreen | GameScreen | SourcesScreen
├─ TabBar                         barre du bas (téléphone)
├─ bouton flottant « Sources »    ordinateur seulement
└─ GameTutorial                   par-dessus tout, quand des règles sont ouvertes
```

Quatre états, tous dans `AppShell` :

| État | Rôle |
| --- | --- |
| `tab` | l'onglet affiché : `home`, `learn`, `game`, `sources` |
| `jeu` | le jeu en cours dans l'onglet Jeux : `feed`, `detect`, `chat`, ou `null` (galerie) |
| `avantSources` | l'onglet d'où l'on vient, pour que le bouton Sources sache où revenir |
| `tuto` | `{ id, auto }` — les règles ouvertes, et si elles se sont ouvertes seules |

Points de conception à connaître :

- **Les deux navigations sont toujours rendues.** C'est le CSS qui décide
  laquelle se montre, pas le JavaScript. Elles lisent les mêmes données
  ([navItems.js](../src/components/navItems.js)) et ne peuvent donc pas
  diverger.
- **Le tutoriel appartient à la coque, pas au jeu.** Il s'ouvre tout seul à la
  première partie (via [premiereFois.js](../src/lib/premiereFois.js), qui écrit
  dans `localStorage`) et par le bouton « Règles du jeu » à tout moment.
- **Deux drapeaux distincts** descendent vers `GameScreen` : `enAttente` (ce
  sont les règles d'ouverture, le jeu sera remonté à leur fermeture) et
  `enPause` (des règles sont à l'écran, le jeu garde son état mais suspend son
  chrono).

## 4. Les trois jeux

Ils sont décrits une seule fois en base — titre, accroche, couleur, nom
d'icône, et les trois volets de leur tutoriel — et chargés une seule fois par
[FournisseurJeux.jsx](../src/state/FournisseurJeux.jsx). La galerie, la barre
du jeu, le menu de l'en-tête et le tutoriel lisent tous ce contexte : ils ne
peuvent pas diverger.

### « Le fil d'actualité » — [Feed.jsx](../src/components/Feed.jsx)

Le jeu le plus fourni. Trois niveaux de 5 publications, une décision par
publication, un chrono de 30 secondes.

- **Les cinq publications sont tirées au sort par le serveur**, dans tout le
  vivier du niveau — celles écrites à la main comme celles fabriquées à partir
  des flux RSS — en écartant celles que ce joueur a déjà traitées.
- Le niveau entier est rendu d'un coup, en fil continu ; seule la publication
  en cours est interactive, les autres s'estompent (`opacityFor`).
- Trois actions existent dans les données — `share`, `ignore`, `report` — mais
  **deux boutons seulement** les déclenchent : « J'aime » et « Partager »
  envoient tous deux `share`. `ignore` n'est atteignable qu'en laissant filer le
  chrono. C'est volontaire : ne rien faire est un choix, et le jeu le compte
  comme tel.
- **Remédiation** : deux erreurs sur le même biais insèrent dans la file une
  publication d'entraînement ciblée (`GET /posts/remediations`, indexé par nom
  de biais). Ces publications ne comptent pas dans l'avancement du niveau.
- Chaque décision part à l'API, qui la corrige de son côté, la note, et retient
  la publication comme vue.

### « Repère les indices » — [DetectScreen.jsx](../src/screens/DetectScreen.jsx)

Là où le fil demande *quoi faire*, ce jeu demande *pourquoi*. Une publication
est décomposée en éléments (nom de compte, date, signature, source, photo) ; le
joueur désigne ceux qui posent problème.

Chaque manche contient des éléments parfaitement sains, et sur-signaler coûte un
point — c'est ce qui évite d'apprendre au joueur à se méfier de tout. Quatre
verdicts à la validation : repéré, manqué, fausse alerte, rien à signaler.

### « Les conversations » — [ChatScreen.jsx](../src/screens/ChatScreen.jsx)

Une boîte de réception et un fil, façon messagerie. Sur téléphone, une vue à la
fois ; à partir de 768 px, les deux volets côte à côte — même état, seule la
visibilité change.

Le joueur n'écrit jamais : le champ de saisie est barré, les réponses se
choisissent. Chaque choix produit deux contenus séparés, à ne pas confondre :
`reply` (ce que le personnage répond, en bulle) et `explication` (la voix
pédagogique, hors fiction, dans un bloc à part).

L'état des parties vit hors de React, dans
[conversationSessions.js](../src/state/conversationSessions.js) : changer
d'onglet démonte l'écran, mais la conversation reprend où elle en était. En
mémoire seulement — un rechargement de page repart de zéro.

## 5. L'onglet « Comprendre »

La partie lecture du site, là où les jeux font pratiquer :
[LearnScreen.jsx](../src/screens/LearnScreen.jsx). Neuf chapitres à la file,
précédés d'un sommaire collant.

- **Aucun texte de fond dans le JSX.** Tout le contenu vit dans
  [learn.js](../src/data/learn.js) ; l'écran ne fait que le mettre en page.
- `CHAPITRES` fixe l'ordre des sections **et** celui du sommaire — les deux
  lisent la même liste, ils ne peuvent donc pas se désaccorder.
- Le chapitre allumé dans le sommaire est calculé par un `IntersectionObserver`
  dont la racine est la zone défilante — c'est elle qui défile, pas la fenêtre,
  et `Page` expose sa `ref` précisément pour ça.
- L'écran reçoit `onNavigate` : deux renvois mènent aux onglets « Sources » et
  « Jeux », pour que la lecture débouche sur autre chose qu'un cul-de-sac.

## 6. Les données

Le contenu du jeu vit dans la base de [ctrlinfo-app](../../ctrlinfo-app). Le
front ne le stocke pas, il le demande.

| Module | Rôle |
| --- | --- |
| [api/client.js](../src/api/client.js) | l'adresse de l'API, l'identité du joueur, le rejeu après expiration |
| [api/contenu.js](../src/api/contenu.js) | jeux, publications, manches, conversations, ressources, parcours |
| [api/progression.js](../src/api/progression.js) | parties, décisions, sauvegarde, tableau de bord |
| [lib/useRessource.js](../src/lib/useRessource.js) | charger, avec ses trois états |
| [lib/useSessionJeu.js](../src/lib/useSessionJeu.js) | ouvrir une partie côté serveur |
| [state/jeux.js](../src/state/jeux.js) | les jeux, chargés une fois pour toute l'application |
| [data/icones.js](../src/data/icones.js) | le nom d'icône rangé en base → le composant lucide |
| [data/learn.js](../src/data/learn.js) | les chapitres de « Comprendre » — le seul texte encore dans ce dépôt |

Trois choses à savoir :

- **L'API rend les formes d'avant.** `date`, `consequences`, `scores`,
  `apercu`, `steps.choices` : les composants n'ont pas eu à changer de langage,
  seulement d'origine. Ce qui s'ajoute est additif (`slug`, l'`id` d'un choix).
- **Personne n'a besoin de compte.** Au premier appel, le front demande une
  session invitée et la range dans `localStorage`. C'est un vrai compte en
  base : la progression est enregistrée, et « créer un compte » plus tard ne
  fait qu'y ajouter une adresse et un mot de passe.
- **Il n'y a pas de repli local.** Si l'API ne répond pas, les écrans le disent
  ([ui/Chargement.jsx](../src/components/ui/Chargement.jsx)) plutôt que
  d'afficher une page vide. C'est le prix d'une source unique de vérité.

Le tirage des publications mérite un mot : le fil ne demande plus « les
publications de niveau 2 » mais un **tirage** de niveau 2, que le serveur
compose en écartant celles que ce joueur a déjà traitées. Deux parties de suite
ne se ressemblent donc pas.

## 7. Les styles

Toute la mise en forme passe par des classes maison en notation BEM
(`bloc__element--variante`), réparties en quatorze feuilles nommées en français et
assemblées par [index.css](../src/css/index.css) — qui ne contient aucune règle,
seulement le sommaire et les `@import`. Environ 3 450 lignes au total.

**Tailwind est installé mais n'est pas utilisé comme tel** : il n'y a aucune
classe utilitaire (`flex`, `p-4`, `text-sm`…) dans le JSX. Ce qu'il apporte
réellement au bundle se réduit à son *preflight* — la remise à zéro des styles
par défaut du navigateur — et au bloc de variables `--tw-*`. La configuration
(`tailwind.config.js`) déclare bien la palette et les polices, mais rien ne les
consomme. C'est un candidat au retrait : voir §9.

**L'ordre des imports fait foi** : à spécificité égale, une feuille tardive
l'emporte. `jetons` et `base` déclarent `@layer base` quand les autres déclarent
`@layer components`, ce qui les range après le preflight Tailwind.

[colors.js](../src/css/colors.js) double la palette côté JavaScript, pour les
fichiers de données qui attribuent une couleur et ne peuvent pas lire du CSS
(`tailwind.config.js` l'importe aussi, sans effet aujourd'hui). Il doit rester
aligné sur `jetons.css`.

Tous les écrans passent par le même gabarit,
[ui/Page.jsx](../src/components/ui/Page.jsx), qui expose quatre variantes :
`feed` (colonne centrée et bornée), `fill` (pleine hauteur, l'écran gère sa
mise en page), `seamless` (blocs enchaînés sans filet), et le défaut bord à
bord.

Une seule exception à « tout est en CSS » :
[MoltenMetal.jsx](../src/components/MoltenMetal.jsx) dessine le fond animé du
bandeau de tête dans un `<canvas>` WebGL 2 (via `ogl`), avec un *fragment
shader*. Il n'est jamais instancié à la main : [ui/Banniere.jsx](../src/components/ui/Banniere.jsx)
décrit ses réglages une fois, et les deux bandeaux du site — accueil et
« Comprendre » — en héritent, identiques par construction.

Il reste décoratif : sans WebGL 2, rien n'est dessiné et l'aplat violet du
bandeau (`--brand-violet-deep`) tient lieu de fond. La boucle de rendu s'arrête
dès que le bandeau sort de l'écran ou que l'onglet passe en arrière-plan, et le
rendu est plafonné à 1,5 pixel physique. Les deux bandeaux ne tournent jamais
ensemble : les écrans se remplacent, seul le fondu-enchaîné de la coque (0,16 s)
les fait brièvement coexister. Elle tourne en revanche pour tout le monde, y
compris pour qui a désactivé les effets d'animation de son système.

## 8. Persistance

Quatre mémoires, quatre portées — et l'une d'elles est désormais sur un
serveur :

| Où | Quoi | Durée |
| --- | --- | --- |
| la base, via l'API | parties, décisions, avancement, biais ratés | permanent |
| `localStorage` (`api/client.js`) | la session du joueur (jetons) | permanent |
| `localStorage` (`premiereFois.js`) | tutoriels déjà vus | permanent |
| module en mémoire (`conversationSessions.js`) | conversations en cours | jusqu'au rechargement |
| `useState` | tout le reste | jusqu'au démontage de l'écran |

L'enregistrement d'une décision ne doit jamais interrompre une partie : les
appels de progression passent par `auMieux()`, qui avale l'échec. On perd la
trace d'un coup, pas la manche en cours.

Les accès à `localStorage` sont tous enveloppés dans un `try` : en navigation
privée ou derrière un blocage de cookies, y écrire lève une exception. En cas
d'échec, la réponse est « oui, c'est la première fois » et le tutoriel se
remontre — jamais une page blanche.

## 9. Ce qui n'existe pas (et c'est assumé)

- **Aucun test côté front.** C'est le manque le plus coûteux ; voir
  [devops.md](devops.md) §3. (L'API, elle, en a.)
- **Aucun routeur** — donc aucune URL partageable vers un jeu précis.
- **Aucun écran de compte** : le joueur joue en invité, sa progression est
  gardée, mais rien dans l'interface ne propose encore de créer un compte, de
  se connecter, ni de voir son tableau de bord. L'API sert déjà les trois
  (`/auth/*`, `/moi/tableau-de-bord`).
- **Aucun écran de parcours** : les quatre parcours et le scénario existent en
  base et sont servis par l'API, mais aucun écran ne les propose.
- **Tailwind, en pratique** : installé et configuré, mais aucune classe
  utilitaire n'est écrite. Le retirer allégerait les dépendances au prix d'un
  reset CSS à réintroduire à la main (voir §7).
