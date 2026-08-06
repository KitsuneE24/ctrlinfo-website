/**
 * Taxonomie des biais + règles de tri.
 *
 * ⚠ Les clés de BIASES doivent correspondre EXACTEMENT aux clés de
 * `remediationPosts` dans src/data/posts.js, sinon la remédiation
 * (Feed.jsx, ligne ~60) ne se déclenchera jamais.
 */

export const ACTIONS = ['share', 'ignore', 'report']

export const BIASES = {
  // ---------- Niveau 1 : signaux grossiers, visibles à l'œil nu ----------
  'Urgence artificielle': {
    level: 1,
    correctAction: 'report',
    consigne:
      "Presse le lecteur d'agir immédiatement : MAJUSCULES, « avant censure », « partagez maintenant », compte à rebours. Le but est de court-circuiter la réflexion.",
  },
  'Autorité inventée': {
    level: 1,
    correctAction: 'report',
    consigne:
      "Invoque un professionnel « réduit au silence » ou « banni » dont la seule publication est un blog ou une vidéo. Aucune institution vérifiable.",
  },
  'Appel à la peur': {
    level: 1,
    correctAction: 'report',
    consigne:
      "Agite un danger vague mais terrifiant (« vous tue lentement », « danger imminent ») sans preuve concrète ni source nommée.",
  },

  // ---------- Niveau 2 : plausible, il faut réfléchir ----------
  'Fausse corrélation': {
    level: 2,
    correctAction: 'report',
    consigne:
      "Présente deux phénomènes qui varient ensemble comme un lien de cause à effet, en ignorant toute cause commune ou facteur confondant.",
  },
  'Biais de confirmation': {
    level: 2,
    correctAction: 'report',
    consigne:
      "Donne raison au lecteur avant même l'argument. Le titre contient un jugement de valeur (« et ils ont raison », « encore une preuve que… »).",
  },
  'Cherry picking': {
    level: 2,
    correctAction: 'report',
    consigne:
      "Sélectionne les seules données favorables à la thèse, cite « X études » sans les nommer, ignore les méta-analyses contradictoires.",
  },

  // ---------- Niveau 3 : expert, vrais faits mais contexte manipulé ----------
  Décontextualisation: {
    level: 3,
    correctAction: 'ignore', // on ne peut pas signaler ce qu'on n'a pas vérifié
    consigne:
      "Reprend un fait ou une image RÉELS mais les rattache à un autre lieu ou une autre date, présentés comme actuels. Ton « BREAKING », « en direct ».",
  },
  'Faux expert': {
    level: 3,
    correctAction: 'report',
    consigne:
      "Attribue une analyse à un expert au titre ronflant mais introuvable dans les annuaires institutionnels, ou expert d'un tout autre domaine.",
  },
  'Manipulation statistique': {
    level: 3,
    correctAction: 'report',
    consigne:
      "Utilise des chiffres VRAIS mais tronqués : période de référence choisie, définition modifiée, catégorie isolée, données omises.",
  },
}

export const BIAS_NAMES = Object.keys(BIASES)
export const biasesForLevel = (level) =>
  BIAS_NAMES.filter((b) => BIASES[b].level === level)

/**
 * TRI DES VRAIS POSTS — la partie pédagogique la plus fine.
 *
 * Une info peut être parfaitement vraie et ne PAS mériter d'être relayée.
 * C'est tout l'intérêt de la phase 1 : apprendre à distinguer
 * « vrai et utile » de « vrai mais sans intérêt de diffusion ».
 */
export const REAL_POST_KINDS = {
  service: {
    // alerte météo, sécurité civile, santé publique, coupure, décision qui touche le quotidien
    correctAction: 'share',
    scores: { share: 100, ignore: 0, report: -40 },
    biais: 'Aucun (information de service officielle)',
  },
  factuel: {
    // décision publique, économie locale, science, résultat vérifiable
    correctAction: 'share',
    scores: { share: 100, ignore: 10, report: -30 },
    biais: 'Aucun (information vérifiée)',
  },
  neutre: {
    // vrai, mais fait divers / people / sport / opinion : rien à relayer en urgence
    correctAction: 'ignore',
    scores: { share: 10, ignore: 100, report: -40 },
    biais: 'Aucun (information réelle, sans enjeu de diffusion)',
  },
  encours: {
    // vrai mais information encore mouvante, bilan provisoire, enquête en cours
    correctAction: 'ignore',
    scores: { share: -20, ignore: 100, report: -30 },
    biais: 'Aucun (information non stabilisée)',
  },
}

/** Barème appliqué aux faux posts, selon l'action attendue. */
export const FAKE_SCORES = {
  report: { share: -70, ignore: 25, report: 100 },
  ignore: { share: -70, ignore: 100, report: 30 },
}

/**
 * GARDE-FOUS de génération des faux posts.
 * On fabrique de la désinformation à but pédagogique : elle doit rester
 * inoffensive hors du jeu.
 */
export const FAKE_GUARDRAILS = {
  // Interdit d'usurper l'identité d'un vrai média : le faux post porte
  // toujours un nom de média inventé.
  allowRealOutletImpersonation: false,
  // Aucune personne réelle nommée ne peut être accusée de quoi que ce soit.
  allowRealPersonAccusation: false,
  // Noms de médias réels à ne jamais réutiliser comme signature d'un faux post.
  bannedOutletNames: [
    'le monde', 'figaro', 'bfm', 'afp', 'france 24', 'franceinfo', 'france info',
    'rfi', 'la 1ère', 'la 1ere', 'les nouvelles calédoniennes', 'lnc', 'actu.nc',
    'liberation', 'libération', 'mediapart', 'ouest-france', 'science & vie',
    'reuters', 'tf1', 'france 2', 'radio france', 'météo france', 'meteo france',
  ],
}
