import { TAB_ITEMS } from './navItems'

/**
 * La barre d'onglets, collée en bas de l'écran — sur téléphone comme sur
 * ordinateur. C'est la seule navigation du site.
 *
 * Cinq entrées, dans l'ordre du parcours : on arrive (accueil), on joue (fil,
 * conversations), on comprend, et on regarde où on en est (profil).
 *
 * L'onglet actif se lit deux fois : la couleur et le point sous l'icône. La
 * couleur seule ne suffirait pas.
 */
export default function TabBar({ tab, onNavigate }) {
  return (
    <nav aria-label="Navigation principale" className="tab-bar">
      <div className="tab-bar__list">
        {TAB_ITEMS.map(({ id, Icon, label, couleur, pleine }) => {
          const actif = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-label={label}
              title={label}
              aria-current={actif ? 'page' : undefined}
              className={`tab-bar__button${actif ? ' tab-bar__button--active' : ''}`}
              style={actif ? { color: couleur } : undefined}
            >
              <Icon
                size={24}
                strokeWidth={actif ? 2.3 : 1.7}
                fill={actif && pleine ? 'currentColor' : 'none'}
              />
              <span className="tab-bar__label">{label}</span>
              {/* Point d'état, pour les icônes qu'on ne remplit pas. */}
              <span className="tab-bar__dot" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
