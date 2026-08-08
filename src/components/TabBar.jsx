import { TAB_ITEMS } from './navItems'

/**
 * Barre d'onglets du bas, sur téléphone. Au-delà de 768px, la barre de
 * l'en-tête prend le relais.
 *
 * Trois onglets : accueil, jeux, sources. Le jeu en cours ne s'y lit pas —
 * « Jeux » reste allumé pendant toute une partie.
 */
export default function TabBar({ tab, onNavigate }) {
  return (
    <nav aria-label="Navigation principale" className="tab-bar">
      <div className="tab-bar__list">
        {TAB_ITEMS.map(({ id, jeu: jeuCible, Icon, label, couleur }) => {
          const actif = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id, jeuCible)}
              aria-label={label}
              aria-current={actif ? 'page' : undefined}
              className={`tab-bar__button${actif ? ' tab-bar__button--active' : ''}`}
              style={actif ? { color: couleur } : undefined}
            >
              <Icon
                size={23}
                strokeWidth={actif ? 2.4 : 1.7}
                fill={actif && id === 'home' ? 'currentColor' : 'none'}
              />
              {/* Point d'état, pour les icônes qu'on ne remplit pas. */}
              <span className="tab-bar__dot" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}