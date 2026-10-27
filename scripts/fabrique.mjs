// Fabrication des posts et des conversations, partagée par le générateur et le navigateur.
// `banques` : { faits, scenarios } de contenu.json.
import {
  AVIS_VRAI,
  CATEGORIES,
  CONSEQUENCES_FAUX,
  CONSEQUENCES_VRAI,
  FORMATS_SOURCE,
  HABILLAGES,
  HABILLAGE_MEDIA,
  FAIT_DEFORME,
  INDICE_AILLEURS,
  JOURNALISTES,
  MEDIAS_FICTIFS,
  PAGES_ORDINAIRES,
  PERSONNES,
  SCORES_FAUX,
  SCORES_VRAI,
  SOURCES_VAGUES,
  VRAI,
  VRAI_ARTICLE,
  VRAI_MEDIA,
  VOIX,
  indiceCorrection,
} from './gabarits.mjs'
import { etapes, outro } from './gabarits-conversations.mjs'
import { composerCommentaires } from './commentaires.mjs'

const AIDE = 'https://www.clemi.fr/'

export const dateLisible = (iso) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

const graineDe = (texte) => parseInt(empreinte(texte), 36)

// Même format que les autres : seule l'année trahit un post recyclé.
const dateAncienne = (iso) => {
  const d = new Date(iso ?? Date.now())
  d.setFullYear(d.getFullYear() - 2)
  return dateLisible(d.toISOString())
}

// Un peu avant la fabrication : les posts n'ont pas tous la même heure.
const dateRecente = (iso, graine) => dateLisible(new Date(new Date(iso).getTime() - (graine % 72) * 3_600_000).toISOString())

const permisPour = (categorie, niveau, base) =>
  (!categorie.niveaux || categorie.niveaux.includes(niveau)) && (categorie.besoin !== 'ecart' || Boolean(base.ecart))

const avecOrdre = (indices) => indices.map((indice, ordre) => ({ ordre, ...indice }))

const engagement = () => ({
  sponsorise: false,
  reactionCount: Math.floor(Math.random() * 40_000) + 200,
  commentCount: Math.floor(Math.random() * 2_000) + 10,
})

const compter = (liste, cle) => liste.reduce((m, x) => m.set(cle(x), (m.get(cle(x)) ?? 0) + 1), new Map())

// Les titres n'ont pas de point final, vrais comme faux.
const sansPoint = (texte) => texte.replace(/\.$/, '')

// Environ deux posts sur trois montrent la photo, vrais comme faux.
const montrePhoto = (graine) => (graine >>> 11) % 3 !== 0

// Photo libre et son crédit (affiché dans la correction), si le tirage la montre.
const illustration = (image, graine) =>
  image && montrePhoto(graine)
    ? {
        image: image.fichier,
        imageAlt: image.alt,
        credit: { auteur: image.auteur, licence: image.licence, licenceUrl: image.licenceUrl, page: image.page },
      }
    : {}

const DEBUTS_COMMUNS = /^(Le|La|Les|L’|L'|Un|Une|Des|Du|Dans|En|Au|Aux|Ce|Cette|C’est|Il|Elle|On|Selon|Avant|Urgent|Danger|Comme|Révélations|À|Ce|Seule)[\s’']/

const casser = (texte, casse) =>
  casse === 'min' ? texte.toLocaleLowerCase('fr-FR') : casse === 'maj' ? texte.toLocaleUpperCase('fr-FR') : texte

/** Le titre et le texte d'un post, écrits comme le profil écrit sur les réseaux. */
function parler({ voix, graine, titre, phrase = '', source = null }) {
  const v = VOIX[voix]
  if (!v) return { titre, texte: phrase }
  const ouverture = v.ouvertures[graine % v.ouvertures.length]
  const fin = v.fins[(graine >>> 5) % v.fins.length]
  const texte = [phrase, source ? v.source(source) : '', fin].filter(Boolean).join(' ')
  // « Tiens, le cagou… » : minuscule après une virgule ou deux-points, sauf nom propre.
  const suite = /[,:]$/.test(ouverture) && DEBUTS_COMMUNS.test(titre) ? titre[0].toLocaleLowerCase('fr-FR') + titre.slice(1) : titre
  return {
    titre: casser([ouverture, suite].filter(Boolean).join(' '), v.casse),
    texte: casser(texte, v.casse),
  }
}

