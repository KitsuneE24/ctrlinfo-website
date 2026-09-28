/** Le panneau que le cagou tient : l'image sert de cadre, le texte va dedans. */
export default function CadreCagou({ children, className = '' }) {
  return (
    <div
      className={`cadre-cagou ${className}`.trim()}
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}notif-cagou.png)` }}
    >
      <div className="cadre-cagou__panneau">{children}</div>
    </div>
  )
}
