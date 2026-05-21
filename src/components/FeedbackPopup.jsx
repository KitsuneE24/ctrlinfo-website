export default function FeedbackPopup({ post, action, onNext, showBiasHint }) {
  const isCorrect = action === post.correctAction
  const scoreDelta = post.scores[action]

  return (
    <div
      className={`border p-4 flex flex-col gap-3 ${
        isCorrect
          ? 'border-green-400 bg-green-50 dark:bg-green-950'
          : 'border-red-400 bg-red-50 dark:bg-red-950'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-bold text-base ${
            isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}
        >
          {isCorrect ? 'Bon réflexe !' : 'Attention !'}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            scoreDelta >= 0
              ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {scoreDelta >= 0 ? '+' : ''}{scoreDelta} pts
        </span>
      </div>

      <p className="italic text-xs text-zinc-400">Mécanisme : {post.biais}</p>

      {showBiasHint && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700">
          <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠</span>
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-snug">
            Attention, tu rates souvent ce type de manipulation — un post d'entraînement arrive bientôt.
          </p>
        </div>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-300">{post.explication}</p>

      <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 text-sm text-zinc-600 dark:text-zinc-300">
        {post.consequences[action]}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm active:scale-95 transition"
      >
        Post suivant →
      </button>
    </div>
  )
}
