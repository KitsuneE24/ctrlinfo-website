/**
 * Prompt de génération d'un FAUX post pédagogique.
 *
 * MÉTHODE : on ne part jamais d'une page blanche. On prend un article RÉEL
 * et on lui applique UN biais imposé par la taxonomie. Trois bénéfices :
 *   - le faux post est ancré dans l'actualité locale → crédible pour le joueur ;
 *   - le biais est connu à l'avance → pas besoin de le faire deviner au modèle,
 *     et la remédiation ciblée de Feed.jsx se déclenche correctement ;
 *   - l'explication peut confronter le faux au vrai article d'origine.
 *
 * GARDE-FOUS : ce contenu est de la désinformation fabriquée à but éducatif.
 * Il doit rester inoffensif hors du jeu → aucune usurpation de vrai média,
 * aucune personne réelle mise en cause, aucun conseil sanitaire actionnable.
 */

import { BIASES, FAKE_GUARDRAILS } from '../config/taxonomy.js'

export const FAKE_SYSTEM = `Tu es le concepteur pédagogique d'un jeu calédonien qui apprend à repérer la désinformation.

Ton rôle : fabriquer des posts VOLONTAIREMENT trompeurs, qui serviront d'exercices d'entraînement. Le joueur devra les démasquer. Un faux post raté (trop grossier ou trop inoffensif) n'apprend rien.

CONTRAINTES DE SÉCURITÉ — non négociables :
1. Le média signataire doit être INVENTÉ. N'utilise jamais le nom ni le domaine d'un média réel.
2. N'accuse aucune personne réelle, aucun élu, aucune entreprise, aucune association identifiable. Les protagonistes sont inventés ou désignés génériquement (« un responsable », « une étude »).
3. Aucun conseil sanitaire suivable : pas de « arrêtez votre traitement », pas de posologie, pas de produit nommé à ingérer ou à éviter.
4. Aucune incitation à la violence, aucune désignation d'un groupe ethnique, religieux ou coutumier comme responsable. Le contexte calédonien est sensible : reste sur des sujets institutionnels, économiques, environnementaux ou scientifiques.
5. Le faux doit être démasquable : les indices du biais doivent être présents dans le texte.

Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour.`

export function buildFakePrompt(item, biasName) {
  const bias = BIASES[biasName]
  const niveauTon = {
    1: `NIVEAU 1 — grossier et visible. Le joueur doit pouvoir repérer le piège en 5 secondes : majuscules, ponctuation excessive, ton hystérique, source manifestement douteuse.`,
    2: `NIVEAU 2 — plausible. Le post doit ressembler à un article de blog sérieux ou de site d'actualité secondaire. Le piège se voit en réfléchissant, pas en un coup d'œil. Pas de majuscules criardes.`,
    3: `NIVEAU 3 — expert. Le ton est celui d'une vraie rédaction : sobre, chiffré, sourcé en apparence. Les faits de base sont VRAIS, seul le cadrage est manipulé. Le joueur doit vraiment analyser pour trouver la faille.`,
  }[bias.level]

  return `ARTICLE RÉEL SERVANT DE MATIÈRE PREMIÈRE
──────────────────────────────────────────
Média d'origine : ${item.sourceName}
Titre           : ${item.title}
Chapô           : ${item.description}
Zone            : ${item.scope === 'nc' ? 'Nouvelle-Calédonie' : item.scope === 'fr' ? 'France' : 'International'}

BIAIS À APPLIQUER : « ${biasName} »
${bias.consigne}

${niveauTon}

TRAVAIL DEMANDÉ
Réécris ce sujet en une publication trompeuse qui illustre le biais « ${biasName} ».
Garde le THÈME de l'article d'origine (pour l'ancrage local), mais déforme le traitement.
${FAKE_GUARDRAILS.allowRealOutletImpersonation ? '' : `Le média signataire doit être inventé (nom + domaine cohérents et crédibles, par exemple « Alerte-Info Pacifique » / « alerte-info-pacifique.net »). Interdits : ${FAKE_GUARDRAILS.bannedOutletNames.slice(0, 10).join(', ')}…`}

PRODUIS CET OBJET JSON :

{
  "source": "Nom du média INVENTÉ qui signe le post",
  "domain": "domaine.ext cohérent avec ce nom, en minuscules",
  "date": "Horodatage affiché, dans le style du biais (ex. « Il y a 30 minutes », « BREAKING — il y a 2 heures », « Récemment »)",
  "titre": "Le titre de l'article trompeur, 60 à 130 caractères, illustrant clairement le biais",
  "texte": "Le corps du post, 250 à 450 caractères. C'est ici que le biais doit être le plus lisible.",
  "explication": "3 à 5 phrases adressées au joueur, APRÈS son choix. Nomme le biais « ${biasName} », pointe les indices précis présents dans le texte ci-dessus, et explique comment vérifier. Tutoie le joueur.",
  "consequences": {
    "share": "Conséquence concrète du partage de cette fausse information. 1 à 2 phrases.",
    "ignore": "Conséquence du fait de l'ignorer sans la signaler. 1 à 2 phrases.",
    "report": "Conséquence du signalement. 1 à 2 phrases."
  },
  "encouragement": "1 phrase de félicitations si le joueur trouve la bonne action (${bias.correctAction === 'report' ? 'signaler' : 'ignorer'}).",
  "warning": "1 phrase pédagogique s'il se trompe, qui donne le réflexe à retenir face à ce biais."
}`
}

/** Contrôles de sécurité appliqués à la sortie du modèle, avant validation. */
export function checkFakeSafety(gen, item) {
  const problems = []
  const blob = `${gen.source} ${gen.domain} ${gen.titre} ${gen.texte}`.toLowerCase()

  if (!FAKE_GUARDRAILS.allowRealOutletImpersonation) {
    const hit = FAKE_GUARDRAILS.bannedOutletNames.find((n) => `${gen.source} ${gen.domain}`.toLowerCase().includes(n))
    if (hit) problems.push(`usurpation du média réel « ${hit} »`)
  }

  // Conseils sanitaires actionnables
  if (/\b(arr[êe]tez|arr[êe]ter|cessez|ne prenez plus|ne buvez plus|ne mangez plus)\b/.test(blob)) {
    problems.push('conseil sanitaire actionnable détecté')
  }

  // Désignation de groupes
  if (/\b(kanak|caldoche|wallisien|musulman|juif|arabe|chinois|immigr[ée]s?)\b/.test(blob)) {
    problems.push('désignation d’un groupe identifiable')
  }

  // Reprise d'un nom propre de l'article source (personne réelle mise en cause)
  if (!FAKE_GUARDRAILS.allowRealPersonAccusation) {
    const properNouns = (item.title + ' ' + item.description)
      .match(/\b[A-ZÀ-Þ][a-zà-ÿ]{3,}\s+[A-ZÀ-Þ][a-zà-ÿ]{3,}\b/g) ?? []
    const reused = properNouns.find((n) => blob.includes(n.toLowerCase()))
    if (reused) problems.push(`nom propre réel réutilisé : « ${reused} »`)
  }

  return problems
}
