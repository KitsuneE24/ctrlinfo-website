import { forwardRef } from 'react'
import { Link } from 'react-router'
import { PATHS } from '../../routes'

// Variantes : `feed` (colonne centrée), `fill` (pleine hauteur, sans pied de page), `seamless` (sans filet).
const Page = forwardRef(function Page(
  { title, subtitle, feed, fill, seamless, children },
  ref
) {
  const modifiers = [
    feed && 'page__column--feed',
    fill && 'page__column--fill',
    seamless && 'page__column--seamless',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className={`page no-scrollbar${fill ? ' page--fill' : ''}`}>
      <div className={`page__column${modifiers ? ` ${modifiers}` : ''}`}>
        {title && (
          <header className="page__heading">
            <h1 className="page__title">{title}</h1>
            {subtitle && <p className="page__subtitle">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
      {!fill && (
        <footer className="pied-de-page">
          <span>© {new Date().getFullYear()} CTRL INFO</span>
          <Link to={PATHS.legal}>Mentions légales</Link>
        </footer>
      )}
    </div>
  )
})

export default Page
