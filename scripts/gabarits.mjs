// `a` : { titre, extrait, editeur, nom, date, domaineReel, domaineFaux, domaineCopie }

const indice = (nature, cible, picto, libelle, explication) => ({
  nature,
  cible,
  picto,
  libelle,
  explication,
})

// `titres` et `phrases` vont du niveau 1 au 5 ; `surUnePersonne: false` exclut les articles qui nomment quelqu'un.
export const CATEGORIES = [
  {
    biais: 'Urgence artificielle',
    titres: [
      (t) => `Urgent, partagez avant suppression : ${t}`,
      (t) => `À partager vite : ${t}`,
      (t) => `Avant que ça disparaisse : ${t}`,
      (t) => `${t} — à lire tant que c'est en ligne`,
      (t) => t,
    ],
    phrases: [
      'Cette information va être retirée dans les prochaines heures. PARTAGEZ MAINTENANT 🔴🔴',
      'Faites tourner avant que ce soit supprimé.',
      "L'article risque d'être retiré, on vous le met ici.",
      "Lisez-le tant qu'il est disponible.",
      'Article susceptible d’être dépublié prochainement.',
    ],
    explication: "L'urgence (« avant suppression ») sert à faire partager avant de vérifier.",
    analyseFaux: "Personne ne retire cette information : l'urgence a été ajoutée pour faire partager sans vérifier.",
    ajout: () => 'une menace de suppression',
    pression: () => 'Ils disent que ça va être supprimé !',
    indice: indice('ALERTE', 'TEXTE', 'Clock', 'Une suppression annoncée',
      'Rien n’indique que l’article sera retiré. La menace sert seulement à faire partager vite.'),
    croit: 'Partagé direct avant que ça disparaisse 😱',
    doute: 'Pourquoi ce serait supprimé ?',
    verifie: [
      (a) => `C’est un article de ${a.nom} du ${a.date}, toujours en ligne. Personne ne le supprime.`,
      (a) => `L’article est toujours sur ${a.domaineReel}…`,
    ],
  },
  {
    biais: 'Autorité inventée',
    surUnePersonne: false,
    titres: [
      (t) => `Un haut responsable brise le silence : ${t}`,
      (t) => `Révélations d'un haut responsable : ${t}`,
      (t) => `${t} : un responsable se confie`,
      (t) => `${t}, selon un responsable`,
      (t) => t,
    ],
    phrases: [
      "Un haut responsable, qui veut rester anonyme, nous l'a confirmé : le dossier complet est bien plus lourd !",
      "Un responsable anonyme affirme que tout n'a pas été dit.",
      "Un responsable, qui a souhaité garder l'anonymat, évoque d'autres éléments.",
      "Selon un responsable proche du dossier, d'autres annonces sont attendues.",
      "D'après une source proche du dossier, la décision était connue depuis plusieurs semaines.",
    ],
    explication: 'La source ajoutée est anonyme : elle a le ton de l’autorité sans rien offrir à vérifier.',
    analyseFaux: 'La source anonyme n’existe que dans ce post : aucun nom, aucun document.',
    ajout: () => 'une source anonyme que l’article ne cite pas',
    pression: () => 'C’est un responsable qui le dit, c’est du sérieux.',
    indice: indice('ALERTE', 'TEXTE', 'UserRound', 'Une source sans nom',
      'Un « responsable » anonyme : rien qui puisse être vérifié. Cette phrase n’est pas dans l’article d’origine.'),
    croit: 'Évidemment qu’on nous cache des choses 👏',
    doute: 'C’est qui ce responsable ? Il a un nom ?',
    verifie: [
      (a) => `J’ai lu l’article de ${a.nom} : aucune source anonyme là-dedans.`,
      (a) => `${a.nom} ne cite personne d’anonyme, si ?`,
    ],
  },
  {
    biais: 'Appel à la peur',
    surUnePersonne: false,
    titres: [
      (t) => `Danger pour vos enfants : ${t}`,
      (t) => `Ce que ça va changer pour votre famille : ${t}`,
      (t) => `${t} : faut-il s'inquiéter ?`,
      (t) => `${t} : des inquiétudes`,
      (t) => t,
    ],
    phrases: [
      'Protégez vos proches, les conséquences pourraient être dramatiques !!',
      'Personne ne vous dit ce qui va suivre. Préparez-vous.',
      'Les conséquences pour les familles pourraient être lourdes.',
      'Certains habitants disent déjà leur inquiétude.',
      'Reste à savoir ce que cela changera pour les familles.',
    ],
    explication: 'Une menace vague est ajoutée, sans jamais dire laquelle : la peur circule plus vite que la curiosité.',
    analyseFaux: 'Aucune conséquence n’est décrite : l’inquiétude a été ajoutée.',
    ajout: () => 'une inquiétude pour les familles, jamais expliquée',
    pression: () => 'Ça fait peur quand même, faut prévenir tout le monde non ?',
    indice: indice('ALERTE', 'TEXTE', 'Flame', 'Une menace sans contenu',
      'Aucune conséquence précise n’est décrite : l’inquiétude remplace l’information.'),
    croit: 'J’ai peur pour mes enfants… je préviens la famille.',
    doute: 'Inquiétant comment ? Ils ne disent rien de précis.',
    verifie: [
      (a) => `L’article de ${a.nom} ne parle d’aucun danger.`,
      () => 'Il est où, le danger, dans l’article ?',
    ],
  },
  {
    biais: 'Manipulation statistique',
    titres: [
      (t) => `+312 % !!! ${t}`,
      (t) => `+312 % : ${t}`,
      (t) => `${t} : un chiffre qui interroge`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      "+312 % en un an, un RECORD que personne n'ose publier !",
      "Les chiffres parlent d'eux-mêmes : +312 % sur la période.",
      'Selon les chiffres disponibles, la hausse atteindrait 312 %.',
      'Une évolution de près de 300 % sur la période, selon les données.',
      'Un phénomène qui a presque triplé en quelques années.',
    ],
    explication: 'Le chiffre ajouté ne dit ni de quoi, ni par rapport à quand : c’est un argument déguisé en donnée.',
    analyseFaux: 'Ce chiffre n’apparaît pas dans l’article d’origine et n’a aucun point de comparaison.',
    ajout: () => 'un chiffre que l’article ne donne pas',
    pression: () => 'Regarde les chiffres, c’est énorme !',
    indice: indice('ALERTE', 'TEXTE', 'ChartColumn', 'Un chiffre sans base',
      'De quoi, par rapport à quand ? Ce chiffre n’apparaît pas dans l’article d’origine.'),
    croit: 'C’est énorme, faut que ça se sache',
    doute: 'Ce chiffre sort d’où ? 🤔',
    verifie: [
      (a) => `Aucun chiffre de ce genre dans l’article de ${a.nom}.`,
      () => 'Il sort d’où ce chiffre ?',
    ],
  },
  {
    biais: 'Faux expert',
    surUnePersonne: false,
    titres: [
      (t) => `Un expert prévient : ${t}, et ce n'est que le début`,
      (t) => `${t} : « ce n'est qu'un début », selon un expert`,
      (t) => `${t} : l'analyse d'un expert`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Gérald Mourin, expert reconnu sur les réseaux, est formel : « tout va s’aggraver ».',
      'Pour Gérald Mourin, expert indépendant, « tout cela était prévisible et va s’aggraver ».',
      'Gérald Mourin, consultant, estime que « la situation devrait s’aggraver ».',
      '« La tendance devrait se poursuivre », analyse Gérald Mourin, consultant indépendant.',
      '« Il faut s’attendre à d’autres annonces », estime Gérald Mourin, analyste.',
    ],
    explication: 'L’« expert » ajouté n’a ni institution ni spécialité : son titre sert à donner du poids à un avis.',
    analyseFaux: 'Cet expert n’apparaît pas dans l’article d’origine, et rien ne dit qu’il connaisse le sujet.',
    ajout: () => 'l’avis d’un « expert » que l’article ne cite pas',
    pression: () => 'Même un expert le dit.',
    indice: indice('VERIFICATION', 'TEXTE', 'UserRound', 'Un « expert » de quoi ?',
      'Ni institution, ni spécialité : rien ne dit qu’il connaît le sujet. Il n’apparaît pas dans l’article d’origine.'),
    croit: 'Enfin un expert qui dit les choses 👍',
    doute: 'Il est expert en quoi exactement ?',
    verifie: [
      (a) => `J’ai cherché Gérald Mourin : aucune publication. Et ${a.nom} ne le cite pas.`,
      () => 'C’est qui, Gérald Mourin ?',
    ],
  },
  {
    biais: 'Biais de confirmation',
    surUnePersonne: false,
    titres: [
      (t) => `On vous l'avait dit : ${t}`,
      (t) => `${t} : la preuve de ce que beaucoup pensaient`,
      (t) => `${t}, comme on pouvait s'y attendre`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Ceux qui nous traitaient de complotistes peuvent s’excuser !',
      'Ceux qui alertaient depuis des mois avaient raison.',
      'Un fait qui confirme ce que beaucoup pressentaient.',
      'Un signe de plus d’une tendance de fond.',
      'Une évolution qui s’inscrit dans une tendance déjà observée.',
    ],
    explication: 'Une conclusion générale est tirée d’un seul fait : elle flatte ce que le lecteur croit déjà.',
    analyseFaux: 'La « tendance » est ajoutée : l’article d’origine rapporte un fait, il ne confirme rien de plus.',
    ajout: () => 'une conclusion que l’article ne tire pas',
    pression: () => 'Je le disais depuis le début, tu vois !',
    indice: indice('ALERTE', 'TEXTE', 'Filter', 'Une conclusion ajoutée',
      'Un fait isolé ne prouve pas une tendance. Cette conclusion n’est pas dans l’article d’origine.'),
    croit: 'Je le disais depuis le début ! 🙏',
    doute: 'Un seul cas, ça fait une tendance ?',
    verifie: [
      (a) => `${a.nom} raconte juste le fait, pas de « tendance ».`,
      () => 'Quelle tendance ? C’est un seul cas.',
    ],
  },
  {
    biais: 'Fausse corrélation',
    surUnePersonne: false,
    titres: [
      (t) => `Comme par hasard : ${t}`,
      (t) => `${t} : pas un hasard`,
      (t) => `${t} : un lien troublant`,
      (t) => t,
      (t) => t,
    ],
    phrases: [
      'Comme par hasard, juste après les décisions du mois dernier… Ouvrez les yeux !',
      'Ce n’est pas un hasard si ça arrive juste après les décisions du mois dernier.',
      'Difficile de ne pas faire le lien avec les décisions du mois dernier.',
      'Ce n’est sans doute pas un hasard si cela arrive après les décisions du mois dernier.',
      'Une annonce qui intervient quelques semaines après les décisions du mois dernier.',
    ],
    explication: 'Un lien de cause est insinué sans être démontré : deux faits proches dans le temps ne sont pas liés pour autant.',
    analyseFaux: 'Aucun lien avec des « décisions du mois dernier » n’est établi : l’insinuation est ajoutée.',
    ajout: () => 'un lien avec « les décisions du mois dernier »',
    pression: () => 'C’est pas un hasard tout ça.',
    indice: indice('ALERTE', 'TEXTE', 'Brain', 'Un lien insinué',
      'La phrase suggère une cause sans la démontrer, ni dire de quelles décisions il s’agit.'),
    croit: 'Exactement, tout est lié 😤',
    doute: 'Quelles décisions ?',
    verifie: [
      (a) => `L’article de ${a.nom} ne fait aucun lien avec le mois dernier.`,
      () => 'Quel rapport avec le mois dernier ?',
    ],
  },
  {
    biais: 'Certitude ajoutée',
    titres: [
      (t) => `C'est confirmé !!! ${t}`,
      (t) => `C'est confirmé : ${t}`,
      (t) => `${t} : c'est officiel`,
      (t) => `${t}, confirme-t-on`,
      (t) => t,
    ],
    phrases: [
      '100 % CONFIRMÉ par toutes les sources !',
      "L'information est confirmée par plusieurs sources.",
      'Plusieurs sources concordantes le confirment.',
      'Une information confirmée par plusieurs sources.',
      'Information recoupée auprès de plusieurs sources.',
    ],
    explication: 'Une certitude est affichée sans source : « confirmé » rassure, mais personne n’est nommé.',
    analyseFaux: 'La « confirmation » n’a pas de source : elle donne une assurance que l’article d’origine ne donnait pas.',
    ajout: () => 'un « c’est confirmé » sans source',
    pression: () => 'C’est confirmé en plus !',
    indice: indice('VERIFICATION', 'TEXTE', 'Scale', 'Confirmé par qui ?',
      'Aucune source n’est nommée. L’article d’origine ne parle pas de confirmation.'),
    croit: 'Ah ben si c’est confirmé 👍',
    doute: 'Confirmé par qui ?',
    verifie: [
      (a) => `Sur le site de ${a.nom}, il n’y a pas écrit « confirmé ».`,
      () => 'Ces « plusieurs sources », elles ont un nom ?',
    ],
  },
]

