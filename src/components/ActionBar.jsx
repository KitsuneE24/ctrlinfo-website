export default function ActionBar({ onAction, disabled }) {
  return (
    <div className="flex gap-2 w-full mt-3">
      <button
        onClick={() => onAction('share')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
      >
        Partager
      </button>
      <button
        onClick={() => onAction('ignore')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-50 text-sm font-medium active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
      >
        Ignorer
      </button>
      <button
        onClick={() => onAction('report')}
        disabled={disabled}
        className="flex-1 py-3 rounded-xl border border-red-300 bg-white text-red-500 hover:bg-red-50 text-sm font-medium active:scale-95 transition disabled:opacity-40 disabled:pointer-events-none"
      >
        Signaler
      </button>
    </div>
  )
}
