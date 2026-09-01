# Architecture de CTRL INFO

Vue d'ensemble du code : ce qui se trouve où, et pourquoi. Pour ajouter ou
modifier du contenu, voir [contenu.md](contenu.md) ; pour la CI et le
déploiement, [devops.md](devops.md).

## 1. En une phrase

Une application React 19 qui ne porte plus aucun contenu : publications,
conversations, chapitres, ressources et tutoriels viennent de l'API
[ctrlinfo-app](../../ctrlinfo-app), et la progression du joueur y retourne —
quand il a un compte.

> **Ce document décrit l'état actuel.** Jusqu'à la mise en place du back, le
> site était entièrement statique et son contenu écrit à la main dans
> `src/data/`. Ces fichiers n'existent plus — seul reste `icones.js`, qui est
> du code : la table des noms d'icônes vers les composants lucide.

## 2. Arborescence

```
index.html            point d'entrée Vite
vite.config.js        Vite : plugin React, base d'URL, repli des adresses
tailwind.config.js    Tailwind, aligné sur la palette de src/css/colors.js

src/
  main.jsx            montage React + import de la feuille de style
  App.jsx             les fournisseurs (compte, jeux) et la table des routes
  routes.js           les adresses du site, et le titre de chaque page
  api/                le lien avec l'API : client, contenu, progression
  components/         coque, navigation, briques de jeu
    ui/Page.jsx       gabarit commun à tous les écrans
    ui/Chargement.jsx « ça charge » et « l'API ne répond pas »
  screens/            un fichier par écran
  data/               la table des icônes (du code, pas du contenu)
  css/                douze feuilles assemblées par index.css
  lib/                utilitaires purs + les crochets de chargement
  state/              état hors de React (compte, jeux, conversations en cours)

docs/                 cette documentation
public/               fichiers servis tels quels (logo)
```

## 3. Coque et navigation

L'écran affiché est choisi par **react-router**, à partir de l'adresse. Les
chemins sont décrits une seule fois, dans [routes.js](../src/routes.js), et la
table des routes est dans [App.jsx](../src/App.jsx).

```
BrowserRouter
└─ AppShell                       la coque, commune à toutes les routes
   ├─ AppHeader                   logo, règles du fil, pastille d'identité
   ├─ app__main ──── <Outlet />   l'écran de la route en cours
   ├─ TabBar                      la barre du bas, à toutes les tailles d'écran
   └─ GameTutorial                par-dessus tout, quand les règles sont ouvertes
```

| Adresse | Écran |
| --- | --- |
| `/` | `HomeScreen` |
| `/fil` | `FeedScreen` → `Feed` |
| `/conversations` · `/conversations/:slug` | `ChatScreen` |
| `/ressources` | `LearnScreen` |
| `/ressources/comprendre/:slug` | `ChapterScreen` |
| `/profil` | `ProfileScreen` |

Il ne reste qu'un seul état dans `AppShell` : `tutorial` — `{ auto }`, les
règles du fil et si elles se sont ouvertes seules. Le reste se lit dans
l'adresse.

Points de conception à connaître :

- **Ce qui est affiché est dans l'adresse.** Une conversation et un thème sont
  des pages : elles se partagent, se mettent en favori, et survivent à un
  rechargement. C'est aussi ce qui fait fonctionner le bouton « précédent ».
- **La coque parle à l'écran par le contexte de l'`<Outlet />`.** Le fil a
  besoin de savoir que les règles sont ouvertes pour arrêter son chrono : c'est
  la seule chose qui descend, et elle passe par là plutôt que par un état
  partagé.

- **Une seule navigation, en bas, à toutes les tailles.** La vue du téléphone
  est devenue la règle : sur ordinateur, la barre se centre et affiche ses
  intitulés, mais ne change pas de nature. Il n'y a plus de barre dans
  l'en-tête ni de menu déroulant de jeux.
- **Un onglet, un écran.** Les jeux ne sont plus regroupés derrière une
  galerie : le fil et les conversations sont au même rang que le reste du site.
  Les cinq entrées et leurs icônes — reprises du vocabulaire d'Instagram — sont
  décrites dans [navItems.js](../src/components/navItems.js) et nulle part
  ailleurs.
- **Il n'y a plus de page d'annuaire, ni de bouton flottant.** Les sites où
  vérifier une information sont devenus les **stories de l'accueil** : le même
  contenu, à l'endroit où l'on regarde en arrivant. L'onglet s'appelle
  « Ressources » et ne contient plus que les thèmes. Le seed refuse une
  ressource qu'aucune story ne porte — sans cela, elle deviendrait
  inatteignable.
