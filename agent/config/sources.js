/**
 * Whitelist des flux RSS.
 *
 * POURQUOI UNE WHITELIST EN DUR ?
 * Le modèle local (LM Studio) ne sait PAS juger si un média est fiable — il
 * hallucinerait. La fiabilité est donc une donnée déclarée ici, par un humain.
 * L'IA ne fait que rédiger et classer À PARTIR de ce que tu déclares.
 *
 * Annuaire pour trouver d'autres flux : https://atlasflux.saynete.com
 * (c'est un annuaire, pas un flux d'actu — il ne couvre pas la Nouvelle-Calédonie)
 *
 * trust :
 *   'institutionnel' → service public / autorité (météo, gouvernement, santé)
 *   'reference'      → média de référence, rédaction professionnelle
 *   'regional'       → presse locale professionnelle
 *
 * scope : 'nc' (Nouvelle-Calédonie) | 'fr' | 'monde'
 */

export const SOURCES = [
  // ---------- Nouvelle-Calédonie ----------
  {
    id: 'nc1ere',
    name: 'Nouvelle-Calédonie La 1ère',
    url: 'https://la1ere.franceinfo.fr/nouvellecaledonie/rss',
    domain: 'la1ere.franceinfo.fr',
    color: '#16a34a',
    trust: 'institutionnel',
    scope: 'nc',
    sourceUrl: 'https://la1ere.franceinfo.fr/nouvellecaledonie/',
  },
  {
    id: 'lnc',
    name: 'Les Nouvelles Calédoniennes',
    url: 'https://www.lnc.nc/rss.xml',
    domain: 'lnc.nc',
    color: '#0891b2',
    trust: 'regional',
    scope: 'nc',
    sourceUrl: 'https://www.lnc.nc',
  },
  {
    id: 'actunc',
    name: 'Actu.nc',
    url: 'https://actu.nc/feed/',
    domain: 'actu.nc',
    color: '#0d9488',
    trust: 'regional',
    scope: 'nc',
    sourceUrl: 'https://actu.nc',
  },

  // ---------- France ----------
  {
    id: 'franceinfo',
    name: 'franceinfo',
    url: 'https://www.franceinfo.fr/titres.rss',
    domain: 'franceinfo.fr',
    color: '#1e40af',
    trust: 'institutionnel',
    scope: 'fr',
    sourceUrl: 'https://www.franceinfo.fr',
  },
  {
    id: 'lemonde',
    name: 'Le Monde',
    url: 'https://www.lemonde.fr/rss/une.xml',
    domain: 'lemonde.fr',
    color: '#1e293b',
    trust: 'reference',
    scope: 'fr',
    sourceUrl: 'https://www.lemonde.fr',
  },

  // ---------- International ----------
  {
    id: 'rfi',
    name: 'RFI',
    url: 'https://www.rfi.fr/fr/rss',
    domain: 'rfi.fr',
    color: '#dc2626',
    trust: 'institutionnel',
    scope: 'monde',
    sourceUrl: 'https://www.rfi.fr',
  },
  {
    id: 'france24',
    name: 'France 24',
    url: 'https://www.france24.com/fr/rss',
    domain: 'france24.com',
    color: '#0284c7',
    trust: 'institutionnel',
    scope: 'monde',
    sourceUrl: 'https://www.france24.com',
  },
]

/** Pondération de la collecte : on veut un feed majoritairement calédonien. */
export const SCOPE_QUOTA = { nc: 0.6, fr: 0.25, monde: 0.15 }

/** Ressources pédagogiques proposées après une action (bouton « En savoir plus »). */
export const TIPS_URLS = [
  'https://www.clemi.fr',
  'https://www.educnum.fr',
  'https://www.lemonde.fr/les-decodeurs/',
  'https://www.hoaxbuster.com',
]

export const getSource = (id) => SOURCES.find((s) => s.id === id)
