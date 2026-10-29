// Sans `nombre` : un simple point.
export default function PastilleNonLus({ visible = true, nombre, className = '' }) {
  if (!visible || nombre === 0) return null
  const chiffre = nombre !== undefined
  return (
    <span className={`pastille-non-lus${chiffre ? ' pastille-non-lus--chiffre' : ''} ${className}`}>
      {chiffre && <span aria-hidden="true">{nombre}</span>}
      <span className="pastille-non-lus__texte">
        {chiffre ? `${nombre} conversation${nombre > 1 ? 's' : ''} non lue${nombre > 1 ? 's' : ''}` : 'Non lu'}
      </span>
    </span>
  )
}
