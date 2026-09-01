import { useMemo, useState } from 'react'
import { ExternalLink, Search, X } from 'lucide-react'
import { getCategories, getRessources } from '../api/contenu'
import { correspond } from '../lib/search'
import { useRessource } from '../lib/useRessource'
import ResourcesTabs from '../components/ResourcesTabs'
import Page from '../components/ui/Page'
import { Chargement, ErreurChargement } from '../components/ui/Chargement'

/**
 * Page « Sources » : une recherche, des filtres, puis les résultats.
 *
 * La recherche tolère les accents et les fautes : « deco » ramène « Les
 * Décodeurs » (voir src/lib/search.js).
 */
/** Les deux listes arrivent ensemble : un seul état de chargement à gérer. */
const chargerSources = () =>
  Promise.all([getRessources(), getCategories()]).then(([ressources, categories]) => ({
    ressources,
    categories,
  }))

export default function SourcesScreen() {
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Tout')
  const { donnees, chargement, erreur, recharger } = useRessource(chargerSources, [])

  const sources = useMemo(() => donnees?.ressources ?? [], [donnees])
  const categories = useMemo(() => donnees?.categories ?? ['Tout'], [donnees])

  const results = useMemo(
    () =>
      sources.filter((s) => {
        const matchCategorie = categorie === 'Tout' || s.categorie === categorie
        const matchQuery = correspond(
          query,
          `${s.titre} ${s.editeur} ${s.description} ${s.categorie}`
        )
        return matchCategorie && matchQuery
      }),
    [sources, query, categorie]
  )

  if (erreur) {
    return (
      <Page title="Ressources" subtitle="Où vérifier une information">
        <ResourcesTabs />
        <ErreurChargement erreur={erreur} onReessayer={recharger} />
      </Page>
    )
  }

  if (chargement) {
    return (
      <Page title="Ressources" subtitle="Où vérifier une information">
        <ResourcesTabs />
        <Chargement quoi="les sources" />
      </Page>
    )
  }

  return (
    <Page title="Ressources" subtitle="Où vérifier une information">
      <ResourcesTabs />

      <div className="sources__controls">
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une source"
            aria-label="Rechercher une source"
            className="search-field__input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filters no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategorie(c)}
              className={`filter${c === categorie ? ' filter--active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="source-list">
        {results.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source"
            >
              <span className="source__badge" style={{ background: s.color }}>
                {s.titre[0]}
              </span>
              <span className="source__text">
                <span className="source__line">
                  <span className="source__title">{s.titre}</span>
                  <ExternalLink size={13} />
                </span>
                <span className="source__editor">{s.editeur}</span>
                <span className="source__desc">{s.description}</span>
              </span>
            </a>
          </li>
        ))}

        {results.length === 0 && (
          <li className="empty-result">
            <p className="empty-result__title">Aucun résultat</p>
            <p className="empty-result__text">
              Essaie un autre mot-clé ou change de filtre.
            </p>
          </li>
        )}
      </ul>
    </Page>
  )
}
