import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import posts, { remediationPosts } from '../data/posts'
import Navbar from './Navbar'
import PostCard from './PostCard'
import NotificationBanner from './NotificationBanner'

const LEVEL_MESSAGES = {
  2: {
    title: 'Niveau 2 débloqué',
    subtitle: 'Les signaux se font plus subtils — sources qui ressemblent à des vraies, dates vagues, émotions plausibles.',
  },
  3: {
    title: 'Niveau 3 débloqué',
    subtitle: 'Niveau expert — vraie source, vraie image, vrais faits… mais contexte manipulé.',
  },
}

export default function Feed() {
  const contentRef = useRef(null)

  const [currentLevel, setCurrentLevel] = useState(1)
  const [levelTransition, setLevelTransition] = useState(false)
  const [postQueue, setPostQueue] = useState(() => posts.filter((p) => p.level === 1))
  const [queueIdx, setQueueIdx] = useState(0)
  const [levelDoneCount, setLevelDoneCount] = useState(0)
  const [action, setAction] = useState(null)
  const [score, setScore] = useState(0)
  const [followers, setFollowers] = useState(1200)
  const [errorsPerBias, setErrorsPerBias] = useState({})
  const [biasRemediationAdded, setBiasRemediationAdded] = useState(new Set())
  const [history, setHistory] = useState([])
  const [timerActive, setTimerActive] = useState(true)
  const [notificationVisible, setNotificationVisible] = useState(false)

  const levelPosts = posts.filter((p) => p.level === currentLevel)
  const isAllDone = currentLevel > 3
  const currentPost = !isAllDone && !levelTransition ? postQueue[queueIdx] : null

  const levelProgress =
    levelPosts.length > 0 ? Math.min(levelDoneCount / levelPosts.length, 1) : 0

  const isCorrect =
    action !== null && currentPost !== null
      ? action === currentPost.correctAction
      : false

  function handleAction(type) {
    if (action !== null) return
    const delta = currentPost.scores[type]
    setScore((prev) => prev + delta)
    setFollowers((prev) => Math.max(0, prev + delta * 2))

    if (type !== currentPost.correctAction && !currentPost.isRemediation) {
      const biais = currentPost.biais
      const newCount = (errorsPerBias[biais] || 0) + 1
      const newErrors = { ...errorsPerBias, [biais]: newCount }
      setErrorsPerBias(newErrors)

      if (newCount === 2 && !biasRemediationAdded.has(biais) && remediationPosts[biais]) {
        const newQueue = [...postQueue]
        newQueue.splice(queueIdx + 1, 0, remediationPosts[biais])
        setPostQueue(newQueue)
        setBiasRemediationAdded((prev) => new Set([...prev, biais]))
      }
    }

    setAction(type)
    setTimerActive(false)
    setNotificationVisible(true)
  }

  function handleTimerExpire() {
    if (action === null) handleAction('ignore')
  }

  function handleDismiss() {
    setNotificationVisible(false)
    handleNext()
  }

  function handleNext() {
    if (contentRef.current) contentRef.current.scrollTop = 0

    if (currentPost) {
      setHistory((prev) => [currentPost, ...prev])
    }

    setAction(null)
    const nextIdx = queueIdx + 1

    let newLevelDoneCount = levelDoneCount
    if (!currentPost?.isRemediation) {
      newLevelDoneCount = levelDoneCount + 1
      setLevelDoneCount(newLevelDoneCount)
    }

    if (nextIdx >= postQueue.length) {
      if (newLevelDoneCount >= levelPosts.length) {
        if (currentLevel < 3) {
          setLevelTransition(true)
          setHistory([])
        } else {
          setCurrentLevel(4)
          setHistory([])
        }
      }
      return
    }

    setQueueIdx(nextIdx)
    setTimerActive(true)
  }

  function handleLevelUnlock() {
    const nextLevel = currentLevel + 1
    setCurrentLevel(nextLevel)
    setLevelTransition(false)
    setPostQueue(posts.filter((p) => p.level === nextLevel))
    setQueueIdx(0)
    setLevelDoneCount(0)
    setBiasRemediationAdded(new Set())
    setHistory([])
    setAction(null)
    setTimerActive(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleLearnMore(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const actionsDisabled = action !== null || notificationVisible

  return (
    <div className="relative flex flex-col w-full h-full">
      <Navbar
        score={score}
        followers={followers}
        progress={levelProgress}
        alias="TuVérifies"
        currentLevel={Math.min(currentLevel, 3)}
        levelDoneCount={levelDoneCount}
        levelTotal={levelPosts.length}
      />

      <NotificationBanner
        visible={notificationVisible}
        isCorrect={isCorrect}
        post={currentPost}
        action={action}
        onDismiss={handleDismiss}
        onLearnMore={handleLearnMore}
      />

      <div ref={contentRef} className="flex-1 overflow-y-auto no-scrollbar">
        {isAllDone ? (
          <div className="text-center py-12 px-6">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Mission terminée !</h2>
            <p className="text-zinc-600 mb-1">
              Score final :{' '}
              <span className="font-bold text-brand-blue">{score} pts</span>
            </p>
            <p className="text-zinc-600">
              Abonnés :{' '}
              <span className="font-bold">{followers.toLocaleString('fr-FR')}</span>
            </p>
          </div>
        ) : levelTransition ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mx-4 mt-8 p-6 border border-zinc-200 bg-white shadow-sm text-center flex flex-col gap-4"
          >
            <p className="text-4xl">🔓</p>
            <h2 className="text-xl font-bold text-zinc-900">
              {LEVEL_MESSAGES[currentLevel + 1]?.title}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {LEVEL_MESSAGES[currentLevel + 1]?.subtitle}
            </p>
            <div className="text-xs text-zinc-400">
              Score actuel :{' '}
              <span className="font-semibold text-zinc-600">
                {score >= 0 ? '+' : ''}
                {score} pts
              </span>
            </div>
            <button
              onClick={handleLevelUnlock}
              className="w-full py-3 bg-zinc-900 text-white font-semibold text-sm active:scale-95 transition"
            >
              Continuer →
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Active post — slides in from below */}
            <AnimatePresence mode="popLayout">
              {currentPost && (
                <motion.div
                  key={`post-${currentPost.id}-${queueIdx}`}
                  initial={{ y: 64, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {currentPost.isRemediation && (
                    <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 font-medium">
                      Entraînement ciblé — reconnaître ce biais
                    </div>
                  )}
                  <PostCard
                    post={currentPost}
                    isActive
                    timerActive={timerActive}
                    onTimerComplete={handleTimerExpire}
                    onAction={handleAction}
                    disabled={actionsDisabled}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Past posts — faded, non-interactive, visible below active card */}
            {history.slice(0, 5).map((post, i) => (
              <div
                key={`past-${post.id}-${i}`}
                className="pointer-events-none select-none"
                style={{ opacity: Math.max(0.08, 0.38 - i * 0.08) }}
              >
                <PostCard post={post} isActive={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
