import FondMolten from './FondMolten'

/** Bandeau de tête (accueil, Comprendre) avec le métal en fusion en fond. */
export default function Banniere({ className, children }) {
  return (
    <section className={`banniere${className ? ` ${className}` : ''}`}>
      <FondMolten className="banniere__fx" />

      <div className="banniere__contenu">{children}</div>
    </section>
  )
}
