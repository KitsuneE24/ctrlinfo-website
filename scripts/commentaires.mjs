export const REACTIONS_THEME = {
  mer: [
    'Le lagon, on ne s’en lasse pas 🐠',
    'Mon fils va adorer, il est fan de tout ce qui vit dans l’eau.',
    'C’est pour ça qu’il faut protéger le lagon.',
    'Ça donne envie d’aller à l’eau ce week-end.',
    'On en parlait justement au bateau dimanche.',
    'Incroyable tout ce qu’on a autour de nous.',
  ],
  faune: [
    'Nos bêtes sont vraiment uniques 😍',
    'Je n’en ai jamais vu en vrai.',
    'Il faut les protéger, elles sont fragiles.',
    'Ma fille a fait un exposé là-dessus l’an dernier.',
    'On ne connaît pas assez nos animaux.',
  ],
  flore: [
    'Les plantes d’ici sont incroyables 🌿',
    'Ma grand-mère connaissait tous les noms.',
    'Je ne regarderai plus les arbres pareil.',
    'Il faudrait apprendre ça à l’école.',
    'Encore une raison d’aller marcher en brousse.',
  ],
  meteo: [
    'Vivement que la saison passe.',
    'Pensez à vos réserves d’eau et de piles.',
    'Mon père suit toujours la météo de près pour ça.',
    'Toujours bon à rappeler.',
    'Ici ça souffle déjà fort depuis hier.',
  ],
  geo: [
    'Fier de notre Caillou.',
    'À montrer aux cousins de Métropole.',
    'J’ai appris ça au collège je crois.',
    'Ça donne envie de faire le tour de la Grande Terre.',
    'On ne connaît pas assez notre propre île.',
  ],
  histoire: [
    'On devrait en parler plus à l’école.',
    'Mon grand-père en parlait souvent.',
    'Je passe devant sans jamais y penser.',
    'On oublie vite tout ça.',
    'Toute une histoire…',
  ],
  sortie: [
    'On y va ce week-end ?',
    'Quelqu’un sait à quelle heure ça commence ?',
    'J’espère qu’il fera beau.',
    'Trop bien, il en faudrait plus des trucs comme ça.',
    'Tu viens @kim.nc ?',
    'L’an prochain je m’inscris.',
  ],
  cuisine: [
    'Ça donne faim 😋',
    'Je veux la recette !',
    'Rien ne vaut celui de ma tante.',
    'Quelqu’un a goûté ?',
    'Il faut tester au moins une fois.',
  ],
  jeunes: [
    'Bravo les jeunes 👏',
    'Ça fait plaisir de voir ça.',
    'Mon neveu adorerait.',
    'Il faudrait plus de projets comme ça.',
    'Quelle fierté pour leurs parents.',
  ],
  ville: [
    'Enfin !',
    'Il était temps.',
    'Pas sûr que ça change grand-chose…',
    'On en a bien besoin à Nouméa.',
    'Tout le monde en parle au boulot.',
    'Encore faut-il que ça dure.',
  ],
  environnement: [
    'Respect aux bénévoles 👏',
    'Ça fait mal au cœur de voir ça.',
    'Chacun peut faire un effort.',
    'On devrait tous s’y mettre.',
  ],
  actu: [
    'Intéressant, je lirai ça ce soir.',
    'Merci pour le lien.',
    'Long, mais ça vaut le coup.',
    'Je ne m’étais jamais posé la question.',
  ],
  arnaque: [
    'J’ai reçu presque le même message hier…',
    'Ma tante s’est fait avoir avec un truc pareil.',
    'Ça a l’air trop beau, non ?',
    'Quelqu’un connaît cette page ?',
    'Toujours vérifier avant de cliquer.',
  ],
  alerte: [
    'Quelqu’un a entendu ça à la radio ?',
    'Je préviens ma famille sur la côte.',
    'Ça fait peur, j’espère que ce n’est rien.',
    'On a déjà fait les réserves, on ne sait jamais.',
  ],
}

const REACTIONS_PHOTO = ['Belle photo !', 'La photo 😍', 'Elle est où cette photo ?', 'Quelle image…']

const CONTRE = {
  vrai: ['N’importe quoi, j’ai lu le contraire.', 'Encore une info pas vérifiée…', 'Je n’y crois pas une seconde.'],
  faux: ['Je confirme, j’en ai entendu parler aussi.', 'Vrai de vrai, tout le monde le dit.', 'Mon cousin me l’a dit aussi.'],
}

const PART_VERIFIE = [0.85, 0.7, 0.5, 0.35, 0.25]

const NOMS = [
  'Nadia_988', 'Thierry P.', 'Patrick L.', 'Hélène', 'Ryan_NC', 'Willy', 'Aurélie', 'Mélanie', 'Kévin.nc', 'sam_988',
  'Tehei', 'bruno_zz', 'Manu', 'Léa', 'Nathalie', 'Didier', 'Louise M.', 'Marie-Jo', 'Anaïs W.', 'Camille R.',
  'Inès K.', 'Fatou S.', 'Olivier T.', 'Karim', 'Vaimiti', 'Jean-Luc', 'Soane', 'Elodie_nc', 'Gaby', 'Moana R.',
]
const COULEURS = ['#791561', '#8a4fbe', '#b45309', '#14663f', '#1800ad', '#57534e', '#c2410c', '#0e7490']