export const HABILLAGES = [
  {
    niveau: 1,
    comptes: [
      ['ALERTE-INFO NC', '#dc2626', 'alerte-info-nc.net'],
      ['LA VÉRITÉ CACHÉE', '#b91c1c', 'verite-cachee.net'],
      ['RÉVEIL CITOYEN 🔥', '#991b1b', 'reveil-citoyen.org'],
    ],
    titre: (t) => t.toLocaleUpperCase('fr-FR'),
    explication: 'Le compte crie : nom alarmiste, majuscules.',
    indice: (a, compte) =>
      indice('ALERTE', 'SOURCE', 'Megaphone', 'Un compte qui crie',
        `${compte.nom} n’est pas une rédaction : nom alarmiste, majuscules, aucun journaliste. L’information vient de ${a.nom}.`),
  },
  {
    niveau: 2,
    comptes: [
      ['Vigilance Citoyenne', '#991b1b', 'vigilance-citoyenne.org'],
      ['Chiffres & Vérité', '#ea580c', 'chiffres-verite.co'],
      ['Le Vrai Dossier', '#b91c1c', 'le-vrai-dossier.info'],
    ],
    explication: 'Le compte défend une cause, sans rédaction identifiable.',
    indice: (a, compte) =>
      indice('VERIFICATION', 'SOURCE', 'Search', 'Un compte militant',
        `${compte.nom} ne dit pas qui écrit. Le fait vient de ${a.nom} (${a.date}) : comparez les deux.`),
  },
  {
    niveau: 3,
    comptes: [
      ['Info Directe NC', '#c2410c', 'info-directe.nc'],
      ['Le Regard Libre', '#9a3412', 'le-regard-libre.fr'],
      ['Nouméa Décrypte', '#57534e', 'noumea-decrypte.fr'],
    ],
    explication: 'Le site a l’allure d’un média, sans rédaction nommée.',
    indice: (a, compte) =>
      indice('VERIFICATION', 'SOURCE', 'Newspaper', 'Un site qui ressemble à un média',
        `${compte.domaine} n’a ni rédaction nommée ni mentions légales. L’original est sur ${a.domaineReel}.`),
  },
  {
    niveau: 4,
    comptes: [[(a) => `${a.nom} Actu`, '#1800ad', (a) => a.domaineFaux]],
    explication: 'Le compte emprunte le nom d’une vraie rédaction.',
    indice: (a, compte) =>
      indice('VERIFICATION', 'SOURCE', 'Link2', 'Un nom qui imite',
        `${compte.domaine} n’est pas ${a.domaineReel}. Le nom ressemble à ${a.nom}, l’adresse ne lui appartient pas.`),
  },
  {
    niveau: 5,
    comptes: [[(a) => a.nom, '#1800ad', (a) => a.domaineCopie]],
    explication: 'Le compte copie une vraie rédaction : seule l’adresse diffère.',
    indice: (a, compte) =>
      indice('VERIFICATION', 'SOURCE', 'Link2', 'Lisez l’adresse lettre par lettre',
        `${compte.domaine} n’est pas ${a.domaineReel} : même nom, même titre, mais pas le même site.`),
  },
]

