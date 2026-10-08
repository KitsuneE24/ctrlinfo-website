/**
 * Les gabarits de fabrication, portés de ctrlinfo-app (`src/flux/gabarits.ts`).
 *
 * À partir d'un vrai article de presse, ils fabriquent la publication trompeuse
 * qu'on en tirerait si on voulait manipuler quelqu'un. Trois garde-fous :
 * tout ce qui sort d'ici porte `isFake` et `origine: RSS`, garde le lien vers
 * l'article d'origine, et son explication dit qu'elle a été fabriquée pour
 * l'exercice.
 */

const CAPITALES = (texte) => texte.toLocaleUpperCase('fr-FR')

export const GABARITS = [
  {
    biais: 'Urgence artificielle',
    compte: 'ALERTE-INFO NC',
    couleur: '#dc2626',
    domaine: 'alerte-info-nc.net',
    niveau: 1,
    titre: (titre) => `URGENT — PARTAGEZ AVANT SUPPRESSION : ${CAPITALES(titre)}`,
    texte: ({ titre, editeur }) =>
      `Ce que ${editeur} n'ose pas écrire en gros titre. « ${titre} » — l'information est vérifiable ` +
      `mais elle sera bientôt introuvable. Nous la republions tant qu'elle est en ligne. ` +
      `PARTAGEZ MAINTENANT, avant que ce message disparaisse.`,
    explication:
      "Cette publication a été fabriquée pour l'exercice à partir d'un article réel : le fait de départ existe, " +
      "l'emballage non. Capitales, injonction à partager, menace de suppression — trois signaux d'urgence artificielle " +
      "dans une seule publication. L'urgence sert à empêcher la vérification, pas à informer plus vite.",
  },
  {
    biais: 'Autorité inventée',
    compte: 'Le Vrai Dossier',
    couleur: '#b91c1c',
    domaine: 'le-vrai-dossier.info',
    niveau: 1,
    titre: (titre) => `Un expert brise le silence : ce qu'on ne vous dit pas sur « ${titre} »`,
    texte: ({ titre, editeur }) =>
      `Un ancien cadre du secteur, qui préfère rester anonyme, confirme ce que ${editeur} a effleuré sans le dire : ` +
      `« ${titre} ». Selon nos informations exclusives, le dossier complet serait bien plus lourd. ` +
      `Les grands médias, eux, se contentent du communiqué officiel.`,
    explication:
      "Fabriquée pour l'exercice à partir d'un article réel. La source ici n'est personne : un « ancien cadre » anonyme, " +
      "des « informations exclusives » sans document. Une autorité inventée emprunte le ton de l'expertise sans jamais " +
      "offrir de quoi la vérifier — c'est précisément à quoi sert l'anonymat dans ce cas.",
  },
  {
    biais: 'Manipulation statistique',
    compte: 'Chiffres & Vérité',
    couleur: '#ea580c',
    domaine: 'chiffres-verite.co',
    niveau: 2,
    titre: (titre) => `+312 % en un an : ${titre}`,
    texte: ({ titre, editeur }) =>
      `Les chiffres parlent d'eux-mêmes. « ${titre} » : la hausse atteint 312 % sur la période, ` +
      `un record absolu. ${editeur} publie l'information sans jamais donner ce pourcentage. ` +
      `À vous de juger pourquoi.`,
    explication:
      "Fabriquée pour l'exercice à partir d'un article réel. Le pourcentage est inventé, mais surtout : il ne dit ni de quoi " +
      "il est le pourcentage, ni sur quelle base, ni comparé à quelle période. Un chiffre sans dénominateur n'est pas une " +
      "donnée, c'est un argument déguisé en donnée.",
  },
  {
    biais: 'Décontextualisation',
    compte: 'Info Directe NC',
    couleur: '#c2410c',
    domaine: 'info-directe.nc',
    niveau: 3,
    titre: (titre) => `Ça vient de se produire : ${titre}`,
    texte: ({ titre, editeur }) =>
      `La scène est authentique, la photo n'a pas été retouchée : « ${titre} ». ` +
      `Ce qui n'est pas dit, c'est quand ni où. ${editeur} a traité le sujet dans un tout autre contexte — ` +
      `mais republié aujourd'hui, cela raconte une autre histoire.`,
    explication:
      "Fabriquée pour l'exercice à partir d'un article réel. Rien n'est faux dans le matériau : c'est le cadre qui ment. " +
      "Une information exacte, sortie de sa date ou de son lieu, devient fausse sans qu'un seul mot ait été inventé. " +
      "C'est le procédé le plus difficile à repérer, et le plus fréquent.",
  },
  {
    biais: 'Appel à la peur',
    compte: 'Vigilance Citoyenne',
    couleur: '#991b1b',
    domaine: 'vigilance-citoyenne.org',
    niveau: 2,
    titre: (titre) => `Ce que ça va changer pour vous — et personne ne vous prévient : ${titre}`,
    texte: ({ titre, editeur }) =>
      `Pendant que l'on regarde ailleurs, la situation avance. « ${titre} ». ` +
      `${editeur} en parle en quelques lignes ; les conséquences pour les familles, elles, ne sont nulle part. ` +
      `Préparez-vous, informez vos proches.`,
    explication:
      "Fabriquée pour l'exercice à partir d'un article réel. Le procédé ne consiste pas à mentir mais à installer une " +
      'menace vague — « préparez-vous », « pour vos proches » — sans jamais dire à quoi. La peur circule plus vite que ' +
      "la curiosité, et c'est exactement ce que la publication cherche.",
  },
]

export const CONSEQUENCES_FAUX = {
  share:
    "En partageant, tu donnes à ce montage la crédibilité qui lui manquait : celle de quelqu'un que tes proches connaissent.",
  ignore:
    "Tu ne l'as pas amplifié, et c'est déjà ça. Sans signalement, il continue pourtant sa route auprès d'autres personnes.",
  report:
    'Bien vu. Le fait de départ existait, mais son emballage était conçu pour te faire réagir avant de réfléchir.',
}

export const CONSEQUENCES_VRAI = {
  share:
    "Tu as relayé une information sourcée, signée, datée, publiée par une rédaction identifiable. C'est ce qui devrait circuler.",
  ignore:
    "Rien de grave — mais une information utile et vérifiée n'a pas atteint les personnes à qui elle aurait servi.",
  report:
    "Signaler une information vérifiée et correctement attribuée n'aide personne : ça encombre la modération et fragilise la circulation de ce qui est fiable.",
}

export const SCORES_FAUX = { share: -80, ignore: 10, report: 100 }
export const SCORES_VRAI = { share: 100, ignore: 0, report: -40 }