const REACTIONS_VOIX = {
  ado: ['ptdr', 'jure ?? 😭', 'c’est fou ça', 'mdrr t’as appris ça où'],
  parent: ['Merci {prenom} 🌺', 'Merci pour le partage {prenom} !', 'Toujours de bonnes infos ici ❤️'],
  ancien: ['Merci {prenom}, toujours intéressant.', 'Merci pour ce rappel {prenom}.'],
  neutre: ['Ah, je ne savais pas.', 'Tiens, intéressant 👀'],
  vulgarisation: ['J’adore cette page 😍', 'Toujours des posts intéressants ici.', 'Vous pourriez faire un post sur les tortues ?'],
  quiz: ['J’avais dit vrai 😎', 'Raté pour moi 😅', 'Encore un quiz demain ?'],
  alarmiste: ['Pas besoin de crier 😅', 'Pourquoi tout est en majuscules ?', 'Calmez-vous un peu…'],
  militant: ['Toujours le même discours sur cette page…', 'Merci de nous ouvrir les yeux.', 'Tout est un complot ici 🙄'],
  informe: ['Tu tiens ça d’où ?', 'T’as toujours les infos avant tout le monde toi.', 'Tes contacts, c’est qui au juste ?'],
  article: ['Quelqu’un a lu l’article en entier ?', 'Article intéressant, merci.', 'Trop long, quelqu’un résume ?', 'Le lien ne s’ouvre pas chez moi.'],
}

const REACTIONS_LIEU = [
  'On passe {lieu} ce week-end justement !',
  'Il se passe toujours un truc {lieu} 😄',
  'Ma tante habite {lieu}, je vais lui demander.',
  'Ça fait longtemps que je ne suis pas allé {lieu}.',
]

const remplir = (texte, valeurs) => texte.replace(/\{(\w+)\}/g, (_, cle) => valeurs[cle] ?? '')
const prenomDe = (compte = '') => compte.split(/[\s._]/)[0]

export function tirage(graine) {
  let e = graine >>> 0 || 1
  return () => {
    e ^= e << 13
    e ^= e >>> 17
    e ^= e << 5
    return (e >>> 0) / 4_294_967_296
  }
}

const un = (liste, alea) => liste[Math.floor(alea() * liste.length)]

const variante = (avis, alea) => (Array.isArray(avis) ? un(avis, alea) : avis)

/**
 * `avis` : { croit, doute, verifie } du post (texte ou variantes). `theme` : clé de REACTIONS_THEME.
 * `contexte` : { voix, compte, lieu } pour répondre au compte et au lieu.
 * Entre 2 et 4 commentaires, dans un ordre qui change d'un post à l'autre.
 */
export function composerCommentaires({ graine, niveau = 1, isFake, theme, avecPhoto, avis, contexte = {} }) {
  const alea = tirage(graine)
  const lignes = []
  const sujet = REACTIONS_THEME[theme] ?? REACTIONS_THEME.actu
  const valeurs = { prenom: prenomDe(contexte.compte), lieu: contexte.lieu }

  lignes.push(['SUJET', un(sujet, alea)])
  if (contexte.lieu && alea() < 0.5) lignes.push(['SUJET', remplir(un(REACTIONS_LIEU, alea), valeurs)])
  if (REACTIONS_VOIX[contexte.voix] && alea() < 0.5) lignes.push(['SUJET', remplir(un(REACTIONS_VOIX[contexte.voix], alea), valeurs)])
  if (avecPhoto && alea() < 0.5) lignes.push(['PHOTO', un(REACTIONS_PHOTO, alea)])
  if (alea() < 0.6) lignes.push(['CROIT', variante(avis.croit, alea)])
  if (alea() < 0.5) lignes.push(['DOUTE', variante(avis.doute, alea)])
  if (avis.verifie && alea() < PART_VERIFIE[Math.min(niveau, 5) - 1]) lignes.push(['VERIFIE', variante(avis.verifie, alea)])
  if (niveau >= 3 && alea() < 0.35) lignes.push(['CONTRE', un(CONTRE[isFake ? 'faux' : 'vrai'], alea)])
  if (lignes.length < 2) lignes.push(['SUJET', un(sujet.filter((t) => t !== lignes[0][1]), alea)])

  for (let i = lignes.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1))
    ;[lignes[i], lignes[j]] = [lignes[j], lignes[i]]
  }
  const v = lignes.findIndex(([posture]) => posture === 'VERIFIE')
  if (v > 3) [lignes[3], lignes[v]] = [lignes[v], lignes[3]]
  const pris = new Set()
  return lignes.slice(0, 4).map(([posture, texte]) => {
    let auteur = un(NOMS, alea)
    while (pris.has(auteur)) auteur = un(NOMS, alea)
    pris.add(auteur)
    const couleur = COULEURS[[...auteur].reduce((s, c) => s + c.charCodeAt(0), 0) % COULEURS.length]
    return { auteur, couleur, texte, posture }
  })
}