export const VRAI = {
  explication: (a) =>
    `Ce post reprend telle quelle une information de ${a.editeur} : rédaction identifiable, date, lien vers ` +
    `l'article complet. Rien n'y a été ajouté : il se partage sans risque.`,
  analyseVrai: (a) => `Le titre et le texte sont ceux de ${a.nom}, publiés le ${a.date}, avec le lien vers l'article.`,
  indices: (a) => [
    indice('FIABLE', 'SOURCE', 'BadgeCheck', 'Une rédaction identifiable',
      `${a.nom} (${a.editeur}) signe l’information sur ${a.domaineReel}.`),
    indice('FIABLE', 'DATE', 'Clock', 'Une date précise',
      `Publiée le ${a.date} : on sait de quand date le fait.`),
    indice('FIABLE', 'TITRE', 'Scale', 'Un titre qui décrit',
      'Ni majuscules, ni « partagez », ni révélation promise : le titre décrit, il ne pousse pas.'),
  ],
  commentaires: [
    (a) => [
      ['CROIT', 'Merci pour l’info 🙏'],
      ['DOUTE', 'Vous êtes sûrs ? J’ai vu passer autre chose sur un groupe…'],
      ['VERIFIE', `L’article complet est sur ${a.domaineReel}, daté du ${a.date}.`],
    ],
    (a) => [
      ['DOUTE', 'Encore une info des médias, on ne sait jamais…'],
      ['VERIFIE', `C’est bien sur le site de ${a.nom}, avec le nom de la rédaction.`],
      ['CROIT', 'Bon à savoir, je fais tourner.'],
    ],
    (a) => [
      ['VERIFIE', `Même titre sur ${a.domaineReel}, rien n’a été modifié.`],
      ['CROIT', 'Enfin une info claire sur le sujet.'],
      ['DOUTE', 'Ça m’étonne quand même.'],
    ],
  ],
}

