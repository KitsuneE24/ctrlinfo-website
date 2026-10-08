/**
 * Le compagnon : ses planches, ses postures, ce qu'il dit, et l'endroit où on
 * l'a posé la dernière fois.
 *
 * Le personnage est dessiné à la main, dans `public/cagou.png` : **neuf
 * vignettes de 32 × 48**, une planche unique qui contient les deux sens de
 * marche.
 *
 * ```
 *   0  1  2  3     4     5  6  7  8
 *   ← marche →   de face   ← marche →
 *   vers la gauche         vers la droite
 * ```
 *
 * Les deux sens étant dessinés, **rien n'est retourné en miroir** : changer de
 * direction change de vignettes, pas d'échelle. Un miroir aurait déplacé son
 * œil et sa mèche du mauvais côté.
 *
 * La dixième pose — celle où il regarde son téléphone pendant une partie — n'y
 * est pas : elle est fabriquée à partir de la vignette de face par
 * `scripts/generer-pose-telephone.mjs`, dans `public/cagou-telephone.png`.
 *
 * Tout ce qui décrit le personnage est ici ; le composant
 * [Compagnon](../components/Compagnon.jsx) ne fait que l'animer.
 *
 * **Changer de mascotte** ne demande pas de toucher au code : remplacer les
 * PNG de `public/` par des planches au même format suffit. Si le nombre ou
 * l'ordre des vignettes change, seule la table `POSTURES` ci-dessous bouge.
 */
import { PATHS } from '../routes'

/* ------------------------------------------------------------- les planches */

/** La taille d'une vignette dans la planche, en pixels. */
const VIGNETTE = { largeur: 32, hauteur: 48 }

/**
 * L'agrandissement à l'écran. **C'est le seul réglage de sa taille** : sa
 * vitesse, la longueur de son pas et les décalages de sa bulle en découlent.
 *
 *   1     32 × 48 — minuscule, à peine visible sur un grand écran
 *   1,5   48 × 72 — présent sans encombrer : la valeur retenue
 *   2     64 × 96 — franchement visible, il passe devant beaucoup de choses
 *
 * Un agrandissement entier garde des pixels parfaitement carrés. À 1,5, une
 * colonne sur deux est plus large d'un pixel physique sur un écran sans
 * densité — et exacte partout ailleurs, un écran deux fois plus dense
 * ramenant chaque pixel du dessin à trois pixels pleins. Le compromis est
 * assumé : il vaut mieux qu'il soit discret.
 */
const ECHELLE = 1.5

export const LARGEUR = VIGNETTE.largeur * ECHELLE
export const HAUTEUR = VIGNETTE.hauteur * ECHELLE

/**
 * Les images sont dans `public/`, pas dans `src/assets/` : ce sont des
 * fichiers qu'on remplace à la main, pas des modules. `BASE_URL` les préfixe —
 * le site est servi depuis un sous-chemin sur GitHub Pages, une adresse en
 * `/cagou.png` y tomberait à côté.
 */
const FEUILLES = {
  cagou: { url: `${import.meta.env.BASE_URL}cagou.png`, vignettes: 9 },
  telephone: { url: `${import.meta.env.BASE_URL}cagou-telephone.png`, vignettes: 4 },
}

/**
 * Les postures : la planche, la première vignette de la tranche, combien
 * s'enchaînent, et ce qui les fait défiler.
 *
 * `pas` est une **distance** : la vignette change tous les tant de pixels
 * parcourus. C'est ce qui empêche le patinage — les pieds avancent avec le
 * personnage, quelle que soit sa vitesse, quel que soit le nombre d'images par
 * seconde de l'écran. `cadence` est son équivalent en secondes, pour les
 * postures qui s'animent sans bouger.
 *
 * Une posture d'une seule vignette ne défile pas ; `effet` peut lui donner une
 * animation CSS à elle.
 */
const POSTURES = {
  marcheGauche: { feuille: 'cagou', debut: 0, images: 4, pas: 7 * ECHELLE },
  marcheDroite: { feuille: 'cagou', debut: 5, images: 4, pas: 7 * ECHELLE },
  // Au repos il se tourne vers le joueur : c'est la vignette de face.
  repos: { feuille: 'cagou', debut: 4, images: 1 },
  porte: {
    feuille: 'cagou',
    debut: 4,
    images: 1,
    effet: 'compagnon-gigote 0.4s ease-in-out infinite alternate',
  },
  telephone: { feuille: 'telephone', debut: 0, images: 4, cadence: 0.4 },
}

/**
 * La posture réelle derrière une posture logique et un sens de marche, avec la
 * planche déjà résolue. C'est le composant qui compte les pixels parcourus et
 * en tire la vignette : voir `decalage`.
 */
