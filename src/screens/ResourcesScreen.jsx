import { useMemo, useState } from 'react'
import { Search, ExternalLink, X } from 'lucide-react'
import resources, { CATEGORIES } from '../data/resources'
import Page from '../components/ui/Page'

/**
 * Onglet « Ressources » : une recherche, des filtres, puis les résultats.
 */
export default function ResourcesScreen() {
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Tout')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter((r) => {
      const matchCategorie = categorie === 'Tout' || r.categorie === categorie
      const matchQuery =
        q === '' ||
        `${r.titre} ${r.editeur} ${r.description} ${r.categorie}`
          .toLowerCase()
          .includes(q)
      return matchCategorie && matchQuery
    })
  }, [query, categorie])

  return (
    <Page title="Ressources" subtitle="Où vérifier une information">
      <div className="resources__controls">
        <div className="search-field">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une ressource"
            aria-label="Rechercher une ressource"
            className="search-field__input"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche">
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

      <ul className="resource-list">
        {results.map((r) => (
          <li key={r.id} className="card">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource"
            >
              <span className="resource__badge" style={{ background: r.color }}>
                {r.titre[0]}
              </span>
              <span className="resource__text">
                <span className="resource__line">
                  <span className="resource__title">{r.titre}</span>
                  <ExternalLink size={13} />
                </span>
                <span className="resource__editor">{r.editeur}</span>
                <span className="resource__desc">{r.description}</span>
              </span>
            </a>
          </li>
        ))}

        {results.length === 0 && (
          <li className="card empty-result">
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