export const COMMENTATEURS = {
  CROIT: [
    ['Nadia_988', '#791561'], ['Thierry P.', '#791561'], ['Patrick L.', '#8a4fbe'], ['Hélène', '#8a4fbe'],
    ['Ryan_NC', '#791561'], ['Willy', '#8a4fbe'], ['Aurélie', '#8a4fbe'], ['Mélanie', '#8a4fbe'],
  ],
  DOUTE: [
    ['Kévin.nc', '#b45309'], ['sam_974', '#b45309'], ['Tehei', '#b45309'], ['bruno_zz', '#b45309'],
    ['Manu', '#b45309'], ['Léa', '#b45309'], ['Nathalie', '#b45309'], ['Didier', '#b45309'],
  ],
  VERIFIE: [
    ['Louise M.', '#14663f'], ['Marie-Jo', '#1800ad'], ['Anaïs W.', '#14663f'], ['Camille R.', '#14663f'],
    ['Inès K.', '#14663f'], ['Fatou S.', '#14663f'], ['Olivier T.', '#14663f'], ['Karim', '#1800ad'],
  ],
}

export const CONSEQUENCES_FAUX = {
  share:
    "En partageant, vous donnez à ce montage la crédibilité qui lui manquait : celle de quelqu'un que vos proches connaissent.",
  ignore:
    "Vous ne l'avez pas amplifié, et c'est déjà ça. Sans signalement, il continue pourtant sa route auprès d'autres personnes.",
  report:
    'Bien vu. Le fait de départ existait, mais son emballage était conçu pour vous faire réagir avant de réfléchir.',
}

export const CONSEQUENCES_VRAI = {
  share:
    "Vous avez relayé une information sourcée, signée, datée, publiée par une rédaction identifiable. C'est ce qui devrait circuler.",
  ignore:
    "Rien de grave — mais une information utile et vérifiée n'a pas atteint les personnes à qui elle aurait servi.",
  report:
    "Signaler une information vérifiée et correctement attribuée n'aide personne : ça encombre la modération et fragilise la circulation de ce qui est fiable.",
}

export const SCORES_FAUX = { share: -80, ignore: 10, report: 100 }
export const SCORES_VRAI = { share: 100, ignore: 0, report: -40 }
