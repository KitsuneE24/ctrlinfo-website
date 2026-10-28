export const DISTRIBUTIONS = [
  {
    id: 'tata-josiane',
    groupe: false,
    lanceur: { id: 'tata-josiane', nom: 'Tata Josiane', role: 'votre tante', couleur: '#791561' },
  },
  {
    id: 'famille',
    groupe: true,
    nom: 'Famille 🌺',
    lanceur: { id: 'tonton-georges', nom: 'Tonton Georges', role: 'votre oncle', couleur: '#b45309' },
    soutien: { id: 'maman', nom: 'Maman', role: 'votre mère', couleur: '#1800ad' },
  },
  {
    id: 'mathis',
    groupe: false,
    lanceur: { id: 'mathis', nom: 'Mathis', role: 'votre pote du lycée', couleur: '#14663f' },
  },
  {
    id: 'potes',
    groupe: true,
    nom: 'Les potes 🏝️',
    lanceur: { id: 'kenzo', nom: 'Kenzo', role: 'votre pote', couleur: '#8a4fbe' },
    soutien: { id: 'maeva', nom: 'Maëva', role: 'votre pote', couleur: '#c2410c' },
  },
  {
    id: 'colette',
    groupe: false,
    lanceur: { id: 'colette', nom: 'Colette', role: 'votre voisine', couleur: '#57534e' },
  },
  {
    id: 'papi-rene',
    groupe: false,
    lanceur: { id: 'papi-rene', nom: 'Papi René', role: 'votre grand-père', couleur: '#1800ad' },
  },
  {
    id: 'collegues',
    groupe: true,
    nom: 'Collègues ☕',
    lanceur: { id: 'sylvie', nom: 'Sylvie', role: 'votre collègue', couleur: '#14663f' },
    soutien: { id: 'franck', nom: 'Franck', role: 'votre collègue', couleur: '#b45309' },
  },
  {
    id: 'club-foot',
    groupe: true,
    nom: 'Club de foot ⚽',
    lanceur: { id: 'coach-alain', nom: 'Coach Alain', role: 'l’entraîneur', couleur: '#57534e' },
    soutien: { id: 'jordan', nom: 'Jordan', role: 'un joueur', couleur: '#8a4fbe' },
  },
]

// Une citation dans une citation prend des guillemets anglais.
const citer = (texte) => `« ${texte.replace(/«\s?/g, '“').replace(/\s?»/g, '”')} »`

const OUVERTURES = [
  (source, titre) => `Regarde ce que ${source} vient de publier : ${citer(titre)}`,
  (source, titre) => `Tu as vu ça ? ${source} : ${citer(titre)}`,
  (source, titre) => `On m’a envoyé ça ce matin, c’est de ${source} : ${citer(titre)}`,
]

const OUVERTURES_ARNAQUE = [
  (source, titre) => `Regarde ce que je viens de voir, c’est ${source} : ${citer(titre)}`,
  (source, titre) => `Trop bien ça ! ${source} : ${citer(titre)}`,
  (source, titre) => `Tu crois que c’est vrai ? ${source} : ${citer(titre)}`,
]
const RASSURE = [
  'Mais ils ont l’air sérieux, il y a plein de likes et de commentaires.',
  'Mais la page a un logo et tout, ça fait officiel.',
  'Mais plein de gens l’ont partagé, ça ne peut pas être faux.',
]
const TROP_TARD = [
  'Euh… j’ai déjà fait ce qu’ils demandaient 😬 Je fais quoi ?',
  'Trop tard, j’ai déjà rempli le formulaire 🙈 On fait quoi ?',
  'Aïe, j’ai déjà répondu… Je rattrape comment ?',
]

