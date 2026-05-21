export default function ActionBar({ onAction, disabled }) {
  return (
    <div className="flex gap-2 w-full max-w-sm mx-auto mt-4">
      <button
        onClick={() => onAction('share')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl bg-brand-blue hover:opacity-90 active:scale-95 text-brand-cream font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        Partager
      </button>
      <button
        onClick={() => onAction('ignore')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl border-2 border-brand-blue text-brand-blue dark:border-brand-cream dark:text-brand-cream active:scale-95 font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        Ignorer
      </button>
      <button
        onClick={() => onAction('report')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl bg-brand-magenta hover:opacity-90 active:scale-95 text-brand-cream font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        Signaler
      </button>
    </div>
  )
}
