import { forwardRef } from 'react'

/**
 * Gabarit commun à tous les écrans : une zone défilante contenant la colonne
 * de contenu. Par défaut la colonne est bord à bord.
 *
 * - `feed`     : colonne centrée et bornée, avec des interstices entre cartes.
 * - `fill`     : la colonne prend toute la hauteur, pour les écrans qui gèrent
 *   eux-mêmes leur mise en page interne.
 * - `seamless` : les blocs s'enchaînent sans filet de séparation.
 */
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
    </div>
  )
})

export default Page
