/**
 * Le panneau que le cagou tient : l'image sert de cadre, le texte se pose dans
 * le blanc.
 *
 * Les proportions viennent de l'image (carrée) : le conteneur en garde le
 * rapport, et les bords du texte sont donnés en pourcentage de celle-ci. Le
 * dessin peut être remplacé sans toucher au code tant que le panneau reste au
 * même endroit.
 */
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
