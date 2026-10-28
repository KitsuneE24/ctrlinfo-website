// `banques` : { faits, scenarios } de contenu.json.
import {
  AVIS_VRAI,
  CATEGORIES,
  CONSEQUENCES_FAUX,
  CONSEQUENCES_VRAI,
  CORRECTIONS_FAIT,
  HABILLAGES,
  HABILLAGE_MEDIA,
  FAIT_DEFORME,
  INDICE_AILLEURS,
  JOURNALISTES,
  MEDIAS_FICTIFS,
  PAGES_ORDINAIRES,
  PERSONNES,
  RELAIS_THEME,
  SCORES_FAUX,
  SCORES_VRAI,
  SOURCES_VAGUES,
  TEXTES_ARTICLE,
  VRAI,
  VRAI_ARTICLE,
  VRAI_MEDIA,
  VOIX,
  indiceCorrection,
  surLeSite,
} from './gabarits.mjs'
import { etapes, outro } from './gabarits-conversations.mjs'
import { composerCommentaires, tirage } from './commentaires.mjs'

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

const dateAncienne = (iso) => {
  const d = new Date(iso ?? Date.now())
  d.setFullYear(d.getFullYear() - 2)
  return dateLisible(d.toISOString())
}

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

const sansPoint = (texte) => texte.replace(/\.$/, '')

const montrePhoto = (graine) => (graine >>> 11) % 3 !== 0

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

const enMinuscule = (texte) => (DEBUTS_COMMUNS.test(texte) ? texte[0].toLocaleLowerCase('fr-FR') + texte.slice(1) : texte)

const CRIENT = new Set(['alarmiste', 'militant', 'informe'])

function parler({ voix, graine, titre, phrase = '', suite = '', source = null, theme, actu = false }) {
  const v = VOIX[voix]
  if (!v) return { titre, texte: phrase }
  const alea = tirage(graine ^ 0x5bd1e995)
  const un = (liste) => liste[Math.floor(alea() * liste.length)]
  const ouverture = un(v.ouvertures)
  const parTheme = RELAIS_THEME[theme] ?? []
  const relai = !CRIENT.has(voix) && parTheme.length > 0 && alea() < 0.4 ? un(parTheme) : un(v.relais[actu ? 'actu' : 'fait'])
  const appel = alea() < 0.6 ? un(v.appels) : ''
  const fin = un(v.fins)
  const texte = [relai, phrase, suite, source ? v.source(source) : '', appel, fin].filter(Boolean).join(' ')
  const tete = /[,:]$/.test(ouverture) && !titre.includes(' : ') ? enMinuscule(titre) : titre
  const debut = /:$/.test(ouverture) && titre.includes(' : ') ? ouverture.replace(/\s*:$/, '.') : ouverture
  return {
    titre: casser([debut, tete].filter(Boolean).join(' '), v.casse),
    texte: casser(texte, v.casse),
  }
}

const genreAuteur = (graine) => ['personne', 'personne', 'page', 'media'][(graine >>> 6) % 4]

export const basesDe = ({ faits = [], scenarios = [] } = {}) => [
  ...scenarios.map((s) => ({ id: s.id, titre: sansPoint(s.titre), ecart: s.ecart, image: s.image, theme: s.theme, lieu: s.lieu })),
  ...faits.map((f) => ({ id: `fait-${f.id}`, titre: sansPoint(f.faux), fait: f, image: f.image, theme: f.theme })),
]

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
  const journaliste = JOURNALISTES[(graine >>> 3) % JOURNALISTES.length]
  const ecrit =
    genre === 'media'
      ? null
      : parler({
          voix,
          graine,
          titre: sansPoint(fait.vrai),
          source: (graine >>> 9) % 2 === 0 ? surLeSite(fait.source.nom) : null,
          theme: fait.theme,
        })
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
    texte: ecrit ? ecrit.texte : TEXTES_ARTICLE.vrai[(graine >>> 8) % TEXTES_ARTICLE.vrai.length]({ journaliste, source: fait.source.nom }),
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
      avis: AVIS_VRAI(fait),
      contexte: { voix: genre === 'media' ? 'article' : voix, compte: nom },
    }),
    encouragement: 'Bon réflexe : une information sourcée, qu’on peut vérifier, se partage.',
    warning: 'Attention : cette information était vraie, et sa source se vérifie en une recherche.',
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: fait.source.url,
    learnMoreUrl: fait.source.url,
  }
}

