// Planches générées par scripts/generer-sprite-cagou.mjs.
import { PATHS } from '../routes'

const VIGNETTE = { largeur: 32, hauteur: 48 }

const ECHELLE = 2.5

export const LARGEUR = VIGNETTE.largeur * ECHELLE
export const HAUTEUR = VIGNETTE.hauteur * ECHELLE

const FEUILLES = {
  cagou: { url: '/cagou.png', vignettes: 6 },
  chute: { url: '/cagou-chute.png', vignettes: 1, taille: { largeur: 148, hauteur: 68 } },
}

export const DEBORD_CHUTE = (FEUILLES.chute.taille.largeur - LARGEUR) / 2

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

export function postureDe(posture, sens) {
  const nom = posture === 'marche' ? (sens < 0 ? 'marcheGauche' : 'marcheDroite') : posture
  const trouvee = POSTURES[nom] ?? POSTURES.repos
  return { ...trouvee, ...FEUILLES[trouvee.feuille] }
}

export const decalage = (debut, index) => -(debut + index) * LARGEUR

export function stylePosture(posture, sens) {
  const { url, vignettes, effet, taille } = postureDe(posture, sens)
  const style = {
    backgroundImage: `url(${url})`,
    backgroundSize: `${vignettes * LARGEUR}px ${HAUTEUR}px`,
    animation: effet ?? 'none',
  }
  if (!taille) return style
  return {
    ...style,
    width: taille.largeur,
    height: taille.hauteur,
    marginLeft: (LARGEUR - taille.largeur) / 2,
    marginTop: HAUTEUR - taille.hauteur,
    backgroundSize: `${vignettes * taille.largeur}px ${taille.hauteur}px`,
  }
}

export const MARGE = 10

export const SOL = 2

export const VITESSE = 60 * ECHELLE

// Du plus précis au plus large ; l'accueil seulement sur « / ».
const REPLIQUES = [
  [
    `${PATHS.resources}/comprendre`,
    [
      'Ici, pas de chrono ni de score. Tu lis à ton rythme.',
      'Un exemple lu tranquillement se retient mieux qu’un score.',
      'Chaque chapitre parle d’un piège que tu croiseras dans le fil.',
      'Une fois lu, essaie de le repérer dans le fil. C’est là qu’il prend son sens.',
      'Je lis aussi, mais moins vite que toi.',
    ],
  ],
  [
    PATHS.resources,
    [
      'Les fiches expliquent les pièges que tu croises dans le fil.',
      'Les outils pour vérifier une image servent plus souvent qu’on ne croit. Garde-les sous la main.',
      'Un doute sur une info ? Un site de vérification a peut-être déjà fait le travail.',
      'Lire une fiche, c’est deux minutes. Rattraper un partage, c’est plus long.',
      'Tu peux trier les ressources par thème, juste au-dessus.',
    ],
  ],
  [
    PATHS.chats,
    [
      'Chaque contact a son sujet. À toi de choisir par qui commencer.',
      'Ici, la fake news vient de gens que tu aimes bien. C’est plus délicat.',
      'Le but n’est pas de gagner un débat, c’est de trouver les bons mots.',
      'De nouveaux sujets arrivent chaque jour. Repasse demain.',
      'Quelqu’un qui pousse à partager vite, c’est déjà un signal.',
    ],
  ],
  [
    PATHS.feed,
    [
      'Quand tu es prêt, lance la partie. Je regarderai de loin.',
      'Chaque post se juge : tu aimes, tu partages, ou tu signales.',
      'Plus tu avances, plus les fake news ressemblent aux vraies.',
      'Regarde qui publie avant de lire ce qui est publié.',
      'Un post qui te met en colère mérite une deuxième lecture.',
    ],
  ],
  [
    PATHS.profile,
    [
      'Ici, tu vois sur quels pièges tu te fais avoir. C’est comme ça qu’on progresse.',
      'Ta progression reste dans ce navigateur. Copie ton code pour l’emporter.',
      'Le piège qui te résiste le plus a sa fiche dans les Ressources.',
      'Si je te gêne, tu peux me cacher ici. Je ne le prendrai pas mal.',
      'Choisis un pseudo, ça fait plus sérieux.',
    ],
  ],
  [
    PATHS.legal,
    [
      'Les mentions légales. Pas le plus palpitant, mais c’est important.',
      'Tu cherches qui a fait le site ? C’est par ici.',
    ],
  ],
]

