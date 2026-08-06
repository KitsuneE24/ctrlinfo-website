import { brand } from '../styles/colors'

/**
 * Mini-jeux de conversation (écrans « Mini-jeu conv » de la maquette).
 *
 * Chaque conversation se joue comme une discussion privée : l'interlocuteur
 * envoie un message, le joueur répond en choisissant une bulle.
 *
 * Chaque choix produit deux contenus distincts, et c'est volontaire :
 *
 *   - `reply`       : ce que le personnage répond, dans son rôle. C'est de la
 *                     conversation — affiché en bulle, avec le délai de frappe.
 *   - `explication` : pourquoi ce choix fonctionne ou non. C'est la voix
 *                     pédagogique, hors fiction — affichée dans un bloc à part,
 *                     sans avatar ni délai de frappe.
 *
 * Les `prompt` sont les messages qui interrogent : ils relancent la discussion
 * et attendent une réponse. Les trois registres — question, réplique,
 * explication — ne doivent jamais se ressembler à l'écran.
 *
 * Pour ajouter une conversation, il suffit d'ajouter une entrée ici : l'écran
 * et la boîte de réception se mettent à jour tout seuls.
 */
const conversations = [
  {
    id: 'apprenti',
    name: 'Tuteur journalisme',
    subtitle: 'Mode pédagogie',
    preview: 'On révise les réflexes de base ?',
    color: brand.blue,
    intro: [
      "Salut ! Je suis ton tuteur pour cette session. Ici, c'est moi qui pose les questions et toi qui cherches le bon réflexe.",
      "Trois situations, trois réponses possibles à chaque fois. Aucune n'est piégeuse : je commente après chaque choix.",
    ],
    steps: [
      {
        prompt:
          "Première situation. Une photo d'inondation à Nouméa est publiée il y a dix minutes par un compte que tu ne connais pas. Quel est ton premier réflexe ?",
        choices: [
          {
            text: 'Je la partage tout de suite pour prévenir mes proches.',
            correct: false,
            reply:
              "Je comprends l'intention — mais tu viens de faire exactement ce que ce post attendait de toi.",
            explication:
              "Une photo d'inondation ancienne, republiée au bon moment, se propage en quelques minutes. La volonté de prévenir ses proches est précisément le levier utilisé : elle transforme chaque personne de bonne foi en relais.",
          },
          {
            text: 'Je cherche si un média local publie la même image.',
            correct: true,
            reply: "Voilà. C'est le premier geste, et il prend trente secondes.",
            explication:
              "Si un événement de cette ampleur avait lieu, la presse locale en parlerait. Ce recoupement suffit à écarter l'essentiel des fausses alertes, sans compétence technique particulière.",
          },
          {
            text: "Je regarde combien de « J'aime » elle a.",
            correct: false,
            reply: "Ça ne t'apprendra rien sur la véracité, malheureusement.",
            explication:
              "La popularité n'est pas une preuve. Un contenu peut cumuler des milliers de partages précisément parce qu'il est spectaculaire — c'est même souvent le cas des contenus faux.",
          },
        ],
      },
      {
        prompt:
          "Deuxième situation. Un article affirme qu'« une étude » prouve son propos, mais ne donne ni le nom de l'étude, ni son auteur, ni de lien. Qu'est-ce que ça t'apprend ?",
        choices: [
          {
            text: "Rien de spécial, c'est courant dans la presse.",
            correct: false,
            reply: 'Pas dans la presse qui cite ses sources.',
            explication:
              "Un média sérieux nomme sa source, justement pour qu'on puisse aller la contredire. L'absence de source n'est pas un détail de mise en page : c'est ce qui sépare une information d'une affirmation.",
          },
          {
            text: "Que l'étude est forcément inventée.",
            correct: false,
            reply: "Attention, là tu vas trop vite dans l'autre sens.",
            explication:
              "L'étude existe peut-être. Le problème, c'est qu'en l'état tu ne peux pas le savoir. Douter n'est pas conclure au faux — et traiter de faux tout ce qu'on ne peut pas vérifier fabrique une autre forme d'erreur.",
          },
          {
            text: "Que l'information est invérifiable tant que la source n'est pas nommée.",
            correct: true,
            reply: "C'est exactement la bonne nuance.",
            explication:
              "Une info sans source n'est ni vraie ni fausse : elle est invérifiable. Et une info invérifiable ne se partage pas — c'est une règle simple qui évite la plupart des mauvais réflexes.",
          },
        ],
      },
      {
        prompt:
          "Dernière situation. Un post t'énerve tellement que tu as envie de répondre dans la seconde. Tu fais quoi ?",
        choices: [
          {
            text: "Je réponds à chaud, ça se voit que c'est faux.",
            correct: false,
            reply: 'Et au passage, le post gagne de la visibilité.',
            explication:
              "La colère est le carburant du partage. Répondre à chaud fait remonter le contenu dans les fils, et pousse souvent à écrire des choses qu'on ne pourrait pas prouver soi-même.",
          },
          {
            text: "J'attends quelques minutes et je vérifie avant de réagir.",
            correct: true,
            reply: 'Oui. Le délai est une compétence à part entière.',
            explication:
              "La plupart des contenus manipulatoires ne survivent pas à cinq minutes de vérification. Laisser retomber l'émotion n'est pas de la passivité : c'est la condition pour réagir utilement.",
          },
          {
            text: 'Je bloque le compte et je passe à autre chose.',
            correct: false,
            reply: "Ce n'est pas une faute — mais ce n'est pas fini.",
            explication:
              "Tu te protèges, c'est légitime. Mais le contenu reste en ligne pour tous les autres : un signalement aurait eu un effet au-delà de ton propre fil.",
          },
        ],
      },
    ],
    outro: {
      high: "Beau parcours. Tu as les bons réflexes : recouper, exiger une source, laisser passer l'émotion. Va tester ça dans le fil de jeu.",
      low: "C'est déjà un bon début. Retiens surtout ces trois gestes : recouper, exiger une source nommée, et laisser retomber l'émotion avant de réagir. Relance la conversation quand tu veux.",
    },
  },

  {
    id: 'convaincre',
    name: 'Personne à informer',
    subtitle: 'Mode convaincre',
    preview: "Tu as vu ce qu'ils cachent sur l'eau ?",
    color: brand.magenta,
    intro: [
      "Cette fois, les rôles s'inversent : c'est toi qui dois convaincre. En face, quelqu'un de sincère qui a lu une fausse information et s'apprête à la relayer.",
      "L'objectif n'est pas d'avoir raison, c'est qu'il ou elle accepte de vérifier. Humilier quelqu'un ne l'a jamais fait changer d'avis.",
    ],
    steps: [
      {
        prompt:
          "Regarde ce que je viens de recevoir : « L'eau du robinet est traitée avec un produit interdit depuis des années. » C'est un médecin qui le dit, il a été censuré pour ça. Je préviens le groupe famille.",
        choices: [
          {
            text: "N'importe quoi, arrête de croire tout ce que tu lis.",
            correct: false,
            reply:
              "Franchement ? Tu me prends pour un imbécile. Je vais le partager quand même, tu n'as même pas regardé.",
            explication:
              "Attaquer la personne plutôt que l'information déclenche un réflexe de défense. On ne renonce pas à une conviction pour donner raison à quelqu'un qui vient de nous humilier — c'est le plus sûr moyen de figer la position d'en face.",
          },
          {
            text: 'Attends, on regarde ensemble qui est ce médecin avant de le transmettre ?',
            correct: true,
            reply:
              "Bon… d'accord, on peut regarder. Mais je ne vois pas ce que ça change, il dit ce que personne n'ose dire.",
            explication:
              "« On regarde ensemble » place les deux personnes du même côté. C'est une proposition, pas un verdict : elle laisse la porte ouverte, et c'est la seule condition pour que la vérification soit acceptée.",
          },
          {
            text: "C'est faux, l'eau est contrôlée en permanence, tout le monde sait ça.",
            correct: false,
            reply:
              "« Tout le monde sait » ? C'est exactement ce que je pensais avant de lire ça. Tu n'as pas plus de preuve que moi.",
            explication:
              "Opposer une affirmation à une autre te met sur le même plan que le post. Sans source à montrer, ton argument pèse exactement le même poids que le sien — et la discussion s'enlise.",
          },
        ],
      },
      {
        prompt:
          "Mais alors explique-moi une chose : si c'était faux, pourquoi aucun média n'en parle ? C'est bien qu'on nous cache quelque chose, non ?",
        choices: [
          {
            text: 'Les médias ne cachent rien, ils font juste leur travail.',
            correct: false,
            reply: "Ça, c'est une réponse toute faite. Tu ne réponds pas à ma question.",
            explication:
              "Défendre une institution en bloc ne répond pas à la question posée. Le doute exprimé reste entier — et se voir opposer une formule toute faite a plutôt tendance à le renforcer.",
          },
          {
            text: "Le silence des médias ne prouve rien dans un sens ni dans l'autre. Ce qui manquerait, c'est une analyse à montrer.",
            correct: true,
            reply:
              "Vu comme ça… c'est vrai qu'il ne montre aucun résultat d'analyse. Il dit juste qu'on l'a fait taire.",
            explication:
              "Déplacer la discussion vers ce qui manque concrètement — une preuve vérifiable — évite le débat sans fin sur les intentions des médias. On revient à une question à laquelle on peut répondre.",
          },
          {
            text: "Si un vrai scandale existait, un journaliste en aurait fait sa carrière.",
            correct: false,
            reply:
              "Peut-être, mais tu me demandes encore de faire confiance à quelqu'un. Je n'ai toujours rien de concret.",
            explication:
              "Le raisonnement est plausible, mais il repose encore sur la confiance envers une profession. Or c'est précisément cette confiance qui est en cause dans la discussion : l'argument tombe à côté.",
          },
        ],
      },
      {
        prompt:
          "Bon… je le partage quand même, au cas où. Si c'est faux, ça n'aura fait de mal à personne, si ?",
        choices: [
          {
            text: "Fais comme tu veux, ce n'est pas mon problème.",
            correct: false,
            reply:
              'Ok. Alors je le partage. Tu avais presque réussi à me faire douter, pourtant.',
            explication:
              "Abandonner à la dernière étape annule tout le travail fait avant. Un doute installé a besoin d'une raison concrète pour devenir une décision — sans cela, il se referme.",
          },
          {
            text: "Si, justement : des gens vont arrêter de boire l'eau du robinet à cause d'un message invérifié.",
            correct: true,
            reply:
              "Je n'avais pas pensé à ça. Tu as raison, je ne le partage pas. Je vais chercher s'il existe une analyse officielle avant.",
            explication:
              "Nommer une conséquence concrète et proche est bien plus efficace qu'un débat sur le vrai et le faux. C'est ce qui transforme le doute en décision de ne pas partager.",
          },
          {
            text: "Partage-le, tout le monde verra bien que c'est faux.",
            correct: false,
            reply: "Tu es sûr ? Moi j'y ai cru pendant une heure. Bon, je l'envoie.",
            explication:
              "Parier sur le discernement collectif est risqué : si toi-même tu as hésité, d'autres y croiront. Le partage « au cas où » est le principal moteur de diffusion des fausses informations.",
          },
        ],
      },
    ],
    outro: {
      high: "Tu as réussi le plus dur : faire douter sans braquer. Retiens la méthode — poser une question plutôt qu'affirmer, et parler des conséquences concrètes.",
      low: "Le message n'est pas passé cette fois. Ce qui bloque, en général : le ton. Essaie de poser une question au lieu d'affirmer, et de parler des conséquences réelles plutôt que d'avoir raison.",
    },
  },
]

export default conversations
