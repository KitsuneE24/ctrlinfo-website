# Architecture de CTRL INFO

Vue d'ensemble du code : ce qui se trouve où, et pourquoi. Pour ajouter ou
modifier du contenu, voir [contenu.md](contenu.md). Pour la mise en ligne, voir
[passation.md](passation.md).

## 1. En une phrase

Une application React 19 qui ne porte aucun contenu : publications,
conversations, chapitres, ressources et tutoriels sont lus dans
`public/donnees/contenu.json`. La progression du joueur, elle, ne retourne
nulle part : elle vit dans son navigateur, et s'emporte par un code qu'il copie.
Il n'y a ni compte, ni e-mail, ni mot de passe.

> `src/data/` ne contient que `icones.js`, qui est du code : la table des
> noms d'icônes vers les composants lucide.

## 2. Arborescence

```
index.html            point d'entrée Vite
vite.config.js        Vite : plugin React, deux entrées (site et administration)
netlify.toml          déploiement Netlify et repli des adresses
config.json           flux RSS de la récolte, chemin par défaut de l'administration
admin/index.html      point d'entrée de l'administration

src/
  main.jsx            montage React + import de la feuille de style
  App.jsx             le fournisseur des jeux et la table des routes
  routes.js           les adresses du site, et le titre de chaque page
  admin/              l'administration : formulaire déduit du contenu
  api/                lecture du contenu par collection
  components/         coque, navigation, briques de jeu
    ui/Page.jsx       gabarit commun à tous les écrans
    ui/Chargement.jsx « ça charge » et « le contenu est illisible »
  screens/            un fichier par écran
  data/               la table des icônes (du code, pas du contenu)
  css/                les feuilles de style, assemblées par index.css
  lib/                utilitaires purs + les crochets de chargement
  state/              état hors de React (progression, jeux, conversations)

docs/                 cette documentation
public/               fichiers servis tels quels : contenu, logo, planches du compagnon, enregistrer.php
scripts/              récolte des flux RSS, planches du compagnon (sources dans scripts/sprites/)
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
  « Comprendre » (page « Ressources ») et ne contient plus que les thèmes. Une ressource qu'aucune
  story ne porte devient inatteignable.
- **Le tutoriel appartient à la coque, pas au jeu.** Il s'ouvre tout seul à la
  première partie (via [premiereFois.js](../src/lib/premiereFois.js), qui écrit
  dans `localStorage`), puis par le bouton « ? » de l'interface de jeu à tout
  moment. Sa fermeture remonte le fil, par un changement de clé, pour que la
  partie démarre à neuf.

## 3.2 L'accueil

L'accueil suit la grammaire d'Instagram, de haut en bas :

| Bloc | Composant | Ce qu'il porte |
| --- | --- | --- |
| la bannière | `ui/Banniere` | l'accroche et les deux entrées du site |
| les stories | [StoryBar.jsx](../src/components/StoryBar.jsx) · [StoryViewer.jsx](../src/components/StoryViewer.jsx) | les sites où vérifier une info et les thèmes, en carrousel plein écran |
| le dossier | [TableauEnquete.jsx](../src/components/TableauEnquete.jsx) | tableau d'enquête : le sujet, ses pièges, le principe, la parade, reliés par un fil rouge |

À connaître :

- **Une story avance toute seule par une animation CSS**, pas par un minuteur.
  Quand le visiteur a demandé moins d'animations, elle ne tourne pas et la
  story attend : personne ne doit voir un texte disparaître avant de l'avoir
  fini. La brève « Le saviez-vous ? » suit la même retenue — une par jour, pas
  une par visite ([DailyTip.jsx](../src/components/DailyTip.jsx)).

## 3.3 Le compagnon

Un petit personnage en pixels vit en bas de l'écran :
[Compagnon.jsx](../src/components/Compagnon.jsx) pour le comportement,
[lib/compagnon.js](../src/lib/compagnon.js) pour tout ce qui le décrit —
planches, postures, répliques, place retenue.

Il se tient en bas de l'écran, **commente l'écran où l'on vient d'arriver** et
réagit aux coups de la partie. On peut le toucher pour l'entendre tout de
suite, et l'attraper pour le poser ailleurs : il retombe, s'écrase un instant,
et reste où on l'a mis — d'une visite à l'autre.

**Il se promène, mais seulement dans le vide.** Toutes les 4 à 9 secondes
(`PAUSE_BALADE`), il fait quelques pas dans la plage libre où il se trouve,
jamais au-dessus d'un texte ou d'un bouton. Il ne se promène pas pendant une
partie, ni quand sa bulle est ouverte.

### La planche

Les dessins sources sont dans `scripts/sprites/` : `sprite-cagou.png` (cinq poses de
marche et de face), `sprite-cagou-telephone.png` et `sprite-cagou-chute.png`.
[scripts/generer-sprite-cagou.mjs](../scripts/generer-sprite-cagou.mjs) les met
à la même échelle (mesurée sur le blanc des yeux) et en tire `public/cagou.png`,
**six vignettes égales** pieds alignés, et `public/cagou-chute.png`, plus large
que lui. Tout est au double de la taille d'affichage. À relancer si un dessin
change :

```bash
node scripts/generer-sprite-cagou.mjs
```

```
  0  1           2        3  4           5
  marche gauche  face     marche droite  téléphone
