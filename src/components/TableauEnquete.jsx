import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Filaments from './ui/Filaments'

/**
 * Tableau d'enquête de l'accueil. Le fil rouge est mesuré à chaque
 * redimensionnement, de punaise à punaise.
 * Ordinateur : chaque pièce vers `vers`. Téléphone : pièces reliées dans l'ordre de lecture.
 * Enfants : fonction recevant `epingler`.
 * Chaque pièce : `ref={epingler(id, { vers, pointille })}`.
 */

/** Affaissement du fil, en px. */
const MOU = 38

function punaise(element, repere) {
  const boite = element.getBoundingClientRect()
  return {
    x: boite.left + boite.width / 2 - repere.left,
    y: boite.top - repere.top + 2,
  }
}

/** Largeur sous laquelle le tableau se lit en une colonne (accueil.css). */
const UNE_COLONNE = '(max-width: 899px)'

function courbe(a, b, decalage = 0) {
  const mx = (a.x + b.x) / 2 + decalage
  const my = (a.y + b.y) / 2 + (decalage ? 0 : MOU)
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

function useFilRouge() {
  const tableau = useRef(null)
  const pieces = useRef(new Map())
  const [fils, setFils] = useState({ largeur: 0, hauteur: 0, traces: [] })

  const tracer = useCallback(() => {
    const el = tableau.current
    if (!el) return
    const repere = el.getBoundingClientRect()
    const traces = []

    if (window.matchMedia?.(UNE_COLONNE).matches) {
      // Pièces visibles, dans l'ordre du document.
      const suite = [...pieces.current.entries()]
        .filter(([, { element }]) => element.offsetParent)
        .sort(([, a], [, b]) =>
          a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        )
      for (let i = 1; i < suite.length; i++) {
        const [id, piece] = suite[i]
        traces.push({
          id,
          d: courbe(
            punaise(suite[i - 1][1].element, repere),
            punaise(piece.element, repere),
            i % 2 ? 26 : -26
          ),
          pointille: Boolean(piece.pointille),
        })
      }
      setFils({ largeur: repere.width, hauteur: repere.height, traces })
      return
    }

    for (const [id, { element, vers, pointille }] of pieces.current) {
      const cible = vers && pieces.current.get(vers)
      // Pièce masquée : pas de fil.
      if (!cible || !element.offsetParent || !cible.element.offsetParent) continue
      traces.push({
        id,
        d: courbe(punaise(element, repere), punaise(cible.element, repere)),
        pointille: Boolean(pointille),
      })
    }

    setFils({ largeur: repere.width, hauteur: repere.height, traces })
  }, [])

  useLayoutEffect(() => {
    const el = tableau.current
    if (!el) return undefined

    tracer()
    // Retrace une fois les polices chargées.
    document.fonts?.ready.then(tracer).catch(() => {})

    if (typeof ResizeObserver === 'undefined') return undefined
    const observateur = new ResizeObserver(tracer)
    observateur.observe(el)
    return () => observateur.disconnect()
  }, [tracer])

  const epingler = useCallback(
    (id, options = {}) =>
      (element) => {
        if (element) pieces.current.set(id, { element, ...options })
        else pieces.current.delete(id)
      },
    []
  )

  return { tableau, epingler, fils }
}

/** Le liège, le fil et les pièces. */
export default function TableauEnquete({ children }) {
  const { tableau, epingler, fils } = useFilRouge()

  return (
    <div ref={tableau} className="tableau">
      <Filaments forme="swirl" tourne className="tableau__filaments" />

      <svg
        aria-hidden="true"
        className="tableau__fils"
        width={fils.largeur}
        height={fils.hauteur}
        viewBox={`0 0 ${fils.largeur || 1} ${fils.hauteur || 1}`}
      >
        {fils.traces.map(({ id, d, pointille }) => (
          <path key={id} d={d} strokeDasharray={pointille ? '6 6' : undefined} />
        ))}
      </svg>

      {children(epingler)}
    </div>
  )
}
