export default function FeedbackPopup({ post, action, onNext }) {
  const isCorrect = action === post.correctAction
  const scoreDelta = post.scores[action]

  return (
    <div
      className={`w-full max-w-sm mx-auto rounded-2xl p-6 text-brand-cream ${
        isCorrect ? 'bg-brand-blue' : 'bg-brand-magenta'
      }`}
    >
      <p className="text-2xl font-bold mb-1">
        {isCorrect ? 'Bon réflexe !' : 'Attention !'}
      </p>
      <p className="text-lg font-semibold mb-5">
        {scoreDelta >= 0 ? '+' : ''}{scoreDelta} points
      </p>

      <div className="bg-brand-cream/20 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
          Biais détecté
        </p>
        <p className="font-bold">{post.biais}</p>
      </div>

      <p className="text-sm leading-relaxed mb-4">{post.explication}</p>

      <div className="bg-brand-cream/20 rounded-xl p-4 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
          Conséquence
        </p>
        <p className="text-sm leading-relaxed">{post.consequences[action]}</p>
      </div>

      <button
        onClick={onNext}
        className={`w-full py-3 bg-brand-cream font-bold rounded-xl active:scale-95 transition-transform ${
          isCorrect ? 'text-brand-blue' : 'text-brand-magenta'
        }`}
      >
        Post suivant →
      </button>
    </div>
  )
}
