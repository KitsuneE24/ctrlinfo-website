import { Link, NavLink } from 'react-router'
import { useExitGuard } from '../state/exitGuard'
import { PATHS } from '../routes'
import { useAvatar } from '../state/useAvatar'
import { useProgression } from '../state/useProgression'
import { AvatarJoueur } from './AvatarPicker'
import { NAV_BUREAU } from './navItems'

export default function AppHeader() {
  const { pseudo } = useProgression()
  const avatar = useAvatar()
  const { requestExit } = useExitGuard()

  const garder = (path) => (event) => {
    if (!requestExit(path)) event.preventDefault()
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          to={PATHS.home}
          onClick={garder(PATHS.home)}
          aria-label="CTRL INFO — retour à l'accueil"
          className="app-header__home"
        >
          <img
            src="/logo-ctrl-info-detoure.png"
            alt=""
            className="app-header__logo"
          />
          <span className="app-header__name">CTRL INFO</span>
        </Link>

        <nav aria-label="Navigation principale" className="app-header__nav">
          {NAV_BUREAU.map(({ id, path, label }) => (
            <NavLink
              key={id}
              to={path}
              end={path === PATHS.home}
              onClick={garder(path)}
              className={({ isActive }) =>
                `app-header__lien${isActive ? ' app-header__lien--actif' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__actions">
          <NavLink
            to={PATHS.profile}
            onClick={garder(PATHS.profile)}
            aria-label={pseudo ? `Profil de ${pseudo}` : 'Profil'}
            title={pseudo || 'Profil'}
            className={({ isActive }) =>
              `app-header__avatar${isActive ? ' app-header__avatar--actif' : ''}`
            }
          >
            <AvatarJoueur avatar={avatar} taille={50} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
