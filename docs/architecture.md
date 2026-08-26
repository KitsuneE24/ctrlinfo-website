# Architecture de CTRL INFO

Vue d'ensemble du code : ce qui se trouve où, et pourquoi. Pour la chaîne de
génération de contenu, voir [agent.md](agent.md) ; pour ajouter ou modifier du
contenu, [contenu.md](contenu.md) ; pour la CI et le déploiement,
[devops.md](devops.md).

## 1. En une phrase

Une application React 19 entièrement **statique** : pas de back-end, pas de base
de données, pas de compte utilisateur. Tout le contenu du jeu est du JavaScript
livré avec le bundle, produit soit à la main (`src/data/`), soit hors ligne par
l'agent (`agent/`).

## 2. Arborescence

```
index.html            point d'entrée Vite
vite.config.js        base URL (BASE_PATH pour GitHub Pages)
tailwind.config.js    Tailwind, aligné sur la palette de src/css/colors.js

src/
  main.jsx            montage React + import de la feuille de style
  App.jsx             ne fait que rendre AppShell
  components/         coque, navigation, briques de jeu
    ui/Page.jsx       gabarit commun à tous les écrans
  screens/            un fichier par écran
  data/               le contenu du jeu (posts, manches, conversations…)
  css/                douze feuilles assemblées par index.css
  lib/                utilitaires purs (localStorage, recherche floue)
  state/              état hors de React (sessions de conversation)

agent/                chaîne de génération hors ligne, voir agent.md
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
├─ app__main ──── HomeScreen | GameScreen | SourcesScreen
├─ TabBar                         barre du bas (téléphone)
├─ bouton flottant « Sources »    ordinateur seulement
└─ GameTutorial                   par-dessus tout, quand des règles sont ouvertes
```

Quatre états, tous dans `AppShell` :

| État | Rôle |
| --- | --- |
| `tab` | l'onglet affiché : `home`, `game`, `sources` |
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

Ils sont décrits une seule fois dans [games.js](../src/data/games.js) — titre,
accroche, couleur, icône, et les trois volets de leur tutoriel. La galerie, la
barre du jeu et le menu de l'en-tête lisent tous cette liste.

### « Le fil d'actualité » — [Feed.jsx](../src/components/Feed.jsx)

Le jeu le plus fourni. Trois niveaux de 5 publications, une décision par
publication, un chrono de 30 secondes.

- Le niveau entier est rendu d'un coup, en fil continu ; seule la publication
  en cours est interactive, les autres s'estompent (`opacityFor`).
- Trois actions existent dans les données — `share`, `ignore`, `report` — mais
  **deux boutons seulement** les déclenchent : « J'aime » et « Partager »
  envoient tous deux `share`. `ignore` n'est atteignable qu'en laissant filer le
  chrono. C'est volontaire : ne rien faire est un choix, et le jeu le compte
  comme tel.
- **Remédiation** : deux erreurs sur le même biais insèrent dans la file une
  publication d'entraînement ciblée (`remediationPosts`, indexé par nom de
  biais). Ces publications ne comptent pas dans l'avancement du niveau.

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

## 5. Les données

| Fichier | Contenu |
| --- | --- |
| [posts.index.js](../src/data/posts.index.js) | **point d'entrée unique** des publications |
| [posts.js](../src/data/posts.js) | le jeu de cartes écrit à la main (filet de sécurité) |
| `posts.generated.js` | produit par l'agent, non versionné |
| [detect.js](../src/data/detect.js) | les manches de « Repère les indices » |
| [conversations.js](../src/data/conversations.js) | les discussions et leurs branches |
| [games.js](../src/data/games.js) | les trois jeux et leurs tutoriels |
| [resources.js](../src/data/resources.js) | l'onglet Sources |

`posts.index.js` porte une règle importante : si `posts.generated.js` existe et
n'est pas vide, ce sont ses publications qui alimentent le fil ; sinon on
retombe sur le jeu écrit à la main. Le repli garantit que le jeu reste jouable
même sans génération. `import.meta.glob` est utilisé plutôt qu'un `import`
direct, pour que le build ne casse pas quand le fichier généré est absent.

Pour forcer le jeu manuel malgré une génération existante :
`VITE_USE_GENERATED=false npm run dev`.

Le module exporte aussi `source` (`'agent'` ou `'manuel'`) et `meta`, qui
décrivent l'origine du deck en cours.

## 6. Les styles

Tailwind est présent, mais l'essentiel de la mise en forme passe par des classes
maison, réparties en douze feuilles nommées en français et assemblées par
[index.css](../src/css/index.css) — qui ne contient aucune règle, seulement le
sommaire et les `@import`.

**L'ordre des imports fait foi** : à spécificité égale, une feuille tardive
l'emporte. `jetons` et `base` déclarent `@layer base` quand les autres déclarent
`@layer components`, ce qui les range après le preflight Tailwind.

[colors.js](../src/css/colors.js) double la palette côté JavaScript, pour les
deux endroits qui ne peuvent pas lire du CSS : `tailwind.config.js` et les
fichiers de données qui attribuent une couleur. Il doit rester aligné sur
`jetons.css`.

Tous les écrans passent par le même gabarit,
[ui/Page.jsx](../src/components/ui/Page.jsx), qui expose quatre variantes :
`feed` (colonne centrée et bornée), `fill` (pleine hauteur, l'écran gère sa
mise en page), `seamless` (blocs enchaînés sans filet), et le défaut bord à
bord.

## 7. Persistance

Trois mémoires, trois portées, aucune sur un serveur :

| Où | Quoi | Durée |
| --- | --- | --- |
| `localStorage` (`premiereFois.js`) | tutoriels déjà vus | permanent |
| module en mémoire (`conversationSessions.js`) | conversations en cours | jusqu'au rechargement |
| `useState` | tout le reste | jusqu'au démontage de l'écran |

Les accès à `localStorage` sont tous enveloppés dans un `try` : en navigation
privée ou derrière un blocage de cookies, y écrire lève une exception. En cas
d'échec, la réponse est « oui, c'est la première fois » et le tutoriel se
remontre — jamais une page blanche.

## 8. Ce qui n'existe pas (et c'est assumé)

- **Aucun test.** C'est le manque le plus coûteux ; voir [devops.md](devops.md) §3.
- **Aucun routeur** — donc aucune URL partageable vers un jeu précis.
- **Aucun score persistant** entre deux visites.
- **Aucun back-end** : l'agent tourne hors ligne, avant le build, et son
  résultat est un fichier JavaScript comme un autre.
