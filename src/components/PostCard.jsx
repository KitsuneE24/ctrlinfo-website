export default function PostCard({ post }) {
  return (
    <div className="w-full max-w-sm mx-auto bg-brand-cream dark:bg-zinc-900 rounded-2xl shadow-md overflow-hidden">
      <img
        src={post.image}
        alt=""
        className="w-full aspect-video object-cover"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0"
            style={{ backgroundColor: post.sourceColor }}
          >
            {post.source}
          </span>
          <span className="text-xs text-zinc-400 truncate">{post.date}</span>
        </div>
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
          {post.titre}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {post.texte}
        </p>
      </div>
    </div>
  )
}
