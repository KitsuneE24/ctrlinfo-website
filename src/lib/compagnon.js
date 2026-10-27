/**
 * Le compagnon : planches, postures, répliques et place retenue.
 * Planches générées par `scripts/generer-sprite-cagou.mjs` :
 *
 * ```
 *   cagou.png        0  1      2       3  4      5
 *                    ← marche  de face  marche →  téléphone
 *   cagou-chute.png  étalé au sol
 * ```
 */
import { PATHS } from '../routes'

/* ------------------------------------------------------------- les planches */

/** Taille de base d'une vignette, avant `ECHELLE`. */
const VIGNETTE = { largeur: 32, hauteur: 48 }

/** Seul réglage de sa taille : vitesse, pas et bulle en découlent. */
const ECHELLE = 2.5

export const LARGEUR = VIGNETTE.largeur * ECHELLE
export const HAUTEUR = VIGNETTE.hauteur * ECHELLE

const FEUILLES = {
  cagou: { url: '/cagou.png', vignettes: 6 },
  chute: { url: '/cagou-chute.png', vignettes: 1, taille: { largeur: 148, hauteur: 68 } },
}

/** Ce que la chute dépasse de chaque côté de sa boîte. */
export const DEBORD_CHUTE = (FEUILLES.chute.taille.largeur - LARGEUR) / 2

/**
 * `debut` : première vignette ; `images` : nombre de vignettes.
 * `pas` : px parcourus par vignette ; `cadence` : secondes par vignette.
 * `effet` : animation CSS de la posture.
 */
const POSTURES = {
  marcheGauche: { feuille: 'cagou', debut: 0, images: 2, pas: 12 * ECHELLE },
  marcheDroite: { feuille: 'cagou', debut: 3, images: 2, pas: 12 * ECHELLE },
  repos: { feuille: 'cagou', debut: 2, images: 1 },
  porte: {
    feuille: 'cagou',
    debut: 2,
    images: 1,
    effet: 'compagnon-gigote 0.4s ease-in-out infinite alternate',
  },
  telephone: { feuille: 'cagou', debut: 5, images: 1 },
  chute: { feuille: 'chute', debut: 0, images: 1 },
}

/** La posture (sens de marche résolu) et sa planche. */
export function postureDe(posture, sens) {
  const nom = posture === 'marche' ? (sens < 0 ? 'marcheGauche' : 'marcheDroite') : posture
  const trouvee = POSTURES[nom] ?? POSTURES.repos
  return { ...trouvee, ...FEUILLES[trouvee.feuille] }
}

/** Décalage de la planche, en px, pour la vignette `index`. */
export const decalage = (debut, index) => -(debut + index) * LARGEUR

/** Image et taille d'une posture ; la vignette est posée par le composant. */
export function stylePosture(posture, sens) {
  const { url, vignettes, effet, taille } = postureDe(posture, sens)
  const style = {
    backgroundImage: `url(${url})`,
    backgroundSize: `${vignettes * LARGEUR}px ${HAUTEUR}px`,
    animation: effet ?? 'none',
  }
  if (!taille) return style
  // Planche plus large que lui : centrée, pieds au sol.
  return {
    ...style,
    width: taille.largeur,
    height: taille.hauteur,
    marginLeft: (LARGEUR - taille.largeur) / 2,
    marginTop: HAUTEUR - taille.hauteur,
    backgroundSize: `${vignettes * taille.largeur}px ${taille.hauteur}px`,
  }
}

/* --------------------------------------------------------- se tenir quelque part */

/** Écart minimal avec les bords de l'écran. */
export const MARGE = 10

/** Hauteur du sol au-dessus du bas de la zone. */
export const SOL = 2

/** Vitesse de marche, en px/s. */
export const VITESSE = 60 * ECHELLE

/* --------------------------------------------------------- ce qu'il dit */

/** Répliques par écran, de la plus utile à la plus anecdotique. */
const REPLIQUES = [
  [
    `${PATHS.resources}/comprendre`,
    [
      'Ici, pas de chrono ni de score : vous lisez à votre rythme.',
      'Un exemple lu tranquillement se retient mieux qu’un score.',
    ],
  ],
  [
    PATHS.resources,
    [
      'Les thèmes expliquent les pièges que vous croisez dans le fil.',
      '« Vérifier une info » liste des outils pour recouper. Gardez-les sous la main.',
    ],
  ],
  [
    PATHS.chats,
    [
      'Dans une conversation, chaque réponse compte — c’est vous qui menez.',
      'Quelqu’un qui pousse à partager vite, c’est déjà un signal.',
    ],
  ],
  [
    PATHS.feed,
    [
      'Le fil, c’est le jeu principal : vraie info ou fake news, à vous de trancher.',
      'Regardez la source avant le contenu. Elle dit souvent tout.',
      'Un compte qui publie beaucoup en très peu de temps mérite un doute.',
    ],
  ],
  [
    PATHS.profile,
    [
      'Cet écran dit sur quels biais vous vous faites avoir. C’est là qu’on progresse.',
      'Votre progression reste dans ce navigateur. Copiez votre code pour l’emporter.',
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

const COMMUN = [
  'Vous pouvez m’attraper et me poser où vous voulez.',
  'Si je vous gêne, faites-moi glisser dans un coin — j’y resterai.',
  'Je ne compte rien et je ne note rien. Je suis juste là.',
]

/** Répliques de l'écran puis communes ; chemins du plus précis au plus large. */
export function repliquesPour(chemin) {
  const trouve = REPLIQUES.find(([prefixe]) => chemin.startsWith(prefixe))
  return [...(trouve ? trouve[1] : []), ...COMMUN]
}

export const REPLIQUES_JEU = [
  'Jouez, je regarde mon fil. On se parle après.',
  'Je scrolle un peu, ne faites pas attention à moi.',
]

export const BONJOUR =
  'Bonjour ! Je reste dans un coin, et je commente ce que vous faites.'

// `serie` : nombre d'affilée avant de réagir.
export const REACTIONS = {
  bonneReponse: {
    serie: 3,
    lignes: [
      'Trois de suite. Vous commencez à les voir venir.',
      'Encore trois. Ce n’est plus de la chance.',
    ],
  },
  mauvaiseReponse: {
    serie: 2,
    lignes: [
      'Deux d’affilée. Regardez qui publie avant de trancher.',
      'Ça remord. Le ton pressé, c’est souvent le piège.',
    ],
  },
  finPartie: {
    serie: 1,
    lignes: [
      'Fini ! Votre profil dit sur quels biais vous vous êtes fait avoir.',
      'Belle partie. On remet ça quand vous voulez.',
    ],
  },
}

/* ------------------------------------------------------------- les délais */

/** Durée d'une bulle, en ms : 1,5 s + 15 caractères/s, entre 4 et 12 s. */
export function dureeLecture(texte) {
  const secondes = 1.5 + texte.length / 15
  return Math.round(Math.min(Math.max(secondes, 4), 12) * 1000)
}

/** Attente avant de parler, en ms : à l'arrivée sur un écran, puis entre deux répliques. */
export const ATTENTE_ECRAN = 4000
export const ATTENTE_INACTIF = 45000

/* ------------------------------------------------------- où on l'a laissé */

const CLE = 'ctrl-info:compagnon:place'

/** Place retenue, en fraction de la largeur de l'écran. */
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
    // Stockage indisponible : il repartira du bord gauche.
  }
}
