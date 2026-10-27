import { NavLink } from 'react-router'
import { PATHS } from '../routes'
import { useAvatar } from '../state/useAvatar'
import { useExitGuard } from '../state/exitGuard'
import { AvatarJoueur } from './AvatarPicker'
import { TAB_ITEMS } from './navItems'

export default function TabBar() {
  const { requestExit } = useExitGuard()

  const avatar = useAvatar()

  return (
    <nav aria-label="Navigation principale" className="tab-bar">
      <div className="tab-bar__list">
        {TAB_ITEMS.map(({ id, path, Icon, label }) => (
          <NavLink
            key={id}
            to={path}
            end={path === PATHS.home}
            onClick={(event) => {
              if (!requestExit(path)) event.preventDefault()
            }}
            className={({ isActive }) =>
              `tab-bar__button${isActive ? ' tab-bar__button--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {id === 'profile' && avatar ? (
                  <AvatarJoueur avatar={avatar} taille={32} />
                ) : (
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.9} />
                )}
                <span className="tab-bar__label">{label}</span>
                <span className="tab-bar__dot" aria-hidden="true" />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