export function postureDe(posture, sens) {
  const nom = posture === 'marche' ? (sens < 0 ? 'marcheGauche' : 'marcheDroite') : posture
  const trouvee = POSTURES[nom] ?? POSTURES.repos
  return { ...trouvee, ...FEUILLES[trouvee.feuille] }
}

/**
 * Le décalage horizontal de la planche pour la vignette `index` d'une posture,
 * en pixels — jamais en pourcentage : en pourcentage, la dernière vignette
 * d'une planche tombe à côté.
 */
export const decalage = (debut, index) => -(debut + index) * LARGEUR

/**
 * Le style figé d'une posture : l'image et sa mise à l'échelle.
 *
 * **Le défilement n'est pas ici.** Il a d'abord été écrit en `@keyframes`
 * paramétrées par des variables CSS — une tranche de planche par posture — et
 * ça ne défilait pas : un `var()` dans une image-clé ne s'anime pas partout.
 * Le personnage glissait alors sans bouger les pattes. C'est maintenant la
 * boucle du composant qui écrit `background-position-x` à chaque image, ce qui
 * a l'avantage d'accrocher les vignettes à la distance parcourue.
 */
export function stylePosture(posture, sens) {
  const { url, vignettes, effet } = postureDe(posture, sens)
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${vignettes * LARGEUR}px ${HAUTEUR}px`,
    animation: effet ?? 'none',
  }
}

/* --------------------------------------------------------- se tenir quelque part */

/** Ce qu'il garde entre le bord de la zone et lui. */
export const MARGE = 10

/**
 * La hauteur du sol au-dessus du bas de la zone. Elle est écrite dans le style
 * de la scène plutôt que dans la feuille : le glisser en a besoin pour placer
 * le personnage sous le doigt, et une valeur en double se serait désaccordée.
 */
export const SOL = 2

/**
 * Sa vitesse, en pixels par seconde — celle du seul déplacement qu'il fasse :
 * se pousser de ce qu'il couvre.
 *
 * Elle n'a pas à s'accorder à la cadence des vignettes : celles-ci défilent à
 * la distance (`pas`), pas au temps. La changer le fait marcher plus ou moins
 * vite, et ses pattes suivent d'elles-mêmes — c'est `pas` qui règle le rythme
 * de ses jambes, ici 90 pixels par seconde pour une vignette tous les 10,5,
 * soit un peu moins de neuf images par seconde. C'est la cadence d'un
 * personnage pressé sans être affolé.
 *
 * Elle a longtemps valu un tiers de ça : le pas d'une promenade, hérité de
 * l'époque où il se baladait. Il ne se balade plus — il ne bouge que pour se
 * pousser de ce qu'il couvre, et une manœuvre doit être franche.
 *
 * Comme le pas, elle est proportionnelle à `ECHELLE` : un personnage plus
 * petit marche à la même allure apparente, il ne file pas.
 */
export const VITESSE = 60 * ECHELLE

/* --------------------------------------------------------- ce qu'il dit */

/**
 * Ses répliques. Une série par écran — il commente là où l'on est — plus un
 * fond commun qui explique ce qu'il est.
 *
 * Il les dit **de lui-même**, une par une, dans l'ordre : elles vont donc de la
 * plus utile à la plus anecdotique. Quand il les a toutes dites, il se tait
 * jusqu'au prochain écran.
 *
 * Ce sont des phrases de l'interface, pas du contenu de jeu : elles restent
 * dans le front, là où sont déjà les intitulés des boutons.
 */
const REPLIQUES = [
  [
    `${PATHS.resources}/comprendre`,
    [
      'Ici, pas de chrono ni de score : tu lis à ton rythme.',
      'Un exemple lu tranquillement se retient mieux qu’un score.',
    ],
  ],
  [
    PATHS.resources,
    [
      'Les thèmes expliquent les pièges que tu croises dans le fil.',
      '« Vérifier une info » liste des outils pour recouper. Garde-les sous la main.',
    ],
  ],
  [
    PATHS.chats,
    [
      'Dans une conversation, chaque réponse compte — c’est toi qui mènes.',
      'Quelqu’un qui pousse à partager vite, c’est déjà un signal.',
    ],
  ],
  [
    PATHS.feed,
    [
      'Le fil, c’est le jeu principal : vraie info ou intox, à toi de trancher.',
      'Regarde la source avant le contenu. Elle dit souvent tout.',
      'Un compte qui publie beaucoup en très peu de temps mérite un doute.',
    ],
  ],
  [
    PATHS.profile,
    [
      'Cet écran dit sur quels biais tu te fais avoir. C’est là qu’on progresse.',
      'Ta progression reste dans ce navigateur. Copie ton code pour l’emporter.',
    ],
  ],
  [
    PATHS.home,
    [
      'Le fil d’actualité est le meilleur endroit pour commencer.',
      'Les stories, en haut, mènent quelque part : un jeu, ou un thème à lire.',
    ],
  ],
]

/** De quoi il parle quand il n'a plus rien à dire sur l'écran en cours. */
const COMMUN = [
  'Tu peux m’attraper et me poser où tu veux.',
  'Si je te gêne, glisse-moi dans un coin — j’y resterai.',
  'Je ne compte rien et je ne note rien. Je suis juste là.',
]

/**
 * Les répliques de l'écran en cours, suivies du fond commun. L'ordre de la
 * table fait foi : du chemin le plus précis au plus large, comme les titres de
 * pages.
 */
export function repliquesPour(chemin) {
  const trouve = REPLIQUES.find(([prefixe]) => chemin.startsWith(prefixe))
  return [...(trouve ? trouve[1] : []), ...COMMUN]
}

/** Ce qu'il dit quand on le dérange pendant une partie. */
export const REPLIQUES_JEU = [
  'Joue, je regarde mon fil. On se parle après.',
  'Je scrolle un peu, ne fais pas attention à moi.',
]

/** La première phrase, à la première visite. */
export const BONJOUR =
  'Salut ! Je reste dans un coin, et je commente ce que tu fais.'

/**
 * Ce qu'il a à dire sur ce que fait le joueur, par signal reçu
 * ([state/compagnonSignaux.js](../state/compagnonSignaux.js)).
 *
 * `serie` est le nombre de fois d'affilée qu'il faut avoir fait la chose pour
 * qu'il la relève : une bonne réponse ne mérite pas un commentaire, trois de
 * suite oui. Un signal d'un autre nom remet les compteurs à zéro — une série,
 * c'est une série. Les répliques défilent à chaque série atteinte, pour qu'il
 * ne répète pas la même phrase toute la partie.
 */
export const REACTIONS = {
  bonneReponse: {
    serie: 3,
    lignes: [
      'Trois de suite. Tu commences à les voir venir.',
      'Encore trois. Ce n’est plus de la chance.',
    ],
  },
  mauvaiseReponse: {
    serie: 2,
    lignes: [
      'Deux d’affilée. Regarde qui publie avant de trancher.',
      'Ça remord. Le ton pressé, c’est souvent le piège.',
    ],
  },
  finPartie: {
    serie: 1,
    lignes: [
      'Fini ! Ton profil dit sur quels biais tu t’es fait avoir.',
      'Belle partie. On remet ça quand tu veux.',
    ],
  },
}

/* ------------------------------------------------------------- les délais */

/**
 * Le temps qu'une bulle reste à l'écran : **le temps de la lire**, pas une
 * durée fixe. Une phrase de trois mots n'a pas à occuper le coin de l'écran
 * aussi longtemps qu'une phrase de vingt.
 *
 * Le calcul est celui des sous-titres : une seconde et demie pour repérer la
 * bulle et y poser les yeux, puis quinze caractères par seconde — environ 180
 * mots à la minute, l'allure d'une lecture tranquille. Le tout borné : jamais
 * moins de quatre secondes, ce qui laisse le temps de tourner la tête ; jamais
 * plus de douze, on la ferme d'un doigt si l'on veut la garder.
 *
 * C'est aussi le temps pendant lequel il ne bouge pas.
 */
export function dureeLecture(texte) {
  const secondes = 1.5 + texte.length / 15
  return Math.round(Math.min(Math.max(secondes, 4), 12) * 1000)
}

/**
 * Les deux attentes avant qu'il ne parle de lui-même, en millisecondes.
 *
 * La première vaut à l'arrivée sur un écran, et elle est courte : c'est ce
 * qui fait qu'il **commente l'onglet où l'on vient d'aller** plutôt que de
 * placer un mot au hasard. La seconde sépare deux répliques ensuite — assez
 * longue pour qu'il ne tienne jamais la jambe.
 */
export const ATTENTE_ECRAN = 4000
export const ATTENTE_INACTIF = 45000

/* ------------------------------------------------------- où on l'a laissé */

const CLE = 'ctrl-info:compagnon:place'

/**
 * Sa place est retenue en fraction de la largeur, pas en pixels : d'un
 * téléphone à un écran large, il revient au même endroit relatif plutôt qu'à
 * un point qui n'existe plus.
 */
export function lirePlace() {
  try {
    const brut = window.localStorage.getItem(CLE)
    if (brut === null) return null
    const valeur = Number(brut)
    return Number.isFinite(valeur) && valeur >= 0 && valeur <= 1 ? valeur : null
  } catch {
    return null
  }
}

export function retenirPlace(fraction) {
  try {
    window.localStorage.setItem(CLE, String(Math.round(fraction * 1000) / 1000))
  } catch {
    // Au pire, il repartira du bord gauche à la prochaine visite.
  }
}
