import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { NAV_ITEMS } from './navItems'
import games from '../data/games'

/**
 * Le survol n'ouvre le menu que là où il existe vraiment. Sur un écran
 * tactile, `mouseenter` est simulé au moment du toucher : sans ce garde-fou,
 * le menu s'ouvrirait puis se refermerait aussitôt au clic.
 */
const survolPossible =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover)').matches === true

/**
 * Navigation principale : une barre horizontale d'icônes, logée dans l'en-tête.
 * Elle est identique sur téléphone et sur grand écran — il n'y a plus ni rail
 * latéral ni barre du bas.
 *
 * L'onglet « Jeux » porte les deux gestes sans les confondre : le clic sur la
 * manette mène droit à la galerie — c'est « Tous les jeux » —, le survol
 * déplie la liste pour lancer un jeu précis sans passer par elle. Le menu ne
 * répète donc pas la galerie : elle est sur l'icône.
 */
export default function TopNav({ tab, jeu, onNavigate }) {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const groupeRef = useRef(null)

  // Le menu se referme au clic à côté et à la touche Échap — on ne veut pas
  // qu'il reste ouvert par-dessus l'écran qu'on vient d'atteindre.
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

  // Le survol porte sur tout le groupe, bouton et menu réunis : le menu est
  // collé sous le bouton, la souris passe de l'un à l'autre sans le fermer.
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
                  {games.map(({ id: jeuId, Icon: JeuIcon, titre, accroche }) => (
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