// Déroulé des arnaques : ne pas agir, vérifier, puis réparer si c'est trop tard.
export function etapesArnaque({ post, gabarit, lanceur, soutien, variante = 0 }) {
  return [
    {
      messages: [
        soutien && [soutien, parmi(SOUTIENS_1, variante)],
        [lanceur, parmi(OUVERTURES_ARNAQUE, variante)(post.source, post.titre)],
        [lanceur, `${gabarit.pression} J’y vais ?`],
      ],
      choix: [
        {
          text: 'Vas-y, tu n’as rien à perdre.',
          correct: false,
          reply: 'Ok, j’y vais 🤞',
          explication: `Dans une arnaque, on a toujours quelque chose à perdre : de l’argent, ses codes ou son compte. Ici, c’est ${gabarit.ajout}.`,
        },
        {
          text: gabarit.conseil,
          correct: true,
          reply: 'Ah… ok, j’attends alors.',
          explication: 'S’arrêter avant de cliquer, payer ou envoyer un code : c’est le réflexe qui déjoue presque toutes les arnaques.',
        },
        {
          text: 'Franchement, il faut être naïf pour tomber là-dedans.',
          correct: false,
          reply: 'Merci… Je vais le faire quand même, tu n’as rien expliqué.',
          explication: 'Tout le monde peut se faire avoir, surtout quand le piège est bien fait. Se moquer n’aide pas : expliquer, oui.',
        },
      ],
    },
    {
      messages: [[lanceur, parmi(RASSURE, variante + 1)]],
      choix: [
        {
          text: 'C’est vrai, s’il y a des likes, c’est fiable.',
          correct: false,
          reply: 'Tu vois !',
          explication: 'Likes, logo et commentaires se fabriquent ou s’achètent. Ils ne disent rien de qui est derrière.',
        },
        {
          text: gabarit.verifier,
          correct: true,
          reply: 'Ah oui, je n’avais pas regardé ça.',
          explication: `C’est un piège connu : ${gabarit.biais.toLowerCase()}. Vérifier qui est derrière prend une minute.`,
        },
        {
          text: 'De toute façon, tout est arnaque sur internet.',
          correct: false,
          reply: 'Donc on ne peut plus rien faire en ligne ? Super…',
          explication: 'Tout rejeter n’aide pas à reconnaître les vrais pièges. Le bon réflexe est de vérifier qui est derrière.',
        },
      ],
    },
    {
      messages: [
        soutien && [soutien, 'Moi j’ai déjà répondu hier 🙈'],
        [lanceur, parmi(TROP_TARD, variante + 2)],
      ],
      choix: [
        {
          text: gabarit.reparer,
          correct: true,
          reply: 'Ok, je fais ça tout de suite.',
          explication: 'Agir vite limite les dégâts : bloquer, changer ses accès, signaler. Et prévenir les autres évite qu’ils tombent dans le même piège.',
        },
        {
          text: 'Pas de panique, ça va sûrement s’arranger tout seul.',
          correct: false,
          reply: 'Bon… j’attends alors.',
          explication: 'Une arnaque ne s’arrange pas seule : chaque heure compte pour bloquer une carte ou récupérer un compte.',
        },
        {
          text: 'Supprime juste le message, et n’en parle à personne.',
          correct: false,
          reply: 'Supprimé. Mais ils ont déjà mes infos…',
          explication: 'Supprimer n’efface pas ce qui a été envoyé. Il faut bloquer, changer ses accès, et signaler.',
        },
      ],
    },
  ]
}
const SOUTIENS_1 = [
  'Je l’ai vu passer aussi, ça tourne partout',
  'Ah oui, on m’en a parlé hier',
  'C’est fou, non ?',
]
const RECHERCHES = [
  ['J’ai cherché, je ne trouve aucune source sérieuse qui dit ça.', 'Mais ça a l’air sérieux quand même, non ?'],
  ['Bizarre, je ne trouve ça nulle part ailleurs.', 'Ils sont peut-être les premiers à le savoir ?'],
  ['J’ai tapé la phrase sur internet : il n’y a que ce post.', 'C’est peut-être un scoop, non ?'],
]
const DEJA_ENVOYE = [
  'Le souci, c’est que je l’ai déjà envoyé à deux personnes 😬 Je fais quoi ?',
  'Trop tard, je l’ai mis dans un autre groupe hier soir 🙈 On fait quoi ?',
  'Aïe, je l’ai déjà transféré à plusieurs personnes… Je rattrape comment ?',
]
const SOUTIENS_3 = [
  'Moi je l’ai déjà mis dans un autre groupe 🙈',
  'Moi aussi je l’ai envoyé, oups',
  'J’ai même mis un pouce dessus…',
]

