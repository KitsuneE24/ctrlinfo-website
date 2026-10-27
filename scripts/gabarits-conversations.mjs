/**
 * Les conversations fabriquées à partir d'une publication fausse.
 *
 * Un proche transfère la publication ; le joueur doit faire remonter à
 * l'article d'origine, repérer ce qui a été ajouté, puis réparer le partage.
 */

/** Qui écrit. `soutien` n'existe que dans les groupes. */
export const DISTRIBUTIONS = [
  {
    groupe: false,
    lanceur: { id: 'tata-josiane', nom: 'Tata Josiane', role: 'votre tante', couleur: '#791561' },
  },
  {
    groupe: true,
    nom: 'Famille 🌺',
    lanceur: { id: 'tonton-georges', nom: 'Tonton Georges', role: 'votre oncle', couleur: '#b45309' },
    soutien: { id: 'maman', nom: 'Maman', role: 'votre mère', couleur: '#1800ad' },
  },
  {
    groupe: false,
    lanceur: { id: 'mathis', nom: 'Mathis', role: 'votre pote du lycée', couleur: '#14663f' },
  },
  {
    groupe: true,
    nom: 'Les potes 🏝️',
    lanceur: { id: 'kenzo', nom: 'Kenzo', role: 'votre pote', couleur: '#8a4fbe' },
    soutien: { id: 'maeva', nom: 'Maëva', role: 'votre pote', couleur: '#c2410c' },
  },
  {
    groupe: false,
    lanceur: { id: 'colette', nom: 'Colette', role: 'votre voisine', couleur: '#57534e' },
  },
]

/** Les trois étapes ; `correct` marque la bonne réponse. */
export function etapes({ post, a, gabarit, lanceur, soutien }) {
  const ajout = gabarit.ajout(a)

  return [
    {
      messages: [
        soutien && [soutien, 'Je l’ai vu passer aussi, ça tourne partout'],
        [lanceur, `Regarde ce que ${post.source} vient de publier : « ${post.titre} »`],
        [lanceur, `${gabarit.pression(a)} Je le transfère ?`],
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
          text: `Attends : ${post.source}, c’est qui ? On regarde si ${a.nom} en parle ?`,
          correct: true,
          reply: 'Bonne idée, je cherche…',
          explication:
            'Remonter à la source avant de partager : c’est le premier réflexe, et il prend une minute. Une rédaction connue qui publie le même fait permet de comparer.',
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
      messages: [
        [lanceur, `J’ai trouvé l’article de ${a.nom}, du ${a.date}. Le titre c’est « ${a.titre} ».`],
        [lanceur, 'Bon, c’est pareil au final, non ?'],
      ],
      choix: [
        {
          text: 'Oui, c’est la même info.',
          correct: false,
          reply: 'Tu vois ! Donc je peux partager l’autre version.',
          explication: `Pas tout à fait : le fait est le même, mais le post ajoute ${ajout}. C’est cet ajout qui trompe.`,
        },
        {
          text: `Le fait est vrai, mais l’autre version ajoute ${ajout}.`,
          correct: true,
          reply: 'Ah oui… je ne l’avais pas vu comme ça.',
          explication: `Comparer avec l’article d’origine montre ce qui a été ajouté. Le procédé utilisé ici : ${gabarit.biais.toLowerCase()}.`,
        },
        {
          text: 'Alors tout est faux, rien ne s’est passé.',
          correct: false,
          reply: `Ben si, ${a.nom} en parle quand même… je ne comprends plus rien.`,
          explication:
            'Le fait de départ est réel. Dire que tout est faux, c’est se tromper dans l’autre sens, et perdre la confiance de la personne.',
        },
      ],
    },
    {
      messages: [
        soutien && [soutien, 'Moi je l’ai déjà mis dans un autre groupe 🙈'],
        [lanceur, 'Le souci, c’est que je l’ai déjà envoyé à deux personnes 😬 Je fais quoi ?'],
      ],
      choix: [
        {
          text: `Envoie-leur le lien de ${a.nom} et dis que l’autre version est trompeuse.`,
          correct: true,
          reply: 'Ok, je fais ça, et j’explique pourquoi.',
          explication:
            'Corriger auprès des mêmes personnes, avec la source d’origine, c’est réparer le partage. Le lien fait le travail.',
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

export const outro = (a) => ({
  high: `Bien joué : vous avez fait comparer avec ${a.nom} sans braquer personne. Le réflexe : retrouver l’article d’origine et repérer ce qui a été ajouté.`,
  low: `Pas facile cette fois. Le réflexe à retenir : retrouver l’article d’origine (ici ${a.nom}) et comparer. Le fait est souvent vrai, c’est l’emballage qui trompe.`,
})
