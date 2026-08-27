import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import { useJeux } from '../state/jeux'

// Sur un écran tactile, `mouseenter` est simulé au toucher : sans ce
// garde-fou, le menu s'ouvrirait puis se refermerait au clic.
const survolPossible =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover)').matches === true

/**
 * Barre horizontale d'icônes, logée dans l'en-tête.
 *
 * L'onglet « Jeux » porte deux gestes : le clic mène à la galerie, le survol
 * déplie la liste des jeux. Le menu ne répète donc pas « Tous les jeux ».
 */
export default function TopNav({ tab, jeu, onNavigate }) {
  const { jeux } = useJeux()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const groupeRef = useRef(null)

  // Fermeture au clic à côté et à la touche Échap.
  useEffect(() => {
    if (!menuOuvert) return

    function surClic(event) {
      if (!groupeRef.current?.contains(event.target)) setMenuOuvert(false)
    }
    function surTouche(event) {
      if (event.key === 'Escape') setMenuOuvert(false)
    }

    document.addEventListener('pointerdown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('pointerdown', surClic)
      document.removeEventListener('keydown', surTouche)
    }
  }, [menuOuvert])

  function allerAuJeu(id) {
    setMenuOuvert(false)
    onNavigate('game', id)
  }

  // Le survol porte sur le groupe entier : la souris passe du bouton au menu
  // sans le fermer.
  const survol = survolPossible
    ? {
        onMouseEnter: () => setMenuOuvert(true),
        onMouseLeave: () => setMenuOuvert(false),
      }
    : undefined

  return (
    <nav aria-label="Navigation principale" className="top-nav">
      <div className="top-nav__list">
        {NAV_ITEMS.map(({ id, Icon, label, couleur }) => {
          const actif = tab === id
          const style = actif ? { color: couleur } : undefined

          if (id !== 'game') {
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-label={label}
                title={label}
                aria-current={actif ? 'page' : undefined}
                className={`top-nav__button${actif ? ' top-nav__button--active' : ''}`}
                style={style}
              >
                <Icon
                  size={23}
                  strokeWidth={actif ? 2.4 : 1.8}
                  fill={actif && id === 'home' ? 'currentColor' : 'none'}
                />
              </button>
            )
          }

          return (
            <div key={id} ref={groupeRef} className="top-nav__group" {...survol}>
              <button
                type="button"
                onClick={() => allerAuJeu(null)}
                aria-label={label}
                title={label}
                aria-haspopup="menu"
                aria-expanded={menuOuvert}
                aria-current={actif ? 'page' : undefined}
                className={`top-nav__button top-nav__button--menu${
                  actif ? ' top-nav__button--active' : ''
                }`}
                style={style}
              >
                <Icon size={23} strokeWidth={actif ? 2.4 : 1.8} />
                <ChevronDown
                  size={12}
                  strokeWidth={2.4}
                  className={`top-nav__chevron${
                    menuOuvert ? ' top-nav__chevron--open' : ''
                  }`}
                />
              </button>

              {menuOuvert && (
                <div role="menu" className="top-nav__menu">
                  {jeux.map(({ id: jeuId, Icon: JeuIcon, titre, accroche }) => (
                    <button
                      key={jeuId}
                      type="button"
                      role="menuitem"
                      onClick={() => allerAuJeu(jeuId)}
                      className={`top-nav__menu-item${
                        actif && jeu === jeuId ? ' top-nav__menu-item--active' : ''
                      }`}
                    >
                      <JeuIcon size={17} strokeWidth={1.9} />
                      <span className="top-nav__menu-text">
                        {titre}
                        <span className="top-nav__menu-hint">{accroche}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