// Qui publie : une personne, une page ou un média, pour les vrais comme pour les faux.
const genreAuteur = (graine) => ['personne', 'personne', 'page', 'media'][(graine >>> 6) % 4]

/** Ce qui peut devenir un faux : un événement inventé, ou un fait réel dont un détail change. */
export const basesDe = ({ faits = [], scenarios = [] } = {}) => [
  ...scenarios.map((s) => ({ id: s.id, titre: sansPoint(s.titre), ecart: s.ecart, image: s.image, theme: s.theme })),
  ...faits.map((f) => ({ id: `fait-${f.id}`, titre: sansPoint(f.faux), fait: f, image: f.image, theme: f.theme })),
]

/** Le fait le moins publié à ce niveau, puis partout ; jamais deux fois au même niveau. */
export function prochainVrai(pris, niveau, faits = []) {
  const duNiveau = new Set(pris.filter((p) => p.level === niveau).map((p) => p.fait))
  const partout = compter(pris, (p) => p.fait)
  return [...faits]
    .filter((f) => !duNiveau.has(f.id))
    .sort(
      (x, y) =>
        (partout.get(x.id) ?? 0) - (partout.get(y.id) ?? 0) ||
        graineDe(`${x.id}|${niveau}`) - graineDe(`${y.id}|${niveau}`)
    )[0] ?? null
}

export function fabriquerVrai(fait, niveau, { aideUrl, maintenant = new Date().toISOString(), prefixe = 'vrai' } = {}) {
  const slug = `${prefixe}-${fait.id}-${niveau}`
  const graine = graineDe(slug)
  const genre = genreAuteur(graine)
  const auteurs = genre === 'media' ? MEDIAS_FICTIFS : genre === 'page' ? PAGES_ORDINAIRES : PERSONNES
  const [nom, couleur, pseudo, voix] = auteurs[graine % auteurs.length]
  const compte = { nom }
  // Un média cite sa source ; une personne ou une page, une fois sur trois.
  const ecrit =
    genre === 'media'
      ? null
      : parler({ voix, graine, titre: sansPoint(fait.vrai), source: (graine >>> 9) % 3 === 0 ? fait.source.nom : null })
  const source = FORMATS_SOURCE[(graine >>> 8) % FORMATS_SOURCE.length](fait.source.nom)
  const journaliste = JOURNALISTES[(graine >>> 3) % JOURNALISTES.length]
  const photo = illustration(fait.image, graine)
  return {
    ...engagement(),
    date: dateRecente(maintenant, graine),
    learnMoreTips: aideUrl ?? AIDE,
    origine: 'fiction',
    ...(genre === 'media' ? { format: 'article' } : {}),
    recolteLe: maintenant,
    fait: fait.id,
    ...photo,
    slug,
    source: nom,
    sourceColor: couleur,
    domain: pseudo,
    titre: ecrit ? ecrit.titre : sansPoint(fait.vrai),
    texte: ecrit ? ecrit.texte : `Article de ${journaliste}, publié par ${nom}. ${source}`,
    isFake: false,
    level: niveau,
    correctAction: 'share',
    biais: 'Aucun (information vérifiée)',
    explication: VRAI.explication(fait),
    analyseVrai: VRAI.analyseVrai(fait),
    indices: avecOrdre(genre === 'media' ? VRAI_MEDIA.indices(fait, compte, journaliste) : VRAI.indices(fait, compte)),
    commentaires: composerCommentaires({
      graine,
      niveau,
      isFake: false,
      theme: fait.theme,
      avecPhoto: Boolean(photo.image),
      avis: AVIS_VRAI[graine % AVIS_VRAI.length](fait),
    }),
    encouragement: 'Bon réflexe : une information sourcée, qu’on peut vérifier, se partage.',
    warning: 'Attention : cette information était vraie, et sa source se vérifie en une recherche.',
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: fait.source.url,
    learnMoreUrl: fait.source.url,
  }
}

