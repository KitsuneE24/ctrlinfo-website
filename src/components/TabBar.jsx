import { NavLink } from 'react-router'
import { PATHS } from '../routes'
import { TAB_ITEMS } from './navItems'

/**
 * La barre d'onglets, collée en bas de l'écran — sur téléphone comme sur
 * ordinateur. C'est la seule navigation du site.
 *
 * Cinq entrées, dans l'ordre du parcours : on arrive (accueil), on joue (fil,
 * conversations), on lit (ressources), et on regarde où on en est (profil).
 *
 * Ce sont des liens, pas des boutons : on peut les ouvrir dans un nouvel
 * onglet, les copier, et le navigateur sait où l'on est. `NavLink` donne
 * l'état actif et `aria-current` sans que rien n'ait à le calculer.
 *
 * L'onglet actif se lit deux fois : la couleur et le point sous l'icône. La
 * couleur seule ne suffirait pas.
 */
export default function TabBar() {
  return (
    <nav aria-label="Navigation principale" className="tab-bar">
      <div className="tab-bar__list">
        {TAB_ITEMS.map(({ id, path, Icon, label, color, filled }) => (
          <NavLink
            key={id}
            to={path}
            // L'accueil est le seul dont le chemin préfixe tous les autres :
            // sans `end`, il resterait actif partout.
            end={path === PATHS.home}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              `tab-bar__button${isActive ? ' tab-bar__button--active' : ''}`
            }
            style={({ isActive }) => (isActive ? { color } : undefined)}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.3 : 1.7}
                  fill={isActive && filled ? 'currentColor' : 'none'}
                />
                <span className="tab-bar__label">{label}</span>
                {/* Point d'état, pour les icônes qu'on ne remplit pas. */}
                <span className="tab-bar__dot" />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
