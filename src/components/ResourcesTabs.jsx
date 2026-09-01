import { NavLink } from 'react-router'
import { PATHS } from '../routes'

/**
 * Les deux entrées de l'onglet « Ressources ».
 *
 * Le site avait deux endroits où l'on lit : « Comprendre », un onglet, et
 * « Sources », un bouton flottant. Deux noms proches, deux portes, et rien
 * pour dire ce qui les sépare. Ils sont maintenant réunis sous « Ressources » :
 *
 *   - **Comprendre** — les thèmes, ce qu'il faut savoir ;
 *   - **Vérifier** — l'annuaire, où aller quand on a un doute sur une info.
 *
 * L'un explique, l'autre sert d'outil. Dit comme ça, on sait où cliquer.
 */
export default function ResourcesTabs() {
  return (
    <nav aria-label="Ressources" className="resources-tabs">
      <NavLink
        to={PATHS.resources}
        end
        className={({ isActive }) =>
          `resources-tabs__link${isActive ? ' resources-tabs__link--active' : ''}`
        }
      >
        Comprendre
      </NavLink>
      <NavLink
        to={PATHS.verify}
        className={({ isActive }) =>
          `resources-tabs__link${isActive ? ' resources-tabs__link--active' : ''}`
        }
      >
        Vérifier une info
      </NavLink>
    </nav>
  )
}