/** Un vrai article repris tel quel : titre jamais modifié, crédit complet (auteur, éditeur, licence). */
export function fabriquerArticle(article, niveau, { aideUrl, maintenant = new Date().toISOString() } = {}) {
  const slug = `article-${empreinte(article.url)}`
  const graine = graineDe(slug)
  const a = {
    nom: article.nom,
    editeur: article.editeur,
    auteur: article.auteur,
    // « d’Émilie », « de Julie »
    deAuteur: /^[aeiouyhàâéèêëîïôûü]/i.test(article.auteur) ? `d’${article.auteur}` : `de ${article.auteur}`,
    domaine: new URL(article.url).hostname.replace(/^www\./, ''),
    date: dateLisible(article.publieLe),
  }
  return {
    ...engagement(),
    date: a.date,
    learnMoreTips: aideUrl ?? AIDE,
    origine: 'article',
    format: 'article',
    recolteLe: maintenant,
    article: { titre: article.titre, url: article.url, publieLe: article.publieLe, nom: a.nom, editeur: a.editeur, auteur: a.auteur },
    licence: article.licence,
    slug,
    source: a.nom,
    sourceColor: '#1800ad',
    domain: a.domaine,
    titre: article.titre,
    texte: `Article ${a.deAuteur}, publié par ${a.editeur}. À lire en entier sur ${a.domaine}.`,
    isFake: false,
    level: niveau,
    correctAction: 'share',
    biais: 'Aucun (information vérifiée)',
    explication: VRAI_ARTICLE.explication(a),
    analyseVrai: VRAI_ARTICLE.analyseVrai(a),
    indices: avecOrdre(VRAI_ARTICLE.indices(a)),
    commentaires: composerCommentaires({
      graine,
      niveau,
      isFake: false,
      theme: 'actu',
      avecPhoto: false,
      avis: VRAI_ARTICLE.avis[graine % VRAI_ARTICLE.avis.length](a),
    }),
    encouragement: 'Bon réflexe : un média identifiable, un auteur nommé, une date et un lien.',
    warning: 'Attention : cet article venait d’un média identifiable, signé et daté.',
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: article.url,
    learnMoreUrl: article.url,
  }
}

/**
 * Le prochain faux pour ce niveau : la base et le procédé les moins vus, jamais une combinaison
 * déjà prise. `pris` : les faux existants ({ scenario, biais, level }).
 */
export function prochainFaux(pris, niveau, banques) {
  const duNiveau = pris.filter((p) => p.level === niveau)
  const deja = new Set(duNiveau.map((p) => `${p.scenario}|${p.biais}`))
  const basesNiveau = compter(duNiveau, (p) => p.scenario)
  const basesPartout = compter(pris, (p) => p.scenario)
  const biaisNiveau = compter(duNiveau, (p) => p.biais)

  const bases = basesDe(banques).sort(
    (x, y) =>
      (basesNiveau.get(x.id) ?? 0) - (basesNiveau.get(y.id) ?? 0) ||
      (basesPartout.get(x.id) ?? 0) - (basesPartout.get(y.id) ?? 0) ||
      // Mélange les faits déformés et les événements inventés.
      graineDe(`${x.id}|${niveau}`) - graineDe(`${y.id}|${niveau}`)
  )
  for (const base of bases) {
    if (base.fait && niveau >= 4) {
      if (!deja.has(`${base.id}|${FAIT_DEFORME.biais}`)) return { base, categorie: FAIT_DEFORME }
      continue
    }
    const categorie = CATEGORIES.filter((c) => permisPour(c, niveau, base) && !deja.has(`${base.id}|${c.biais}`)).sort(
      (x, y) =>
        (biaisNiveau.get(x.biais) ?? 0) - (biaisNiveau.get(y.biais) ?? 0) ||
        // Les procédés subtils d'abord, là où ils sont permis.
        Number(Boolean(y.niveaux)) - Number(Boolean(x.niveaux))
    )[0]
    if (categorie) return { base, categorie }
  }
  return null
}

