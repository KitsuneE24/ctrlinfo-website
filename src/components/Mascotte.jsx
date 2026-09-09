import { CircleCheck, Eye, TriangleAlert } from 'lucide-react'

/**
 * Le cagou, qui commente la partie.
 *
 * Trois expressions, une par situation : il félicite, il alerte, il montre.
 * Les trois dessins ne sont pas encore livrés — en attendant, le logotype tient
 * le rôle et l'expression est portée par la pastille et la couleur de l'anneau.
 * Le jour où les dessins arrivent, seul `SOURCES` change.
 */
const EXPRESSIONS = {
  content: { Icon: CircleCheck, libelle: 'Le cagou est content' },
  inquiet: { Icon: TriangleAlert, libelle: 'Le cagou est inquiet' },
  curieux: { Icon: Eye, libelle: 'Le cagou observe' },
}

export default function Mascotte({ expression = 'curieux', taille = 64 }) {
  const { Icon, libelle } = EXPRESSIONS[expression] ?? EXPRESSIONS.curieux

  return (
    <span
      role="img"
      aria-label={libelle}
      style={{ width: taille, height: taille }}
      className={`cagou cagou--${expression}`}
    >
      <img src="/logo-ctrl-info.png" alt="" className="cagou__image" />
      <span className="cagou__humeur">
        <Icon size={Math.round(taille * 0.32)} strokeWidth={2.4} />
      </span>
    </span>
  )
}
