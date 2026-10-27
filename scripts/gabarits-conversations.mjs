// Les contacts de la messagerie. `soutien` n'existe que dans les groupes.
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

// Plusieurs tournures par étape : deux sujets sur le même procédé ne se ressemblent pas.
const OUVERTURES = [
  (source, titre) => `Regarde ce que ${source} vient de publier : « ${titre} »`,
  (source, titre) => `Tu as vu ça ? ${source} : « ${titre} »`,
  (source, titre) => `On m’a envoyé ça ce matin, c’est de ${source} : « ${titre} »`,
]
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

// `correct` marque la bonne réponse ; `variante` choisit les tournures.
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
