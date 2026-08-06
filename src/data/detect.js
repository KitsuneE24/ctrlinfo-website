/**
 * Mini-jeu « Repère les indices ».
 *
 * Complémentaire du fil de jeu : là où le fil demande *quoi faire* d'une
 * publication, ce mini-jeu demande *pourquoi*. Le joueur voit la fiche d'une
 * publication décomposée en éléments et désigne ceux qui posent problème.
 *
 * Point important de la conception : chaque manche contient des éléments
 * parfaitement sains (`suspect: false`). Sur-signaler est une erreur au même
 * titre que passer à côté d'un indice — c'est ce qui évite d'apprendre au
 * joueur à se méfier de tout.
 */
const manches = [
  {
    id: 'urgence',
    titre: 'Publication n°1',
    contexte: "Un post partagé dans un groupe familial, ce matin.",
    apercu: {
      compte: 'ALERTE-VÉRITÉ.net',
      couleur: '#dc2626',
      titre: "URGENT — PARTAGEZ AVANT CENSURE : un danger caché dans l'eau du robinet",
    },
    indices: [
      {
        id: 'nom',
        label: 'Nom du compte',
        valeur: 'ALERTE-VÉRITÉ.net',
        suspect: true,
        explication:
          "Un nom qui promet « la vérité » n'est pas un gage de sérieux : c'est un argument d'autorité déguisé, choisi pour inspirer confiance avant même qu'on lise.",
      },
      {
        id: 'titre',
        label: 'Formulation du titre',
        valeur: 'URGENT — PARTAGEZ AVANT CENSURE',
        suspect: true,
        explication:
          "Majuscules, injonction à partager et menace de censure : trois signaux d'urgence artificielle dans une seule ligne. Le but est de te faire agir avant de réfléchir.",
      },
      {
        id: 'source',
        label: 'Source citée',
        valeur: '« nos sources exclusives »',
        suspect: true,
        explication:
          "Une source anonyme n'est pas vérifiable. Un média sérieux nomme sa source, ou explique précisément pourquoi il ne peut pas la nommer.",
      },
      {
        id: 'photo',
        label: 'Photo utilisée',
        valeur: "Un robinet d'eau courante",
        suspect: false,
        explication:
          "L'image en elle-même n'a rien de suspect : c'est une photo banale. Le problème n'est pas la photo, c'est ce qu'on lui fait dire.",
      },
      {
        id: 'partages',
        label: 'Nombre de partages',
        valeur: '45 832 partages',
        suspect: false,
        explication:
          "Un chiffre élevé n'est ni une preuve ni un indice de fausseté. La popularité ne dit rien de la véracité — dans un sens comme dans l'autre.",
      },
    ],
  },

  {
    id: 'imitation',
    titre: 'Publication n°2',
    contexte: 'Un article relayé par une connaissance, sans commentaire.',
    apercu: {
      compte: 'Le Quotidien Info',
      couleur: '#1800ad',
      titre: 'Une hausse des taxes sur le carburant se prépare en Nouvelle-Calédonie',
    },
    indices: [
      {
        id: 'domaine',
        label: 'Nom de domaine',
        valeur: 'lequotidien-info.co',
        suspect: true,
        explication:
          "Le nom imite celui d'un titre connu, avec une extension inhabituelle. Vérifier le domaine exact est le réflexe le plus rentable : les sites d'imitation misent sur le coup d'œil rapide.",
      },
      {
        id: 'date',
        label: 'Date de publication',
        valeur: '« ces derniers jours »',
        suspect: true,
        explication:
          "Une date vague empêche tout recoupement. Une information réelle est datée précisément, parce que la date fait partie de l'information.",
      },
      {
        id: 'auteur',
        label: 'Signature',
        valeur: 'Aucun auteur mentionné',
        suspect: true,
        explication:
          "Sans signature, personne n'engage sa responsabilité sur ce texte. C'est aussi ce qui rend impossible de vérifier le sérieux de celui qui écrit.",
      },
      {
        id: 'citation',
        label: 'Personne citée',
        valeur: 'Un élu, cité avec son nom et sa fonction',
        suspect: false,
        explication:
          "Une personne nommée est vérifiable : tu peux chercher si elle a réellement tenu ces propos. C'est plutôt un point en faveur de l'article.",
      },
      {
        id: 'ton',
        label: "Ton de l'article",
        valeur: 'Neutre, sans point d\'exclamation',
        suspect: false,
        explication:
          "Un ton posé n'est pas un signal d'alerte. Attention toutefois : ce n'est pas une garantie non plus — la désinformation soignée imite très bien le style journalistique.",
      },
    ],
  },

  {
    id: 'contexte',
    titre: 'Publication n°3',
    contexte: 'Une photo qui circule très vite depuis ce matin.',
    apercu: {
      compte: 'Info Nouvelle-Calédonie',
      couleur: '#791561',
      titre: 'Des files interminables devant les stations-service, hier à Nouméa',
    },
    indices: [
      {
        id: 'agence',
        label: 'Crédit de la photo',
        valeur: 'AFP — photo authentique',
        suspect: false,
        explication:
          "L'agence existe et la photo est bien réelle. Le problème de cette publication ne vient pas de la source de l'image.",
      },
      {
        id: 'datephoto',
        label: 'Date de prise de vue',
        valeur: 'Photo prise en 2019',
        suspect: true,
        explication:
          "C'est tout l'enjeu du niveau expert : une vraie photo, republiée des années plus tard, change complètement de sens. La recherche d'image inversée révèle ce décalage en quelques secondes.",
      },
      {
        id: 'legende',
        label: 'Légende ajoutée',
        valeur: '« hier à Nouméa »',
        suspect: true,
        explication:
          "La légende affirme un lieu et une date que la photo ne prouve pas. C'est exactement là que se joue la manipulation : rien n'est faux dans l'image, tout est faux dans ce qu'on en dit.",
      },
      {
        id: 'chiffres',
        label: 'Chiffres cités',
        valeur: "Données sourcées, avec lien vers l'organisme",
        suspect: false,
        explication:
          'Des chiffres sourcés et liés sont vérifiables en un clic : exactement ce qu\'on attend d\'une information fiable.',
      },
      {
        id: 'article',
        label: 'Lien vers un article',
        valeur: 'Aucun — la photo est publiée seule',
        suspect: true,
        explication:
          "Une image seule, sans article derrière, ne permet de vérifier ni le contexte, ni la date, ni le lieu. C'est le format préféré des contenus sortis de leur contexte.",
      },
    ],
  },
]

export default manches
