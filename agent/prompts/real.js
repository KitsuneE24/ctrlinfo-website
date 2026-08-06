/**
 * Prompt de génération d'un VRAI post.
 *
 * PRINCIPE FONDAMENTAL : le modèle ne produit AUCUN fait.
 * Il reformule le titre et le chapô du flux RSS en légende de réseau social,
 * puis rédige la pédagogie autour. Tout ce qui n'est pas dans l'article
 * source est un bug, pas une créativité.
 */

export const REAL_SYSTEM = `Tu es le rédacteur d'un jeu éducatif calédonien qui apprend aux joueurs à repérer la désinformation.

Ta mission : transformer un article de presse RÉEL en publication de réseau social, sans jamais le déformer.

RÈGLES ABSOLUES — leur violation rend le post inutilisable :
1. N'invente AUCUN fait, chiffre, date, lieu, nom ou citation. Tu ne disposes que du titre et du chapô fournis.
2. Si une information n'est pas dans l'article fourni, elle ne doit pas apparaître dans ta réponse.
3. Reste strictement neutre : pas de sensationnalisme, pas de majuscules d'emphase, pas d'emoji, pas d'appel à partager.
4. Si le chapô est trop maigre pour écrire 2 phrases, reste vague plutôt que d'inventer.
5. Écris en français de Nouvelle-Calédonie, ton naturel, tutoiement du joueur dans les parties pédagogiques.

Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour.`

/** Explication de la typologie, injectée dans le prompt utilisateur. */
const KIND_HELP = `Choisis "kind" selon l'utilité de RELAYER cette information :

- "service"  : information de service ou de sécurité qui aide concrètement les gens
               (alerte météo, risque sanitaire, coupure d'eau ou d'électricité, sécurité civile,
               démarche administrative, information pratique urgente).
- "factuel"  : information vérifiée et d'intérêt collectif, stabilisée
               (décision publique votée, résultat économique, découverte scientifique publiée,
               accord signé, bilan officiel définitif).
- "neutre"   : information vraie mais qui n'a aucun enjeu de diffusion
               (fait divers, people, sport, culture, chronique, portrait, opinion).
- "encours"  : information vraie mais encore mouvante
               (enquête en cours, bilan provisoire, négociation non conclue, procès en cours,
               conditionnel employé par la rédaction, « selon des sources »).

⚠ Ne classe PAS tout en "service"/"factuel". La majorité des dépêches sont "neutre" ou "encours".
C'est précisément ce que le jeu doit enseigner : une information vraie ne mérite pas
systématiquement d'être relayée.`

export function buildRealPrompt(item) {
  return `ARTICLE RÉEL À TRANSFORMER
────────────────────────────
Média        : ${item.sourceName} (source professionnelle, fiabilité : ${item.trust})
Titre        : ${item.title}
Chapô        : ${item.description}
Publié       : ${item.pubDate || 'non précisé'}
${item.categories?.length ? `Rubriques    : ${item.categories.slice(0, 4).join(', ')}` : ''}

${KIND_HELP}

PRODUIS CET OBJET JSON :

{
  "texte": "La légende du post, telle qu'un média la publierait sur Facebook : 2 à 3 phrases, 220 à 400 caractères, strictement fidèle au chapô ci-dessus. Ton neutre et informatif. Aucun fait ajouté.",
  "kind": "service | factuel | neutre | encours",
  "explication": "3 à 4 phrases expliquant au joueur POURQUOI cette information est fiable (média professionnel, faits attribués, ton mesuré) ET pourquoi elle mérite — ou non — d'être relayée, en cohérence avec le kind choisi. Tutoie le joueur.",
  "consequences": {
    "share": "Ce qui se passe si le joueur partage. 1 à 2 phrases concrètes.",
    "ignore": "Ce qui se passe s'il ignore. 1 à 2 phrases concrètes.",
    "report": "Ce qui se passe s'il signale. 1 à 2 phrases concrètes. Signaler un média professionnel est toujours une erreur : dis pourquoi."
  },
  "encouragement": "1 phrase de félicitations si le joueur choisit la bonne action.",
  "warning": "1 phrase bienveillante qui explique l'erreur s'il se trompe. Jamais culpabilisante."
}`
}

/**
 * Détecte les hallucinations : chiffres présents dans le texte généré
 * mais absents de l'article source.
 * Un LLM local invente typiquement des pourcentages et des montants.
 */
export function findHallucinatedNumbers(generatedText, item) {
  const sourceNumbers = new Set(
    `${item.title} ${item.description}`.match(/\d[\d\s.,]*/g)?.map((n) => n.replace(/[\s.,]/g, '')) ?? []
  )
  const used = generatedText.match(/\d[\d\s.,]*/g) ?? []
  return used
    .map((n) => n.replace(/[\s.,]/g, ''))
    // Les petits nombres (années courtes, « 2 phrases », etc.) sont trop bruités.
    .filter((n) => n.length >= 2 && !sourceNumbers.has(n))
}
