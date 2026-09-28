import { useRef } from 'react'
import { estAdmin, modifier } from '../state/contenu'

/**
 * Un texte du contenu, éditable sur place en mode administration.
 *
 * Non contrôlé volontairement : piloter la valeur pendant la frappe remettrait
 * le curseur au début à chaque touche. On ne remonte la modification qu'à la
 * sortie du champ.
 */
export default function ChampEditable({
  sur,
  cle,
  repli = '',
  balise: Balise = 'span',
  className = '',
  ...reste
}) {
  const ref = useRef(null)
  const valeur = sur?.[cle] ?? ''

  if (!estAdmin()) {
    return (
      <Balise className={className} {...reste}>
        {valeur || repli}
      </Balise>
    )
  }

  return (
    <Balise
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={cle}
      className={`${className} champ-editable`.trim()}
      // Les champs vivent souvent dans une carte cliquable : éditer ne doit pas
      // déclencher le jeu.
      onClick={(event) => event.stopPropagation()}
      onBlur={() => modifier(sur, cle, ref.current.textContent.trim())}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          ref.current.blur()
        }
        if (event.key === 'Escape') {
          ref.current.textContent = valeur
          ref.current.blur()
        }
      }}
      {...reste}
    >
      {valeur}
    </Balise>
  )
}
