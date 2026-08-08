import {
  Lightbulb,
  MessagesSquare,
  MousePointerClick,
  Newspaper,
  ScanSearch,
  Target,
} from 'lucide-react'

/**
 * Les jeux, décrits une seule fois. Trois endroits s'en servent et ne peuvent
 * donc pas diverger : le menu déroulant de l'onglet « Jeux », la
 * sous-navigation à l'intérieur de la page, et la galerie de présentation.
 *
 * Les conversations en font partie : c'est un jeu comme les deux autres, avec
 * ses règles et son score — pas un onglet de messagerie.
 *
 * `capture` attend un chemin d'image dans /public (ex. '/captures/fil.png').
 * Tant qu'il vaut null, un cadre d'attente occupe la place exacte du visuel,
 * pour que la mise en page ne bouge pas quand les vraies captures arriveront.
 *
 * `tuto` est le carrousel montré la première fois qu'on ouvre le jeu, et une
 * seule fois (voir src/lib/premiereFois.js). Trois volets, toujours les mêmes
 * questions dans le même ordre — on apprend à jouer aux trois jeux de la même
 * manière :
 *
 *   1. le but      — ce qu'on cherche à faire ;
 *   2. les actions — ce qu'on peut faire, concrètement ;
 *   3. le pourquoi — ce que le jeu apprend au passage.
 */
const VOLETS = {
  but: { Icon: Target, titre: 'Le but' },
  actions: { Icon: MousePointerClick, titre: 'Ce que tu peux faire' },
  pourquoi: { Icon: Lightbulb, titre: 'Comment ça marche' },
}

/** Un volet de tutoriel : l'icône et le titre sont communs, le texte non. */
const volet = (cle, texte) => ({ ...VOLETS[cle], texte })

const games = [
  {
    id: 'feed',
    couleur: 'var(--nav-feed)',
    Icon: Newspaper,
    titre: "Le fil d'actualité",
    court: "Fil d'actualité",
    accroche: 'Trois niveaux, une décision par publication.',
    capture: null,
    description:
      "Tu fais défiler un fil de publications, une à la fois. Certaines sont vraies, d'autres fausses, d'autres encore vraies mais sorties de leur contexte. À toi de décider quoi en faire.",
    points: [
      'Aime, partage ou signale chaque publication',
      'Un chrono de 30 secondes pour lire et réfléchir',
      'Chaque choix est expliqué, bon ou mauvais',
    ],
    tuto: [
      volet(
        'but',
        "Un fil de publications défile, comme sur tes réseaux. Certaines sont vraies, d'autres fausses, d'autres vraies mais sorties de leur contexte. Ton but : réagir à chacune comme tu le ferais vraiment."
      ),
      volet(
        'actions',
        "Trois gestes, un seul par publication : « J'aime » et « Partager » si tu la crois fiable, « Signaler » si elle te paraît trompeuse. Un chrono de 30 secondes tourne — c'est le temps qu'on prend rarement."
      ),
      volet(
        'pourquoi',
        "Après chaque choix, le jeu te dit ce qu'il en était et pourquoi. Trois niveaux s'enchaînent, de plus en plus retors : ce sont les explications qui comptent, pas le score."
      ),
    ],
  },
  {
    id: 'detect',
    couleur: 'var(--nav-detect)',
    Icon: ScanSearch,
    titre: 'Repère les indices',
    court: 'Indices',
    accroche: "Ce n'est plus quoi faire, mais pourquoi.",
    capture: null,
    description:
      "Une publication est décomposée en éléments : nom de compte, date, signature, source citée, photo. Tu désignes ceux qui posent problème — et seulement ceux-là.",
    points: [
      'Trois manches de difficulté croissante',
      "Tout n'est pas suspect : sur-signaler coûte un point",
      'Chaque élément est justifié à la validation',
    ],
    tuto: [
      volet(
        'but',
        "Une publication est posée devant toi, découpée en morceaux : le nom du compte, la date, la signature, la source citée, la photo. Ton but : désigner ceux qui posent problème — et seulement ceux-là."
      ),
      volet(
        'actions',
        "Touche un élément pour le marquer comme suspect, touche-le à nouveau pour changer d'avis. Quand ta sélection te convient, valide. Attention : marquer un élément parfaitement normal coûte un point."
      ),
      volet(
        'pourquoi',
        "À la validation, chaque élément est justifié, ceux que tu as vus comme ceux que tu as laissés passer. Trois manches, de plus en plus fines : on passe du « quoi faire » au « qu'est-ce qui cloche »."
      ),
    ],
  },
  {
    id: 'chat',
    couleur: 'var(--nav-chat)',
    Icon: MessagesSquare,
    titre: 'Les conversations',
    court: 'Conversations',
    accroche: 'Quand la fausse info vient de tes proches.',
    capture: null,
    description:
      "Des discussions comme tu en as tous les jours : un proche t'envoie une information douteuse, un inconnu insiste un peu trop. Tu réponds en choisissant une bulle.",
    points: [
      'Plusieurs discussions, chacune avec son piège',
      'Tu réponds en choisissant, jamais en tapant',
      'Chaque réponse est commentée juste après',
    ],
    tuto: [
      volet(
        'but',
        "Des discussions comme tu en as tous les jours : un proche t'envoie une information douteuse, un inconnu insiste un peu trop. Ton but : répondre sans vexer, mais sans laisser passer."
      ),
      volet(
        'actions',
        "Tu n'écris jamais — le champ de saisie reste barré. Quand c'est à toi, des réponses toutes prêtes s'ouvrent au-dessus : tu choisis celle que tu enverrais vraiment."
      ),
      volet(
        'pourquoi',
        "Chaque réponse est commentée juste après : ce qu'elle produit chez l'autre, et ce qu'une autre aurait produit. Plusieurs discussions s'enchaînent, chacune avec son piège."
      ),
    ],
  },
]

/** Un autre jeu que celui en cours — proposé à la fin d'une partie. */
export function autreJeu(id) {
  return games.find((jeu) => jeu.id !== id) ?? null
}

export default games
