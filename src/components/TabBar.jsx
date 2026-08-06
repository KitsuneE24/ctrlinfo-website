import { NAV_ITEMS } from './navItems'

/**
 * Barre d'onglets du bas — la navigation sur téléphone. Au-delà de 768px elle
 * cède la place au rail latéral (voir `.tab-bar` dans index.css).
 */
export default function TabBar({ active, onChange }) {
  return (
    <nav aria-label="Navigation principale" className="tab-bar">
      <div className="tab-bar__list">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`tab-bar__button${isActive ? ' tab-bar__button--active' : ''}`}
            >
              <Icon
                size={25}
                strokeWidth={isActive ? 2.4 : 1.7}
                fill={isActive && id === 'home' ? 'currentColor' : 'none'}
              />
              {/* Point d'état : garde l'onglet actif lisible même pour les
                  icônes qu'on ne remplit pas. */}
              <span className="tab-bar__dot" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