const valeur = (v, base) => (typeof v === 'function' ? v(base) : v)

// `media` : true ou false impose le format ; absent, le tirage choisit comme pour un vrai.
// `photo: false` : pendant d'un vrai article repris, qui n'a jamais de photo.
export function fabriquerFaux(base, categorie, niveau, { aideUrl, maintenant = new Date().toISOString(), prefixe = 'faux', media, photo: avecPhoto = true } = {}) {
  const slug = `${prefixe}-${base.id}-${niveau}-${empreinte(categorie.biais)}`
  const graine = graineDe(slug)
  const enMedia = media ?? genreAuteur(graine) === 'media'
  // Un faux article : publié par un média inventé, au lieu d'une page ou d'une personne.
  const habillage = enMedia ? HABILLAGE_MEDIA : HABILLAGES.find((h) => h.niveau === niveau)
  // Une fois sur deux une personne, une fois sur deux une page.
  const personne = (c) => c[2].startsWith('@')
  const tous = enMedia ? MEDIAS_FICTIFS : habillage.comptes
  const groupe = tous.filter((c) => personne(c) === Boolean((graine >>> 6) % 2))
  const comptes = groupe.length > 0 ? groupe : tous
  const [nom, couleur, domaine, voixCompte] = comptes[graine % comptes.length]
  const compte = { nom, couleur, domaine }
  const voix = enMedia ? null : voixCompte ?? habillage.voix
  const titre = categorie.titres[niveau - 1](base.titre)
  const subtil = niveau >= 4
  // Un fait déformé reprend la forme d'un vrai post.
  const phrase = categorie.phrases
    ? valeur(categorie.phrases[niveau - 1], base)
    : enMedia
      ? 'Selon nos informations.'
      : ''
  const fait = base.fait
  const sourceVague = SOURCES_VAGUES[(graine >>> 4) % SOURCES_VAGUES.length]
  const vague = FORMATS_SOURCE[(graine >>> 8) % FORMATS_SOURCE.length](sourceVague)
  const journaliste = JOURNALISTES[(graine >>> 3) % JOURNALISTES.length]
  // Hors média, une source bidon deux fois sur trois aux niveaux 4 et 5, dite comme le profil parle.
  const ecrit = enMedia
    ? null
    : parler({ voix, graine, titre, phrase, source: subtil && (graine >>> 9) % 3 !== 0 ? sourceVague : null })
  // Comme un vrai article, sauf la source ; non signé avant le niveau 4.
  const texte = enMedia
    ? subtil
      ? `Article de ${journaliste}, publié par ${compte.nom}. ${phrase} ${vague}`
      : `Article de la rédaction, publié par ${compte.nom}. ${phrase}`
    : ecrit.texte
  const photo = avecPhoto ? illustration(base.image, graine) : {}
  // Un événement inventé n'a pas de vraie photo : celle-ci vient d'ailleurs.
  const photoAilleurs = photo.image && !fait ? ' La photo est réelle, mais elle a été prise ailleurs : elle ne prouve rien.' : ''
  const explicationCompte = enMedia ? (subtil ? habillage.explicationSigne : habillage.explication) : habillage.explication

  return {
    ...engagement(),
    date: categorie.ancienne ? dateAncienne(maintenant) : dateRecente(maintenant, graine),
    learnMoreTips: aideUrl ?? AIDE,
    origine: 'fiction',
    ...(enMedia ? { format: 'article' } : {}),
    recolteLe: maintenant,
    scenario: base.id,
    ...photo,
    slug,
    source: compte.nom,
    sourceColor: compte.couleur,
    domain: compte.domaine,
    titre: (ecrit ? ecrit.titre : titre).slice(0, 300),
    texte,
    isFake: true,
    level: niveau,
    correctAction: 'report',
    biais: categorie.biais,
    explication:
      (fait
        ? `Ce post déforme un fait réel : ${fait.vrai} `
        : `Ce post est inventé pour l'exercice : ni le fait, ni le compte n'existent. `) +
      `${categorie.explication} ${explicationCompte}${photoAilleurs}`,
    analyseFaux: fait ? `${categorie.analyseFaux} En réalité : ${fait.vrai}` : categorie.analyseFaux,
    indices: avecOrdre([
      categorie.indice,
      enMedia ? (subtil ? habillage.indiceSigne(compte) : habillage.indice(compte)) : habillage.indice(compte),
      fait ? indiceCorrection(fait) : INDICE_AILLEURS[subtil ? 1 : 0],
    ]),
    commentaires: composerCommentaires({
      graine,
      niveau,
      isFake: true,
      theme: base.theme,
      avecPhoto: Boolean(photo.image),
      avis: {
        croit: categorie.croit,
        doute: categorie.doute,
        verifie: fait ? `J’ai vérifié sur ${fait.source.nom} : ce n’est pas ça.` : categorie.verifie[subtil ? 1 : 0],
      },
    }),
    encouragement: `Bien vu : vous avez reconnu le procédé « ${categorie.biais.toLowerCase()} ».`,
    warning: `Le procédé employé ici s'appelle « ${categorie.biais.toLowerCase()} ». Il fonctionne d'autant mieux qu'on est pressé.`,
    consequences: CONSEQUENCES_FAUX,
    scores: SCORES_FAUX,
    sourceUrl: null,
    learnMoreUrl: fait?.source.url ?? aideUrl ?? AIDE,
  }
}

