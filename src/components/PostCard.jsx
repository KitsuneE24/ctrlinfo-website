import { Share2, Flag } from 'lucide-react'
import TimerBar from './TimerBar'

export default function PostCard({
  post,
  isActive,
  timerActive,
  onTimerComplete,
  onAction,
  disabled,
}) {
  return (
    <div className="w-full bg-white border border-zinc-200 overflow-hidden shadow-sm">
      {/* Timer bar — very top of the card, before the image */}
      {isActive && (
        <TimerBar active={timerActive} onComplete={onTimerComplete} />
      )}

      {/* Image */}
      <img
        src={post.image}
        alt=""
        className="w-full aspect-video object-cover"
      />

      {/* Post content — below image */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 text-white shrink-0"
            style={{ backgroundColor: post.sourceColor }}
          >
            {post.source}
          </span>
          <span className="text-xs text-zinc-400 truncate">{post.date}</span>
        </div>
        <h2 className="text-base font-semibold text-zinc-900 mb-2 leading-snug">
          {post.titre}
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {post.texte}
        </p>
      </div>

      {/* Action icon buttons — active post only */}
      {isActive && (
        <div className="border-t border-zinc-100 px-4 py-3 flex gap-2">
          <button
            onClick={() => onAction('share')}
            disabled={disabled}
            className="flex items-center gap-2 flex-1 justify-center py-2.5 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
          >
            <Share2 size={18} strokeWidth={2} />
            Partager
          </button>
          <button
            onClick={() => onAction('report')}
            disabled={disabled}
            className="flex items-center gap-2 flex-1 justify-center py-2.5 border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition text-sm font-medium disabled:opacity-40 disabled:pointer-events-none"
          >
            <Flag size={18} strokeWidth={2} />
            Signaler
          </button>
        </div>
      )}
    </div>
  )
}
