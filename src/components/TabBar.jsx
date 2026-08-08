import { TAB_ITEMS } from './navItems'

/**
 * Barre d'onglets du bas — la navigation sur téléphone, à la manière d'un
 * réseau social. Au-delà de 768px elle cède la place à la barre horizontale de
 * l'en-tête (voir `.tab-bar` dans index.css).
 *
 * Trois onglets, jamais plus : l'accueil, les jeux, les sources. Le jeu en
 * cours ne s'y lit pas — l'onglet « Jeux » reste allumé du début à la fin
 * d'une partie, et c'est la galerie qui sert d'aiguillage entre les jeux.
 *
 * L'onglet actif prend sa couleur propre, les autres restent gris.
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