- **Le tutoriel appartient à la coque, pas au jeu.** Il s'ouvre tout seul à la
  première partie (via [premiereFois.js](../src/lib/premiereFois.js), qui écrit
  dans `localStorage`) et par le bouton « Règles du jeu » de l'en-tête à tout
  moment. Sa fermeture remonte le fil, par un changement de clé, pour que la
  partie démarre à neuf.

## 3 bis. L'accueil

L'accueil suit la grammaire d'Instagram, de haut en bas :

| Bloc | Composant | Ce qu'il porte |
| --- | --- | --- |
| la bannière | `ui/Banniere` | le nom du site et son accroche, rien à cliquer |
| les stories | [StoryBar.jsx](../src/components/StoryBar.jsx) · [StoryViewer.jsx](../src/components/StoryViewer.jsx) | les sites où vérifier une info et les thèmes, en carrousel plein écran |
| les cartes | `HomeScreen` | le projet, la vidéo, les trois leviers |
| les annonces de jeux | `HomeScreen` | chaque jeu présenté comme une publication |
| la carte de sortie | `entry-card.css` | les deux entrées du site — la même carte qu'en fin de Ressources |

Deux choix à connaître :

- **La bannière ne porte plus de boutons.** Ils sont en fin de page, dans la
  carte partagée avec Ressources : on ne demande pas de choisir avant d'avoir
  lu.
- **Une story avance toute seule par une animation CSS**, pas par un minuteur.
  Quand le visiteur a demandé moins d'animations, elle ne tourne pas et la
  story attend : personne ne doit voir un texte disparaître avant de l'avoir
  fini. La brève « Le saviez-vous ? » suit la même retenue — une par jour, pas
  une par visite ([DailyTip.jsx](../src/components/DailyTip.jsx)).

## 4. Les deux jeux

Ils sont décrits une seule fois en base — titre, accroche, couleur, nom
d'icône, et les trois volets de leur tutoriel — et chargés une seule fois par
[FournisseurJeux.jsx](../src/state/FournisseurJeux.jsx).

> Un troisième jeu, « Repère les indices », a existé : une publication
> décomposée en éléments, dont il fallait désigner ceux qui posaient problème.
> Il a été retiré du site et de la base.

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

### « Les conversations » — [ChatScreen.jsx](../src/screens/ChatScreen.jsx)

Une boîte de réception et un fil, façon messagerie. Sur téléphone, une vue à la
fois ; à partir de 768 px, les deux volets côte à côte — même état, seule la
visibilité change.

Le joueur n'écrit jamais : le champ de saisie est barré, les réponses se
choisissent. Chaque choix produit deux contenus séparés, à ne pas confondre :
`reply` (ce que le personnage répond, en bulle) et `explication` (la voix
pédagogique, hors fiction, dans un bloc à part).

La conversation ouverte est dans l'adresse (`/conversations/:slug`) : son lien
se partage, et un rechargement la rouvre.

L'avancement dans une partie, lui, vit hors de React, dans
[conversationSessions.js](../src/state/conversationSessions.js) : changer
d'écran le démonte, mais la conversation reprend où elle en était. En mémoire
seulement — un rechargement de page repart de zéro.

## 5. L'onglet « Ressources »

La partie lecture du site, là où les jeux font pratiquer :
[LearnScreen.jsx](../src/screens/LearnScreen.jsx). Deux écrans et deux
adresses :

1. **la galerie** (`/ressources`) — une recherche en tête, puis une vignette
   par thème : son numéro, son titre, quelques lignes de résumé, et un lien
   externe qui mène plus loin ;
2. **le thème** (`/ressources/comprendre/:slug`), avec son texte entier.

- **Aucun texte de fond dans le JSX.** Tout vient de `GET /chapitres`.
- **Deux appels, et c'est voulu.** La galerie ne charge que les résumés ; le
  corps d'un thème n'arrive qu'à son ouverture. Même partage que pour les
  conversations.
- **Le corps d'un thème est une suite de blocs typés** — `TEXTE`, `LISTE`,
  `CHIFFRES`, `CONSEIL`. Le genre décide de la mise en page, pas du sujet :
  l'écran sait dessiner quatre formes, et n'a rien à savoir des huit thèmes.
- **Chaque thème mène quelque part.** Le lien d'aide (`lien.url`) est en base et
  vérifié au seed : une fiche qui ne renvoie nulle part n'est pas acceptée.
- **La lecture débouche sur autre chose.** Deux liens en fin de galerie mènent
  au fil et à l'annuaire : un thème lu ne doit pas être un cul-de-sac.

## 5 bis. L'onglet « Profil »

[ProfileScreen.jsx](../src/screens/ProfileScreen.jsx), deux états jamais
mélangés :

