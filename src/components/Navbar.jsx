export default function Navbar({ score, followers, progress, alias, isDark, toggleDark }) {
  return (
    <nav className="sticky top-0 z-10 bg-brand-blue text-brand-cream px-4 pt-3 pb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold tracking-wide text-brand-cream">
          Alert NC
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-cream/60">@{alias}</span>
          <button
            onClick={toggleDark}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="relative w-10 h-5 rounded-full bg-brand-cream/25 hover:bg-brand-cream/40 transition-colors duration-200 shrink-0"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-brand-cream flex items-center justify-center text-[9px] transition-transform duration-300 ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {isDark ? '☽' : '☀'}
            </span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm mb-2.5">
        <span className="font-semibold">
          {score >= 0 ? '+' : ''}{score} pts
        </span>
        <span className="text-brand-cream/80">
          {followers.toLocaleString('fr-FR')} abonnés
        </span>
      </div>
      <div className="w-full bg-brand-cream/20 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-brand-cream h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        />
      </div>
    </nav>
  )
}
