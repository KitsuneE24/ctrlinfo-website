import { headerGradient } from '../styles/colors'

export default function Navbar({
  score,
  followers,
  progress,
  alias,
  currentLevel,
  levelDoneCount,
  levelTotal,
}) {
  return (
    <nav
      className="sticky top-0 z-10 text-brand-cream px-4 pt-3 pb-3"
      style={{ background: headerGradient }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wide text-brand-cream">Alert NC</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-cream/25 text-brand-cream leading-none">
            Niv.&nbsp;{currentLevel}
          </span>
        </div>
        <span className="text-xs text-brand-cream/70">@{alias}</span>
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-semibold">
          {score >= 0 ? '+' : ''}{score}&nbsp;pts
        </span>
        <span className="text-brand-cream/70 text-xs">
          {levelDoneCount}/{levelTotal} posts
        </span>
        <span className="text-brand-cream/80">
          {followers.toLocaleString('fr-FR')}&nbsp;abonnés
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
