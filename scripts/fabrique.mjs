// Fabrication des publications et conversations, partagée par la récolte et le navigateur.
import { COMMENTATEURS, CONSEQUENCES_FAUX, CONSEQUENCES_VRAI, HABILLAGES, SCORES_FAUX, SCORES_VRAI, VRAI } from './gabarits.mjs'
import { etapes, outro } from './gabarits-conversations.mjs'

export const articleDe = (post) => ({
  titre: post.article.titre,
  resume: post.texte,
  url: post.article.url,
  publieLe: post.article.publieLe,
  nom: post.article.nom,
  editeur: post.article.editeur,
  domaineReel: post.domain,
  image: post.image ?? null,
})

export const dateLisible = (iso) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    // Heure de Nouméa, même sur GitHub Actions.
    timeZone: 'Pacific/Noumea',
  })

export function empreinte(texte) {
  let e = 0x811c9dc5
  for (const octet of new TextEncoder().encode(texte)) {
    e ^= octet
    e = Math.imul(e, 0x01000193) >>> 0
  }
  return (e >>> 0).toString(36)
}

export function extrait(resume, max = 220) {
  if (!resume || resume.length < 40) return ''
  let court = resume
  if (court.length > max) {
    const coupe = court.slice(0, max)
    const phrase = Math.max(coupe.lastIndexOf('. '), coupe.lastIndexOf('! '), coupe.lastIndexOf('? '))
    court = phrase > 80 ? coupe.slice(0, phrase + 1) : `${coupe.slice(0, coupe.lastIndexOf(' '))}…`
  }
  return /[.!?…»]$/.test(court) ? court : `${court}.`
}

export const proprement = (texte) => texte.replace(/\s+/g, ' ').trim()

const PAS_UN_PRENOM = new Set(
  ('Le La Les Un Une Des Du De Au Aux En Pour Par Sur Avec Dans Après Avant Selon Quand ' +
    'Comment Pourquoi Ce Cette Ces Nouvelle Grande Grand Coupe Province Union Nations États Etats ' +
    'Mont Saint Sainte Jeux Tour Pays Îles Iles Mer Côte Air Radio Conseil Cour Banque Office ' +
    'Maison Centre Lycée Collège Université Club Festival Salon Fête Semaine Journée Opération').split(' ')
)

export const HORS_DE_CAUSE = "Ce qui a été ajouté est inventé pour l'exercice :"