const parmi = (liste, n) => liste[n % liste.length]

export function etapes({ post, gabarit, lanceur, soutien, variante = 0 }) {
  return [
    {
      messages: [
        soutien && [soutien, parmi(SOUTIENS_1, variante)],
        [lanceur, parmi(OUVERTURES, variante)(post.source, post.titre)],
        [lanceur, `${gabarit.pression} Je le transfère ?`],
      ],
      choix: [
        {
          text: 'Oui, envoie, au cas où.',
          correct: false,
          reply: 'Ok, je l’envoie partout 📤',
          explication:
            '« Au cas où » fait circuler la plupart des fake news : chaque transfert de bonne foi lui donne la caution de quelqu’un qu’on connaît.',
        },
        {
          text: `Attends : ${post.source}, c’est qui ? On cherche une source sérieuse ?`,
          correct: true,
          reply: 'Bonne idée, je cherche…',
          explication:
            'Remonter à la source avant de partager : c’est le premier réflexe, et il prend une minute. Si c’est vrai, une source sérieuse le dit aussi.',
        },
        {
          text: 'C’est encore une fake news, t’es trop crédule.',
          correct: false,
          reply: 'Merci, sympa… Je l’envoie quand même, tu n’as même pas regardé.',
          explication:
            'Se moquer ferme la discussion. La personne se braque et partagera ailleurs, là où personne ne la contredira.',
        },
      ],
    },
    {
      messages: parmi(RECHERCHES, variante + 1).map((texte) => [lanceur, texte]),
      choix: [
        {
          text: 'Oui, s’ils l’ont écrit, c’est que c’est vrai.',
          correct: false,
          reply: 'Tu vois ! Donc je peux partager.',
          explication: `Avoir l’air sérieux ne suffit pas. Ici, personne d’autre n’en parle, et le post ajoute ${gabarit.ajout}.`,
        },
        {
          text: `Si aucune source sérieuse ne le dit, c’est un signal. Et le post ajoute ${gabarit.ajout}.`,
          correct: true,
          reply: 'Ah oui… je ne l’avais pas vu comme ça.',
          explication: `Une info qu’aucune source sérieuse ne confirme, plus un procédé pour faire réagir : c’est ce qu’on appelle ${gabarit.biais.toLowerCase()}.`,
        },
        {
          text: 'De toute façon, tout est faux sur internet.',
          correct: false,
          reply: 'Donc je ne peux plus rien croire ? Super…',
          explication:
            'Tout rejeter, c’est se tromper dans l’autre sens. Le bon réflexe est de vérifier, pas de ne plus rien croire.',
        },
      ],
    },
    {
      messages: [
        soutien && [soutien, parmi(SOUTIENS_3, variante + 2)],
        [lanceur, parmi(DEJA_ENVOYE, variante + 2)],
      ],
      choix: [
        {
          text: 'Écris-leur que tu n’as trouvé aucune source sérieuse, et pourquoi.',
          correct: true,
          reply: 'Ok, je fais ça, et j’explique pourquoi.',
          explication:
            'Corriger auprès des mêmes personnes, en expliquant ce qui manque, c’est réparer le partage.',
        },
        {
          text: 'Supprime le message, personne ne verra rien.',
          correct: false,
          reply: 'Supprimé. Mais eux l’ont déjà lu…',
          explication:
            'Supprimer ne rattrape pas ceux qui ont déjà lu. Sans correction, ils restent sur la mauvaise version et peuvent la transférer.',
        },
        {
          text: 'Laisse, ce n’est pas bien grave.',
          correct: false,
          reply: 'Bon, tant pis alors.',
          explication:
            'Un post trompeur circule tant que personne ne le corrige. Celui qui l’a envoyé est le mieux placé pour le faire.',
        },
      ],
    },
  ]
}

export const outro = {
  high: 'Bien joué : vous avez fait vérifier sans braquer personne. Le réflexe : chercher une source sérieuse, et repérer ce qui pousse à réagir.',
  low: 'Pas facile cette fois. Le réflexe à retenir : avant de transférer, chercher une source sérieuse. Si aucune ne le confirme, on ne partage pas.',
}
