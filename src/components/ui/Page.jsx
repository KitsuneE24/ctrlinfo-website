import { forwardRef } from 'react'

/**
 * Gabarit commun à tous les écrans : une zone défilante (`.page`) contenant la
 * colonne de contenu. Il n'y a pas de barre supérieure — le titre de l'écran
 * vit dans la colonne, avec le reste du contenu.
 *
 * Par défaut la colonne est bord à bord, sans marge ni gouttière.
 *
 * - `feed` : mise en page du fil d'actualité — colonne centrée, bornée en
 *   largeur, avec des interstices entre les cartes. Le seul écran concerné.
 * - `fill` : la colonne prend toute la hauteur, pour les écrans qui gèrent
 *   eux-mêmes leur mise en page interne (la messagerie et ses deux volets).
 */
const Page = forwardRef(function Page({ title, subtitle, feed, fill, children }, ref) {
  const modifiers = [feed && 'page__column--feed', fill && 'page__column--fill']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={ref} className="page no-scrollbar">
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