export function personneDe(article) {
  const texte = `${article.titre} ${article.resume}`
  const civilite = texte.match(/(?<!\p{L})(?:M\.|Mme|Dr|Pr)\s+(\p{Lu}[\p{L}'-]+)/u)
  if (civilite) return civilite[0]
  for (const m of texte.matchAll(/(?<!\p{L})(\p{Lu}[\p{Ll}'-]+)\s+(\p{Lu}[\p{L}'-]+)/gu)) {
    if (!PAS_UN_PRENOM.has(m[1]) && !PAS_UN_PRENOM.has(m[2])) return m[0]
  }
  return null
}

export function contexte(article) {
  const base = (article.domaineReel ?? 'info').split('.').find((p) => p.length > 2) ?? 'info'
  return {
    titre: article.titre,
    extrait: extrait(article.resume),
    editeur: article.editeur,
    nom: article.nom,
    date: dateLisible(article.publieLe),
    domaineReel: article.domaineReel ?? article.nom,
    domaineFaux: `${base}-actu.info`,
    // franceinfo.fr → franceinfo-fr.com
    domaineCopie: `${(article.domaineReel ?? base).replace(/\.([a-z]+)$/, '-$1')}.com`,
  }
}

const indice = (nature, cible, picto, libelle, explication) => ({
  nature,
  cible,
  picto,
  libelle,
  explication,
})

function commentaires(lignes, graine) {
  return lignes.map(([posture, texte], k) => {
    const liste = COMMENTATEURS[posture]
    const [auteur, couleur] = liste[(graine + k * 3) % liste.length]
    return { auteur, couleur, texte, posture }
  })
}

const avecOrdre = (indices) => indices.map((indice, ordre) => ({ ordre, ...indice }))

const commun = (article, a, { aideUrl, maintenant = new Date().toISOString() } = {}) => ({
  date: a.date,
  image: article.image,
  sponsorise: false,
  learnMoreTips: aideUrl ?? 'https://www.clemi.fr/',
  reactionCount: Math.floor(Math.random() * 40_000) + 200,
  commentCount: Math.floor(Math.random() * 2_000) + 10,
  origine: 'RSS',
  recolteLe: maintenant,
  article: {
    titre: article.titre,
    url: article.url,
    publieLe: article.publieLe,
    nom: article.nom,
    editeur: article.editeur,
  },
})

export function fabriquerVrai(article, level, graine, options) {
  const a = contexte(article)
  const texte =
    a.extrait ||
    `${article.titre} — article publié par ${a.editeur}, signé et daté, consultable en entier sur le site de la rédaction.`

  return {
    ...commun(article, a, options),
    slug: `rss-vrai-${empreinte(article.url)}`,
    source: a.nom,
    sourceColor: '#1800ad',
    domain: a.domaineReel,
    titre: article.titre,
    texte,
    isFake: false,
    level,
    correctAction: 'share',
    biais: 'Aucun (information vérifiée)',
    explication: VRAI.explication(a),
    analyseVrai: VRAI.analyseVrai(a),
    indices: avecOrdre(VRAI.indices(a)),
    commentaires: commentaires(VRAI.commentaires[graine % VRAI.commentaires.length](a), graine),
    encouragement: 'Bon réflexe : une source identifiable, datée et consultable se partage.',
    warning: "Attention — cette information était vérifiable : rédaction connue, date, lien vers l'original.",
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: article.url,
    learnMoreUrl: article.url,
  }
}

const valeur = (v, a) => (typeof v === 'function' ? v(a) : v)

export function fabriquerFaux(article, categorie, niveau, graine, options) {
  const a = contexte(article)
  const habillage = HABILLAGES.find((h) => h.niveau === niveau)
  const [nom, couleur, domaine] = habillage.comptes[graine % habillage.comptes.length]
  const compte = { nom: valeur(nom, a), couleur, domaine: valeur(domaine, a) }
  const titre = categorie.titres[niveau - 1](a.titre)
  const subtil = niveau >= 4
  const personne = personneDe(article)
  const horsDeCause = personne
    ? ` ${HORS_DE_CAUSE} ni ${personne} ni l'article d'origine ne l'ont dit.`
    : ''

  return {
    ...commun(article, a, options),
    slug: `rss-faux-${empreinte(article.url)}`,
    source: compte.nom,
    sourceColor: compte.couleur,
    domain: compte.domaine,
    titre: (habillage.titre?.(titre) ?? titre).slice(0, 300),
    texte: proprement(`${a.extrait} ${categorie.phrases[niveau - 1]}`),
    isFake: true,
    level: niveau,
    correctAction: 'report',
    biais: categorie.biais,
    explication:
      `Fabriqué pour l'exercice à partir d'un article de ${a.editeur} : le fait est réel, l'ajout non. ` +
      `${categorie.explication} ${habillage.explication}`,
    analyseVrai: `Le fait de départ est réel : ${a.editeur} l'a publié le ${a.date}.`,
    analyseFaux: categorie.analyseFaux + horsDeCause,
    indices: avecOrdre([
      categorie.indice,
      habillage.indice(a, compte),
      subtil
        ? indice('FIABLE', 'TITRE', 'Newspaper', 'Le reste est exact',
          `Le fait vient bien de ${a.editeur} (${a.date}). C’est ce qui rend le post crédible.`)
        : indice('VERIFICATION', 'DATE', 'Search', 'L’article d’origine',
          `Le fait vient de ${a.nom}, publié le ${a.date}. Comparez : c’est là qu’on voit ce qui a été ajouté.`),
    ]),
    commentaires: commentaires(
      [
        ['CROIT', categorie.croit],
        ['DOUTE', categorie.doute],
        ['VERIFIE', categorie.verifie[subtil ? 1 : 0](a)],
      ],
      graine
    ),
    encouragement: `Bien vu : vous avez reconnu le procédé « ${categorie.biais.toLowerCase()} ».${horsDeCause}`,
    warning: `Le procédé employé ici s'appelle « ${categorie.biais.toLowerCase()} ». Il fonctionne d'autant mieux qu'on est pressé.${horsDeCause}`,
    consequences: CONSEQUENCES_FAUX,
    scores: SCORES_FAUX,
    sourceUrl: null,
    learnMoreUrl: article.url,
  }
}

export function fabriquerConversation(post, article, gabarit, distribution, options = {}) {
  const a = contexte(article)
  const { lanceur, soutien, groupe } = distribution
  const id = options.id ?? `rss-${empreinte(article.url)}`
  const message = ([auteur, texte]) => ({ texte, auteur })

  const steps = etapes({ post, a, gabarit, lanceur, soutien }).map((etape, ordre) => {
    const decalage = (empreinte(article.url).charCodeAt(0) + ordre) % etape.choix.length
    const choix = [...etape.choix.slice(decalage), ...etape.choix.slice(0, decalage)]
    return {
      ordre,
      auteur: lanceur,
      messages: etape.messages.filter(Boolean).map(message),
      choices: choix.map((c, i) => ({ id: `${id}-${ordre}-${i}`, ...c })),
    }
  })

  return {
    id,
    name: groupe ? distribution.nom : lanceur.nom,
    preview: `Regarde ce que ${post.source} vient de publier`,
    color: lanceur.couleur,
    groupe,
    ...(groupe ? { contexte: distribution.nom } : {}),
    etapes: steps.length,
    participants: groupe ? [lanceur, soutien] : [lanceur],
    intro: [],
    steps,
    outro: outro(a),
    origine: 'RSS',
    recolteLe: options.maintenant ?? new Date().toISOString(),
    article: { titre: article.titre, url: article.url, publieLe: article.publieLe, nom: article.nom },
  }
}
