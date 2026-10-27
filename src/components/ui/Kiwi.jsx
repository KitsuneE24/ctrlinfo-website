export default function Kiwi({ taille = 52, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`kiwi${className ? ` ${className}` : ''}`}
      style={{ width: taille, height: taille }}
    >
      <img src="/logo-ctrl-info.png" alt="" />
    </span>
  )
}
