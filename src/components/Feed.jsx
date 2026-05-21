import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import posts from '../data/posts'
import Navbar from './Navbar'
import PostCard from './PostCard'
import ActionBar from './ActionBar'
import FeedbackPopup from './FeedbackPopup'

const cardExitVariants = {
  visible: { opacity: 1, x: 0, y: 0 },
  exit: (actionType) => {
    if (actionType === 'share')
      return { opacity: 0, x: 300, transition: { duration: 0.25, ease: 'easeIn' } }
    if (actionType === 'ignore')
      return { opacity: 0, x: -300, transition: { duration: 0.25, ease: 'easeIn' } }
    return { opacity: 0, y: 60, transition: { duration: 0.25, ease: 'easeIn' } }
  },
}

export default function Feed({ isDark, toggleDark }) {
  const [index, setIndex] = useState(0)
  const [action, setAction] = useState(null)
  const [score, setScore] = useState(0)
  const [followers, setFollowers] = useState(1200)
  const pendingAction = useRef(null)

  const post = posts[index]
  const isFinished = index >= posts.length
  const progress = isFinished ? 1 : index / posts.length

  function handleAction(type) {
    pendingAction.current = type
    const delta = post.scores[type]
    setScore((prev) => prev + delta)
    setFollowers((prev) => Math.max(0, prev + Math.round(delta * 1.5)))
    setAction(type)
  }

  function handleNext() {
    setAction(null)
    setIndex((prev) => prev + 1)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        score={score}
        followers={followers}
        progress={progress}
        alias="citoyen42"
        isDark={isDark}
        toggleDark={toggleDark}
      />
      <div className="flex-1 px-4 py-6 overflow-hidden">
        {isFinished ? (
          <div className="w-full max-w-sm mx-auto text-center py-12">
            <p className="text-5xl mb-4">🎉</p>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Mission terminée !
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-1">
              Score final :{' '}
              <span className="font-bold text-brand-blue dark:text-brand-cream">
                {score} pts
              </span>
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Abonnés :{' '}
              <span className="font-bold">{followers.toLocaleString('fr-FR')}</span>
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={pendingAction.current}>
            {action === null ? (
              <motion.div
                key="card"
                custom={pendingAction.current}
                variants={cardExitVariants}
                initial="visible"
                animate="visible"
                exit="exit"
              >
                <PostCard post={post} />
                <ActionBar onAction={handleAction} disabled={false} />
              </motion.div>
            ) : (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <FeedbackPopup post={post} action={action} onNext={handleNext} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
