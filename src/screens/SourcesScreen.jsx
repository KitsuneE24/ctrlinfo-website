import { useMemo, useState } from 'react'
import { ExternalLink, Search, X } from 'lucide-react'
import sources, { CATEGORIES } from '../data/resources'
import { correspond } from '../lib/search'
import Page from '../components/ui/Page'

/**
 * Page « Sources » : une recherche, des filtres, puis les résultats.
 *
 * La recherche tolère les accents et les fautes : « deco » ramène « Les
 * Décodeurs » (voir src/lib/search.js).
 */
export default function SourcesScreen() {
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Tout')

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
    [query, categorie]
  )

  return (
    <Page title="Sources" subtitle="Où vérifier une information">
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
          {CATEGORIES.map((c) => (
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
