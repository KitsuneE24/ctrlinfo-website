import { NAV_ITEMS } from './navItems'
import Wordmark from './ui/Wordmark'

/**
 * Rail de navigation latéral (≥768px). Il s'élargit et affiche ses libellés
 * à partir de 1280px — voir `.side-nav` dans index.css.
 */
export default function SideNav({ active, onChange }) {
  return (
    <aside className="side-nav">
      <div className="side-nav__brand">
        {/* Rail étroit : le logo seul, le wordmark n'y tiendrait pas. */}
        <img src="/Logo_alerte_NC-02.png" alt="Alert NC" className="side-nav__logo" />
        <span className="side-nav__label">
          <Wordmark size={22} />
        </span>
      </div>

      <nav aria-label="Navigation principale" className="side-nav__list">
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              title={label}
              className={`side-nav__item${isActive ? ' side-nav__item--active' : ''}`}
            >
              <Icon
                size={25}
                strokeWidth={isActive ? 2.4 : 1.7}
                fill={isActive && id === 'home' ? 'currentColor' : 'none'}
              />
              <span className="side-nav__label">{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