export function fabriquerConversation(post, gabarit, distribution, options = {}) {
  const { lanceur, soutien, groupe } = distribution
  const id = options.id ?? `sujet-${distribution.id}-${post.scenario}`
  const variante = graineDe(id)
  const message = ([auteur, texte]) => ({ texte, auteur })

  const steps = etapes({ post, gabarit, lanceur, soutien, variante }).map((etape, ordre) => {
    const decalage = (variante + ordre) % etape.choix.length
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
    contact: distribution.id,
    name: groupe ? distribution.nom : lanceur.nom,
    preview: post.titre,
    color: lanceur.couleur,
    groupe,
    ...(groupe ? { contexte: distribution.nom } : {}),
    etapes: steps.length,
    participants: groupe ? [lanceur, soutien] : [lanceur],
    intro: [],
    steps,
    outro,
    origine: 'fiction',
    scenario: post.scenario,
    biais: post.biais,
    recolteLe: options.maintenant ?? new Date().toISOString(),
  }
}

/** `nombre` sujets neufs pour un contact : base et procédé jamais encore discutés. */
export function sujetsPour(distribution, conversations, nombre, banques, { prefixe = 'sujet', maintenant } = {}) {
  const pris = new Set(conversations.map((c) => `${c.scenario}|${c.biais}`))
  const parBase = compter(conversations, (c) => c.scenario)
  const duContact = new Set(conversations.filter((c) => c.contact === distribution.id).map((c) => c.scenario))
  const sujets = []
  const bases = basesDe(banques).sort(
    (x, y) =>
      Number(duContact.has(x.id)) - Number(duContact.has(y.id)) ||
      (parBase.get(x.id) ?? 0) - (parBase.get(y.id) ?? 0) ||
      graineDe(`${distribution.id}|${x.id}`) - graineDe(`${distribution.id}|${y.id}`)
  )
  for (const base of bases) {
    if (sujets.length === nombre) break
    const graine = graineDe(`${distribution.id}|${base.id}`)
    const debut = (graine + sujets.length) % CATEGORIES.length
    const gabarit = [...CATEGORIES.slice(debut), ...CATEGORIES.slice(0, debut)].find(
      // La date et le texte du post n'apparaissent pas dans une discussion.
      (c) => !c.niveaux && !pris.has(`${base.id}|${c.biais}`)
    )
    if (!gabarit) continue
    pris.add(`${base.id}|${gabarit.biais}`)
    // Pas de niveau 5 : le post y est trop neutre pour une discussion.
    const post = fabriquerFaux(base, gabarit, 1 + (graine % 3), { maintenant })
    const id = `${prefixe}-${distribution.id}-${base.id}-${empreinte(gabarit.biais)}`
    sujets.push(fabriquerConversation(post, gabarit, distribution, { id, maintenant }))
  }
  return sujets
}