- **sans compte** — connexion, inscription, et le mode invité, annoncé pour ce
  qu'il est : tout reste jouable, mais rien n'est enregistré ;
- **connecté** — les chiffres du joueur, tels que `GET /moi/tableau-de-bord` les
  calcule : parties, complétion, scénarios et parcours, et surtout les biais sur
  lesquels il se fait avoir. Le front n'en recalcule aucun.

## 6. Les données

Le contenu du jeu vit dans la base de [ctrlinfo-app](../../ctrlinfo-app). Le
front ne le stocke pas, il le demande.

| Module | Rôle |
| --- | --- |
| [api/client.js](../src/api/client.js) | l'adresse de l'API, l'identité du joueur, le rejeu après expiration |
| [api/contenu.js](../src/api/contenu.js) | jeux, publications, conversations, chapitres, ressources, parcours |
| [api/progression.js](../src/api/progression.js) | parties, décisions, sauvegarde, tableau de bord |
| [lib/useRessource.js](../src/lib/useRessource.js) | charger, avec ses trois états |
| [lib/useSessionJeu.js](../src/lib/useSessionJeu.js) | ouvrir une partie côté serveur |
| [state/jeux.js](../src/state/jeux.js) | les jeux, chargés une fois pour toute l'application |
| [state/compte.js](../src/state/compte.js) | l'identité du joueur, partagée par l'en-tête et le profil |
| [data/icones.js](../src/data/icones.js) | le nom d'icône rangé en base → le composant lucide |

Trois choses à savoir :

- **L'API rend les formes d'avant.** `date`, `consequences`, `scores`,
  `apercu`, `steps.choices` : les composants n'ont pas eu à changer de langage,
  seulement d'origine. Ce qui s'ajoute est additif (`slug`, l'`id` d'un choix).
- **Deux identités, pas trois.** *Connecté* : un compte, un jeton, la
  progression enregistrée. *Invité* : aucun jeton, aucun compte en base, et les
  routes de progression ne sont même pas appelées — `api()` échoue tout de
  suite et `auMieux()` avale l'échec. Le contenu, lui, se lit dans les deux
  cas. L'état vit dans `api/client.js`, hors de React ; `FournisseurCompte` s'y
  abonne par `useSyncExternalStore`.
- **Il n'y a pas de repli local.** Si l'API ne répond pas, les écrans le disent
  ([ui/Chargement.jsx](../src/components/ui/Chargement.jsx)) plutôt que
  d'afficher une page vide. C'est le prix d'une source unique de vérité.

Le tirage des publications mérite un mot : le fil ne demande plus « les
publications de niveau 2 » mais un **tirage** de niveau 2, que le serveur
compose en écartant celles que ce joueur a déjà traitées. Deux parties de suite
ne se ressemblent donc pas.

## 7. Les styles

Toute la mise en forme passe par des classes maison en notation BEM
(`bloc__element--variante`), réparties en douze feuilles nommées en français et
assemblées par [index.css](../src/css/index.css) — qui ne contient aucune règle,
seulement le sommaire et les `@import`.

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
| `localStorage` (`api/client.js`) | la session du joueur (jetons) et le mode invité | permanent |
| `localStorage` (`premiereFois.js`) | tutoriels déjà vus | permanent |
| module en mémoire (`conversationSessions.js`) | conversations en cours | jusqu'au rechargement |
| `useState` | tout le reste | jusqu'au démontage de l'écran |

L'enregistrement d'une décision ne doit jamais interrompre une partie : les
appels de progression passent par `auMieux()`, qui avale l'échec. On perd la
trace d'un coup, pas la partie en cours. En mode invité, c'est le cas normal et
non un incident.

Les accès à `localStorage` sont tous enveloppés dans un `try` : en navigation
privée ou derrière un blocage de cookies, y écrire lève une exception. En cas
d'échec, la réponse est « oui, c'est la première fois » et le tutoriel se
remontre — jamais une page blanche.

## 9. Ce qui n'existe pas (et c'est assumé)

- **Aucun test côté front.** C'est le manque le plus coûteux ; voir
  [devops.md](devops.md) §3. (L'API, elle, en a.)
- **Aucun routeur** — donc aucune URL partageable vers un jeu ou un thème.
- **Aucune réinitialisation de mot de passe** : l'API ne la sert pas encore.
- **Aucun écran de parcours** : les parcours et le scénario existent en base et
  s'affichent dans le tableau de bord, mais aucun écran ne les fait jouer
  étape par étape.
- **Tailwind, en pratique** : installé et configuré, mais aucune classe
  utilitaire n'est écrite. Le retirer allégerait les dépendances au prix d'un
  reset CSS à réintroduire à la main (voir §7).