export function fabriquerArticle(article, niveau, { aideUrl, maintenant = new Date().toISOString() } = {}) {
  const slug = `article-${empreinte(article.url)}`
  const graine = graineDe(slug)
  const a = {
    nom: article.nom,
    editeur: article.editeur,
    auteur: article.auteur,
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
      avis: VRAI_ARTICLE.avis(a),
      contexte: { voix: 'article', compte: a.nom },
    }),
    encouragement: 'Bon réflexe : un média identifiable, un auteur nommé, une date et un lien.',
    warning: 'Attention : cet article venait d’un média identifiable, signé et daté.',
    consequences: CONSEQUENCES_VRAI,
    scores: SCORES_VRAI,
    sourceUrl: article.url,
    learnMoreUrl: article.url,
  }
}

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
        Number(Boolean(y.niveaux)) - Number(Boolean(x.niveaux))
    )[0]
    if (categorie) return { base, categorie }
  }
  return null
}

const valeur = (v, base) => (typeof v === 'function' ? v(base) : v)

export function fabriquerFaux(base, categorie, niveau, { aideUrl, maintenant = new Date().toISOString(), prefixe = 'faux', media, photo: avecPhoto = true } = {}) {
  const slug = `${prefixe}-${base.id}-${niveau}-${empreinte(categorie.biais)}`
  const graine = graineDe(slug)
  const enMedia = media ?? genreAuteur(graine) === 'media'
  const habillage = enMedia ? HABILLAGE_MEDIA : HABILLAGES.find((h) => h.niveau === niveau)
  const personne = (c) => c[2].startsWith('@')
  const tous = enMedia ? MEDIAS_FICTIFS : habillage.comptes
  const groupe = tous.filter((c) => personne(c) === Boolean((graine >>> 6) % 2))
  const comptes = groupe.length > 0 ? groupe : tous
  const [nom, couleur, domaine, voixCompte] = comptes[graine % comptes.length]
  const compte = { nom, couleur, domaine }
  const voix = enMedia ? null : voixCompte ?? habillage.voix
  const titre = categorie.titres[niveau - 1](base.titre)
  const subtil = niveau >= 4
  const phrase = categorie.phrases
    ? valeur(categorie.phrases[niveau - 1], base)
    : enMedia
      ? 'Selon nos informations.'
      : ''
  const suite = categorie.suites?.[niveau <= 2 ? 0 : niveau === 3 ? 1 : 2]
  const fait = base.fait
  const sourceVague = SOURCES_VAGUES[(graine >>> 4) % SOURCES_VAGUES.length]
  const journaliste = JOURNALISTES[(graine >>> 3) % JOURNALISTES.length]
  const ecrit = enMedia
    ? null
    : parler({
        voix,
        graine,
        titre,
        phrase,
        suite,
        source: subtil && (graine >>> 9) % 3 !== 0 ? sourceVague : null,
        theme: base.theme,
        actu: !fait,
      })
  const texte = enMedia
    ? TEXTES_ARTICLE.faux({ journaliste: subtil ? journaliste : null, phrase, suite, cite: sourceVague })
    : ecrit.texte
  const photo = avecPhoto ? illustration(base.image, graine) : {}
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
        doute: base.lieu ? [...categorie.doute, `J’habite pas loin, personne n’en parle ${base.lieu}.`] : categorie.doute,
        verifie: fait
          ? CORRECTIONS_FAIT(fait, enMinuscule(fait.vrai))
          : [categorie.verifie[subtil ? 1 : 0], ...(base.lieu ? [`J’ai demandé à de la famille ${base.lieu} : personne n’est au courant.`] : [])],
      },
      contexte: { voix: enMedia ? 'article' : voix, compte: compte.nom, lieu: base.lieu },
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
      (c) => !c.niveaux && !pris.has(`${base.id}|${c.biais}`)
    )
    if (!gabarit) continue
    pris.add(`${base.id}|${gabarit.biais}`)
    const post = fabriquerFaux(base, gabarit, 1 + (graine % 3), { maintenant })
    const id = `${prefixe}-${distribution.id}-${base.id}-${empreinte(gabarit.biais)}`
    sujets.push(fabriquerConversation(post, gabarit, distribution, { id, maintenant }))
  }
  return sujets
}