const ACCUEIL = [
  'Si tu ne sais pas par où commencer, le fil d’actualité est fait pour ça.',
  'Les stories, en haut, mènent quelque part : un jeu, ou un thème à lire.',
  'Tu préfères discuter ? Dans les Messages, ce sont tes proches qui partagent.',
  'Une fake news, ça se repère. Et ça s’apprend plutôt vite.',
  'Ici, tu peux te tromper tranquille. C’est fait pour ça.',
]

const COMMUN = [
  'Tu peux m’attraper et me poser où tu veux.',
  'Si je te gêne, glisse-moi dans un coin. J’y resterai.',
  'Je ne compte rien et je ne note rien. Je suis juste là.',
  'Un cagou, ça ne vole pas. Mais ça regarde avant de sauter.',
]

export function repliquesPour(chemin) {
  const trouve = REPLIQUES.find(([prefixe]) => chemin.startsWith(prefixe))
  const propres = trouve ? trouve[1] : chemin === PATHS.home ? ACCUEIL : []
  return [...propres, ...COMMUN]
}

const REPLIQUES_JEU = {
  feed: [
    'Je regarde mon fil aussi. On compare après ?',
    'Lis le nom du compte. Puis relis-le.',
    'Majuscules, points d’exclamation, « partagez vite » : ça sent le piège.',
    'Un chiffre sans source, c’est juste un chiffre.',
    'Je scrolle, je scrolle… Ne fais pas attention à moi.',
    'Une vraie info a souvent l’air un peu banale. C’est plutôt bon signe.',
  ],
  chat: [
    'Tes proches ne mentent pas exprès. Ils se sont fait avoir, comme tout le monde.',
    'Pas besoin d’avoir raison contre eux. Aide-les à vérifier.',
    'Une réponse calme convainc plus qu’une leçon.',
    '« Tu l’as lu où ? » : cette question marche presque toujours.',
    'Je lis par-dessus ton épaule. Discrètement.',
  ],
}

export const repliquesDuJeu = (jeu) => REPLIQUES_JEU[jeu] ?? Object.values(REPLIQUES_JEU).flat()

export const BONJOUR = 'Salut ! Moi, c’est le cagou. Je reste dans un coin et je commente ce que tu fais.'

export const REACTIONS = {
  bonneReponse: {
    serie: 3,
    lignes: [
      'Trois de suite. Tu commences à les voir venir.',
      'Encore trois. Ce n’est plus de la chance.',
      'Joli. Tu lis avant de réagir, ça se voit.',
      'Tu enchaînes. Je prends des notes.',
      'Bien joué, tu ne te laisses pas presser.',
    ],
  },
  mauvaiseReponse: {
    serie: 2,
    lignes: ['Deux d’affilée. Ça arrive à tout le monde, prends ton temps.'],
    parJeu: {
      feed: [
        'Deux d’affilée. Regarde qui publie avant de trancher.',
        'Ça arrive. Relis le titre sans l’émotion.',
        'Petit conseil : cherche la source avant le contenu.',
        'Le ton pressé, c’est souvent ça, le piège.',
      ],
      chat: [
        'Deux d’affilée. Essaie de poser une question plutôt que de juger.',
        'Pas facile avec les proches. Reste calme et propose de vérifier ensemble.',
        'Une source vaut mieux qu’un long argument.',
      ],
    },
  },
  finPartie: {
    serie: 1,
    lignes: [
      'Fini ! Ton profil dit sur quels pièges tu t’es fait avoir.',
      'Belle partie. On remet ça quand tu veux.',
      'Terminé. Une fiche dans les Ressources pour aller plus loin ?',
    ],
  },
}

export const lignesDeReaction = (reaction, jeu) => reaction.parJeu?.[jeu] ?? reaction.lignes

export function auHasard(lignes, sauf = []) {
  const libres = lignes.filter((ligne) => !sauf.includes(ligne))
  const choix = libres.length > 0 ? libres : lignes
  return choix[Math.floor(Math.random() * choix.length)]
}

export function dureeLecture(texte) {
  const secondes = 1.5 + texte.length / 15
  return Math.round(Math.min(Math.max(secondes, 4), 12) * 1000)
}

export const ATTENTE_ECRAN = 4000
export const ATTENTE_INACTIF = 45000

const CLE = 'ctrl-info:compagnon:place'

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
    // Stockage indisponible.
  }
}