```

Les deux sens étant dessinés, **rien n'est retourné en miroir** : changer de
direction change de vignettes. Au repos, il joue la vignette de face : il se
tourne vers le joueur quand il s'arrête.

| Posture | Quand | Vignettes |
| --- | --- | --- |
| `marche` | il traverse son couloir, se retourne aux bords | 0-1 ou 3-4, selon le sens |
| `repos` | entre deux marches, quand il parle, et posé en lecture | 2, de face |
| `porte` | on le tient en main | 2, avec un balancement CSS |
| `telephone` | une partie est en cours | 5 |
| `chute` | lâché de plus haut que sa taille : étalé 1,2 s, puis il se relève | `cagou-chute.png`, 148 × 68 |

**`ECHELLE` est le seul réglage de sa taille** : sa vitesse, la longueur de son
pas et le bord de sa bulle en découlent. À 2,5 — la valeur retenue — il occupe
80 × 120 pixels : bien visible, avec un liseré clair pour se détacher du fond.

**Les vignettes défilent à la distance, pas au temps** : la patte change tous
les 10,5 pixels parcourus, un cycle complet toutes les 42 — soit, à 90 px/s, un
peu moins de neuf dessins par seconde, la cadence d'un personnage pressé sans
être affolé. Les dessins et le déplacement sont ainsi le même mouvement : le
sol ne file jamais sous ses pieds, quelle que soit sa vitesse ou le nombre
d'images par seconde de l'écran.
C'est la boucle du composant qui pose `background-position-x`, et non une
animation CSS : la première version, en `@keyframes` paramétrées par des
variables, ne défilait pas du tout — un `var()` dans une image-clé ne s'anime
pas partout — et le personnage glissait sans bouger les pattes.

### Ce qu'il dit

Les répliques sont dans `lib/compagnon.js`, rangées par écran, et il les dit
**de lui-même** : une peu après l'arrivée sur un onglet — c'est ce qui fait
qu'il commente là où l'on va — puis une autre de loin en loin, jusqu'à les
avoir toutes dites. Le minuteur n'est pas une boucle : chaque réplique dite
relance l'effet avec le délai suivant. Une réplique qui tombe mal — bulle déjà
ouverte, personnage dans la main — est remise à quelques secondes.

Il réagit aussi à la partie, par
[state/compagnonSignaux.js](../src/state/compagnonSignaux.js) : le fil et la
coque **signalent** ce qui vient d'arriver, lui seul **écoute**. Un contexte
aurait fait re-rendre toute la coque à chaque décision. Ce qu'il en fait — les
séries, ce qu'il en dit — n'appartient qu'à lui : trois bonnes réponses de
suite, deux erreurs, une partie finie.

### Points de conception

- **Il ne gêne jamais.** La scène couvre la zone de l'écran mais ne reçoit
  aucun clic ; seul le personnage en reçoit. Elle est posée dans `.app__main`,
  donc **au-dessus de la barre d'onglets et non dessus** : la navigation reste
  entière. Son `z-index` (25) le met devant le contenu et derrière l'écran de
  départ (40) comme les fenêtres (100).
- **Il ne marche pas sur les mots, ni devant les boutons.** Quelques colonnes
  par image, il relève avec `elementsFromPoint` ce qu'il y a sous la ligne du
  bas — du texte, ou quoi que ce soit qui se clique — et en garde un coût par
  colonne : zéro si c'est libre, trois si c'est occupé sur toute sa hauteur —
  la tête, le corps et les pattes sont sondés, car à deux hauteurs une ligne de
  texte passait pile entre les deux et il allait s'installer dessus. Dès qu'il
  couvre quelque chose, il marche jusqu'au vide le plus proche et s'y arrête —
  juste assez, il ne traverse pas l'écran pour rien. Si tout est occupé, le
  seuil monte d'un cran et il va là où il dérange le moins. **C'est en se
  déplaçant qu'il libère la vue, jamais en devenant transparent.**
- **Pendant une partie, il se met franchement sur le côté.** `AppShell` lui
  passe `enJeu` : il rejoint alors le bout du couloir plutôt que le vide le plus
  proche, et y sort son téléphone. C'est un retrait annoncé, pas un ajustement.
  Il continue de commenter les coups. **Chaque nouveau relevé remet sa place en
  question** — dans tous les cas, partie comprise : sans cela il la choisissait
  avant le premier relevé, donc à l'aveugle, et restait planté devant une carte
  jusqu'au changement d'écran.
- **La bulle vit dans sa boîte**, celle que la transformation déplace : elle le
  suit sans qu'une ligne de code ne la déplace. Un placement calculé image par
  image a été essayé et retiré — React réécrit les styles qu'il possède, et la
  bulle restait en arrière. Ses bords sont posés **en
  style en ligne, en pixels** : ils ont vécu en `calc()` sur une variable CSS,
  et une déclaration `calc()` invalide est jetée en silence par le navigateur —
  la bulle repartait alors se coller au bord de l'écran, sans le moindre
  message d'erreur. Sa largeur est mesurée à l'ouverture (la place qui reste
  jusqu'au bord) et il **ne bouge plus tant qu'elle est ouverte**, ce qui garde
  cette mesure vraie. Il attend d'ailleurs d'être sur une place libre pour
  parler : s'immobiliser au milieu d'un paragraphe serait le pire moment.
- **Une bulle reste le temps qu'on la lise** (`dureeLecture`) : une seconde et
  demie pour y poser les yeux, puis quinze caractères par seconde, borné entre
  quatre et douze secondes. Une phrase de trois mots n'occupe pas le coin de
  l'écran aussi longtemps qu'une phrase de vingt. C'est le seul état où il ne se déplace pas tout seul — et si on le
  repose ailleurs entre-temps, il reste où on l'a mis. Il continue de commenter
  les coups.
- **Le mouvement ne passe pas par React.** La position est écrite image par
  image dans le `transform` de l'élément ; seuls les changements rares — la
  posture, le sens, la bulle — sont des états. Une balade à soixante images par
  seconde ne doit pas re-rendre l'application.

**`prefers-reduced-motion` ne touche pas à son pas**, et c'est délibéré : se
pousser d'un texte n'est pas une animation décorative, c'est la seule chose qui
l'empêche de gêner. Ce qui reste à couper pour qui demande moins d'animations,
ce sont les fioritures — son balancement quand on le tient
— et la feuille de style s'en charge déjà.

Ce réglage a pourtant déjà coupé net son déplacement, puis l'a ralenti de
moitié : deux erreurs invisibles à la lecture du code, à vérifier à l'usage
après toute modification du compagnon.


## 4. Les deux jeux

Ils sont décrits une seule fois dans le contenu — titre, accroche, couleur, nom
d'icône, et les trois volets de leur tutoriel — et chargés une seule fois par
[FournisseurJeux.jsx](../src/state/FournisseurJeux.jsx).

> Un troisième jeu, « Repère les indices », a existé : une publication
> décomposée en éléments, dont il fallait désigner ceux qui posaient problème.
> Il a été retiré.

### « Le fil d'actualité » — [Feed.jsx](../src/components/Feed.jsx)

Le jeu le plus fourni. Un fil sans fin : des lots de 5 publications, du niveau 1
(gros signaux, sans chrono) au niveau 5 (un seul détail, 25 s), puis des
niveaux sans limite où le chrono raccourcit.

- **Chaque lot est tiré au sort** ([tirage.js](../src/lib/tirage.js)) dans le
  vivier du niveau, en écartant celles que ce joueur a déjà traitées.
- À la fin d'un lot, une annonce présente le niveau suivant par-dessus le fil
  (le chrono attend qu'elle se ferme) ; il n'y a pas d'écran de fin.
- Trois actions existent dans les données — `share`, `ignore`, `report` — mais
  **deux boutons seulement** les déclenchent : « J'aime » et « Partager »
  envoient tous deux `share`. `ignore` n'est atteignable qu'en laissant filer le
  chrono. C'est volontaire : ne rien faire est un choix, et le jeu le compte
  comme tel.
- **Remédiation** : deux erreurs sur le même biais insèrent dans la file une
  publication d'entraînement ciblée (`remediations`, indexé par nom de biais). Ces publications ne comptent pas dans l'avancement du niveau.
- Chaque décision est notée dans le navigateur, et la publication retenue comme
  vue.

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

## 5. L'onglet « Comprendre »

La partie lecture du site, là où les jeux font pratiquer :
[LearnScreen.jsx](../src/screens/LearnScreen.jsx). Deux écrans et deux
adresses :

1. **la galerie** (`/ressources`) — une recherche en tête, puis une vignette
   par thème : son numéro, son titre, quelques lignes de résumé, et un lien
   externe qui mène plus loin ;
2. **le thème** (`/ressources/comprendre/:slug`), avec son texte entier.

- **Aucun texte de fond dans le JSX.** Tout vient de `chapitres`.
- **Le corps d'un thème est une suite de blocs typés** — `TEXTE`, `LISTE`,
  `CHIFFRES`, `CONSEIL`. Le genre décide de la mise en page, pas du sujet :
  l'écran sait dessiner quatre formes, et n'a rien à savoir des huit thèmes.
- **Chaque thème mène quelque part.** Le lien d'aide (`lien.url`) est obligatoire :
  une fiche ne doit pas être un cul-de-sac.
- **La lecture débouche sur autre chose.** Deux liens en fin de galerie mènent
  au fil et à l'accueil (et ses stories) : un thème lu ne doit pas être un
  cul-de-sac.

## 5.2 L'onglet « Profil »

[ProfileScreen.jsx](../src/screens/ProfileScreen.jsx). Il n'y a pas de compte :
l'écran répond à une seule question — *où est passé ce
que j'ai fait ?* — en trois temps.

- **Ce que tu as fait** — points, parties, pourcentage de bonnes décisions,
  complétion du fil et des conversations, et les biais sur lesquels le joueur se
  fait avoir. Tout est calculé ici, à partir de
  [state/progression.js](../src/state/progression.js). Les totaux restent du
  contenu : combien de publications existent, combien de conversations.
- **Comment l'emporter** — [CodeProgression.jsx](../src/components/CodeProgression.jsx) :
  un bouton qui rend le code, un champ qui le relit.
- **Ce que tu veux voir** — l'avatar et les centres d'intérêt.

## 5.3 La progression, sans compte

Trois fichiers, et un principe : **le navigateur est la mémoire, le code est la
sauvegarde.**

| Module | Rôle |
| --- | --- |
| [state/progression.js](../src/state/progression.js) | le magasin : l'état, ses mutateurs, l'écriture dans `localStorage` |
| [state/useProgression.js](../src/state/useProgression.js) | le brancher sur React, par `useSyncExternalStore` |
| [lib/codeProgression.js](../src/lib/codeProgression.js) | l'état ⇄ une chaîne copiable, avec empreinte de contrôle |

- **Chaque écriture est immédiate.** Pas de minuterie ni de regroupement : une
  décision prise est une décision gardée, même si l'onglet se ferme dans la
  seconde. Les points sont ceux que le contenu porte (`post.scores`).
- **Pas de fournisseur.** Le magasin est un singleton de module ; les composants
  qui écrivent appellent ses fonctions directement, et ceux qui affichent
  s'abonnent par `useProgression()`. Un contexte n'aurait ajouté qu'un étage.
- **Deux granularités de reprise**, et c'est voulu. Une conversation entamée
  reprend au message près, parce que son fil se suffit à lui-même. Le fil
  d'actualité reprend au **niveau** atteint : retenir une file de tirage
  obligerait à redemander chaque publication par son slug pour resservir un fil
  déjà à moitié vu.
- **Le code ne transporte pas tout.** Le fil d'une conversation en cours en reste
  dehors : un code sert à emporter un avancement, pas à figer une discussion à
  moitié lue — et c'est lui qui pèserait le plus lourd.
- **La forme du code** : `CTRL1.z.<base64url>.<empreinte>`. La marque porte la
  version, `z`/`p` dit si la charge est déflatée, l'empreinte (FNV-1a, calculée
  avant compression) distingue « tronqué » de « complet » — du base64 amputé se
  décode souvent sans broncher en rendant des octets faux. Le point sépare parce
  qu'il n'appartient pas à l'alphabet base64url. Compression par
  `CompressionStream`, avec repli non comprimé : une liste de slugs français se
  déflate au cinquième, soit un code de six cents caractères au lieu de trois
  mille.
- **Un refus dit pourquoi.** `decoderCode` lève une `ErreurCode` portant une
  raison — `vide`, `forme`, `marque`, `version`, `illisible`, `abime`,
  `compression` — et son message. « Ce code a été abîmé en route » et « ce code
  vient d'une autre version du site » n'appellent pas le même geste.
- **Restaurer écrase.** Quand il y a quelque chose à perdre, l'écran le dit et
  demande une seconde fois. Le code est décodé *avant* cette question : inutile
  de faire hésiter le joueur sur un code de toute façon illisible.

Côté fil, [lib/tirage.js](../src/lib/tirage.js) ne sert que le niveau demandé
(le dernier du contenu au-delà) : d'abord les inédites, un procédé différent par
faux, puis les déjà vues, les plus anciennes d'abord. Les règles des niveaux au-delà
du dernier viennent de [lib/niveaux.js](../src/lib/niveaux.js).

## 6. Les données

Le contenu du jeu vit dans [public/donnees/](../public/donnees/) :
`contenu.json`, `posts-vrais.json` et `posts-faux.json`, chargés une seule fois
par onglet et réunis (`posts`) par [state/contenu.js](../src/state/contenu.js).

| Module | Rôle |
| --- | --- |
| [state/contenu.js](../src/state/contenu.js) | charge les trois fichiers, une fois |
| [api/contenu.js](../src/api/contenu.js) | une fonction par collection : jeux, publications, conversations, chapitres… |
| [lib/useRessource.js](../src/lib/useRessource.js) | charger, avec ses trois états |
| [state/jeux.js](../src/state/jeux.js) | les jeux, chargés une fois pour toute l'application |
| [state/progression.js](../src/state/progression.js) | l'avancement du joueur, dans son navigateur |
| [data/icones.js](../src/data/icones.js) | le nom d'icône du contenu → le composant lucide |

- **Il n'y a pas de repli.** Si le fichier manque ou est illisible, les écrans le disent
  ([ui/Chargement.jsx](../src/components/ui/Chargement.jsx)) plutôt que
  d'afficher une page vide. C'est le prix d'une source unique de vérité — et
  cela ne vaut que pour le contenu : la progression, elle, ne dépend d'aucun
  réseau.

Le tirage des publications mérite un mot : le fil ne demande plus « les
publications de niveau 2 » mais un **tirage** de niveau 2, composé au hasard et que le front filtre de ce qui a déjà été traité (voir 5.3).
Deux parties de suite ne se ressemblent donc pas.

## 7. Les styles

Toute la mise en forme passe par des classes maison en notation BEM
(`bloc__element--variante`), réparties en feuilles nommées en français et
assemblées par [index.css](../src/css/index.css) — qui ne contient aucune règle,
seulement le sommaire et les `@import`.

**Un seul fichier pour les couleurs, polices et tailles de base :**
[jetons.css](../src/css/jetons.css). Toutes les autres feuilles, la page
d'administration (`src/admin/admin.css`) et le JavaScript n'écrivent aucune
couleur : ils utilisent les noms (`var(--magenta)`, ou `couleur('magenta')` en JS
via [lib/couleurs.js](../src/lib/couleurs.js)). Une variante transparente garde
le nom de sa couleur : `color-mix(in srgb, var(--blanc) 5%, transparent)`.

**Les éléments communs** — gabarit de page, carte, bandeau, boutons
(`.bouton` et ses variantes `--plein`, `--encre`, `--petit`, `--large`),
étiquettes en capitales, tampon, papier, fenêtre, avatar, états de chargement —
sont dans [motifs.css](../src/css/motifs.css). Les autres feuilles ne
contiennent que ce qui est propre à un écran.

La remise à zéro des styles du navigateur est dans [base.css](../src/css/base.css).

**L'ordre des imports fait foi** : à spécificité égale, une feuille tardive
l'emporte.

Tous les écrans passent par le même gabarit,
[ui/Page.jsx](../src/components/ui/Page.jsx), qui expose quatre variantes :
`feed` (colonne centrée et bornée), `fill` (pleine hauteur, l'écran gère sa
mise en page), `seamless` (blocs enchaînés sans filet), et le défaut bord à
bord.

Une seule exception à « tout est en CSS » :
[MoltenMetal.jsx](../src/components/MoltenMetal.jsx) dessine le fond animé du
bandeau de tête dans un `<canvas>` WebGL 2 (via `ogl`), avec un *fragment
shader*. Il n'est jamais instancié à la main : [ui/FondMolten.jsx](../src/components/ui/FondMolten.jsx)
décrit ses réglages une fois (couleurs lues dans `jetons.css`), et les deux
bandeaux du site ainsi que le bloc du chrono (ordinateur) en héritent.

Il reste décoratif : sans WebGL 2, rien n'est dessiné et l'aplat violet du
bandeau (`--brand-violet-deep`) tient lieu de fond. La boucle de rendu s'arrête
dès que le bandeau sort de l'écran ou que l'onglet passe en arrière-plan, et le
rendu est plafonné à 1,5 pixel physique. Les deux bandeaux ne tournent jamais
ensemble : les écrans se remplacent, seul le fondu-enchaîné de la coque (0,16 s)
les fait brièvement coexister. Elle tourne en revanche pour tout le monde, y
compris pour qui a désactivé les effets d'animation de son système.

## 8. Persistance

Tout tient dans le navigateur : aucune donnée de progression ne part sur un
serveur.

| Où | Quoi | Durée |
| --- | --- | --- |
| `localStorage` (`progression.js`) | niveau, publications traitées, points, biais, conversations | permanent |
| `localStorage` (`premiereFois.js`) | stories déjà vues, règles lues, brève du jour | permanent |
| `localStorage` (`compagnonVisible.js`) | afficher ou non le compagnon (réglage du profil) | permanent |
| `localStorage` (`compagnon.js`) | où le compagnon a été posé, en fraction de largeur | permanent |
| module en mémoire (`conversationSessions.js`) | le numéro de partie d'une conversation | jusqu'au rechargement |
| `useState` | tout le reste | jusqu'au démontage de l'écran |

Les accès à `localStorage` sont tous enveloppés dans un `try` : en navigation
privée ou derrière un blocage de cookies, y écrire lève une exception. En cas
d'échec, la réponse est « oui, c'est la première fois » et l'élément se remontre
— jamais une page blanche. Pour la progression, la conséquence est nommée
explicitement : sans stockage, la partie en cours se joue normalement et c'est au
rechargement seulement que l'avancement est perdu. Le code d'export reste
exportable dans ce cas — c'est même sa raison d'être.

## 9. Ce qui n'existe pas (et c'est assumé)

- **Aucun test côté front.** C'est le manque le plus coûteux.
- **Une vérification du contenu limitée à sa forme** : `npm run verifier`
  ([verifier-donnees.mjs](../scripts/verifier-donnees.mjs)) contrôle les champs
  obligatoires, les doublons et le remplissage des niveaux. Le sens — un ton
  juste, une explication exacte — ne se voit qu'en jouant.
