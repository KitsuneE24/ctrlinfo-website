import FondMolten from './FondMolten'

export default function Banniere({ className, children }) {
  return (
    <section className={`banniere${className ? ` ${className}` : ''}`}>
      <FondMolten className="banniere__fx" />

      <div className="banniere__contenu">{children}</div>
    </section>
  )
}
