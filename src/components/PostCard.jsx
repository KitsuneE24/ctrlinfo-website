import { Share2, Flag, ThumbsUp, CheckCircle, Globe, MoreHorizontal } from 'lucide-react'
import TimerBar from './TimerBar'

export default function PostCard({
  post,
  isActive,
  timerActive,
  onTimerComplete,
  onAction,
  disabled,
}) {
  const initial = post.source[0]?.toUpperCase() || '?'

  return (
    <div className="w-full bg-white border border-gray-200 overflow-hidden shadow-sm">
      {/* Timer bar — pinned at very top */}
      {isActive && (
        <TimerBar active={timerActive} onComplete={onTimerComplete} />
      )}

      {/* Header row */}
      <div className="px-3 pt-3 pb-2 flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: post.sourceColor }}
          >
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-gray-900 leading-tight">{post.source}</span>
              <CheckCircle size={14} className="text-blue-500 shrink-0" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
              <span>{post.date}</span>
              <span>·</span>
              <Globe size={11} />
            </div>
          </div>
        </div>
        <MoreHorizontal size={20} className="text-gray-400 mt-0.5 shrink-0" />
      </div>

      {/* Caption text */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-800 leading-relaxed">{post.texte}</p>
      </div>

      {/* Image */}
      <img src={post.image} alt="" className="w-full aspect-video object-cover" />

      {/* Article preview below image */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
          {post.domain || post.source}
        </p>
        <p className="text-sm font-bold text-gray-900 leading-snug">
          {post.titre}
        </p>
      </div>

      {/* Reaction count row */}
      <div className="px-3 py-1.5 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>👍</span>
          <span>😮</span>
          <span className="ml-0.5">{(post.reactionCount ?? 1222).toLocaleString('fr-FR')}</span>
        </div>
        <span className="text-xs text-gray-400">
          {(post.commentCount ?? 638).toLocaleString('fr-FR')} commentaires
        </span>
      </div>

      {/* Action buttons — active post only */}
      {isActive && (
        <div className="border-t border-gray-200 flex">
          <button
            onClick={() => onAction('share')}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <ThumbsUp size={17} strokeWidth={2} />
            J'aime
          </button>
          <button
            onClick={() => onAction('share')}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition border-l border-r border-gray-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Share2 size={17} strokeWidth={2} />
            Partager
          </button>
          <button
            onClick={() => onAction('report')}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            <Flag size={17} strokeWidth={2} />
            Signaler
          </button>
        </div>
      )}
    </div>
  )
}
