export default function CadreCagou({ children, className = '' }) {
  return (
    <div className={`cadre-cagou ${className}`.trim()}>
      <div className="cadre-cagou__panneau">{children}</div>
      <span
        aria-hidden="true"
        className="cadre-cagou__oiseau"
        style={{ backgroundImage: 'url(/notif-cagou.png)' }}
      />
    </div>
  )
}
