import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, GraduationCap } from 'lucide-react'
import posts, { remediationPosts } from '../data/posts.index'
import Page from './ui/Page'
import FeedStats from './FeedStats'
import PostCard from './PostCard'
import FeedbackModal from './FeedbackModal'

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

/** Opacité d'une publication selon sa distance à celle en cours. */
function opacityFor(distance) {
  if (distance === 0) return 1
  return Math.max(0.18, 0.42 - (Math.abs(distance) - 1) * 0.06)
}

export default function Feed() {
  const activeRef = useRef(null)
  const firstRenderRef = useRef(true)

  const [currentLevel, setCurrentLevel] = useState(1)
  const [levelTransition, setLevelTransition] = useState(false)
  const [postQueue, setPostQueue] = useState(() => posts.filter((p) => p.level === 1))
  const [queueIdx, setQueueIdx] = useState(0)
  const [levelDoneCount, setLevelDoneCount] = useState(0)
  const [action, setAction] = useState(null)
  const [errorsPerBias, setErrorsPerBias] = useState({})
  const [biasRemediationAdded, setBiasRemediationAdded] = useState(new Set())
  const [timerActive, setTimerActive] = useState(true)
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  const levelPosts = posts.filter((p) => p.level === currentLevel)
  const isAllDone = currentLevel > 3
  const currentPost = !isAllDone && !levelTransition ? postQueue[queueIdx] : null

  const levelProgress =
    levelPosts.length > 0 ? Math.min(levelDoneCount / levelPosts.length, 1) : 0

  const isCorrect =
    action !== null && currentPost !== null
      ? action === currentPost.correctAction
      : false

  // Le fil est continu : on amène la publication en cours en haut de l'écran
  // plutôt que de remonter tout en haut du fil. On ne le fait pas au premier
  // rendu, sinon le bandeau de progression et les règles passeraient d'emblée
  // hors de l'écran.
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [queueIdx, currentLevel])

  function handleAction(type) {
    if (action !== null) return

    if (type !== currentPost.correctAction && !currentPost.isRemediation) {
      const biais = currentPost.biais
      const newCount = (errorsPerBias[biais] || 0) + 1
      setErrorsPerBias({ ...errorsPerBias, [biais]: newCount })

      if (newCount === 2 && !biasRemediationAdded.has(biais) && remediationPosts[biais]) {
        const newQueue = [...postQueue]
        newQueue.splice(queueIdx + 1, 0, remediationPosts[biais])
        setPostQueue(newQueue)
        setBiasRemediationAdded((prev) => new Set([...prev, biais]))
      }
    }

    setAction(type)
    setTimerActive(false)
    setFeedbackVisible(true)
  }

  function handleTimerExpire() {
    if (action === null) handleAction('ignore')
  }

  function handleDismiss() {
    setFeedbackVisible(false)
    handleNext()
  }

  function handleNext() {
    setAction(null)
    const nextIdx = queueIdx + 1

    let newLevelDoneCount = levelDoneCount
    if (!currentPost?.isRemediation) {
      newLevelDoneCount = levelDoneCount + 1
      setLevelDoneCount(newLevelDoneCount)
    }

    if (nextIdx >= postQueue.length) {
      if (newLevelDoneCount >= levelPosts.length) {
        if (currentLevel < 3) setLevelTransition(true)
        else setCurrentLevel(4)
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
    setAction(null)
    setTimerActive(true)
  }

  function handleLearnMore(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const actionsDisabled = action !== null || feedbackVisible

  return (
    <div className="app__screen feed">
      <FeedbackModal
        visible={feedbackVisible}
        isCorrect={isCorrect}
        post={currentPost}
        action={action}
        onDismiss={handleDismiss}
        onLearnMore={handleLearnMore}
      />

      <Page feed>
        {isAllDone ? (
          <section className="card outcome">
            <span className="outcome__badge">
              <Trophy size={34} strokeWidth={1.8} />
            </span>
            <h2 className="outcome__title">Mission terminée&nbsp;!</h2>
            <p className="outcome__note">
              Tu as traité les trois niveaux. Ce que tu retiens des explications
              compte davantage qu'un score — retourne dans le fil quand tu veux
              refaire l'exercice.
            </p>
          </section>
        ) : levelTransition ? (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="card outcome"
          >
            <span className="outcome__badge outcome__badge--small">
              <Sparkles size={24} strokeWidth={2} />
            </span>
            <h2 className="outcome__title">
              {LEVEL_MESSAGES[currentLevel + 1]?.title}
            </h2>
            <p className="outcome__note">
              {LEVEL_MESSAGES[currentLevel + 1]?.subtitle}
            </p>
            <div className="outcome__action">
              <button type="button" onClick={handleLevelUnlock} className="button">
                Continuer
              </button>
            </div>
          </motion.section>
        ) : (
          <>
            <FeedStats
              progress={levelProgress}
              currentLevel={Math.min(currentLevel, 3)}
              levelDoneCount={levelDoneCount}
              levelTotal={levelPosts.length}
            />


            {/*
              Fil continu : toutes les publications du niveau sont là dès le
              départ. Seule celle en cours est à pleine opacité et reste
              interactive ; les autres s'estompent avec la distance.
            */}
            {postQueue.map((post, i) => {
              const isActive = i === queueIdx
              return (
                <div
                  key={`${post.id}-${i}`}
                  ref={isActive ? activeRef : null}
                  style={{ opacity: opacityFor(i - queueIdx) }}
                  aria-hidden={isActive ? undefined : 'true'}
                >
                  {post.isRemediation && (
                    <p className="remediation">
                      <GraduationCap size={15} strokeWidth={2} />
                      Entraînement ciblé — reconnaître ce biais
                    </p>
                  )}
                  <PostCard
                    post={post}
                    isActive={isActive}
                    timerActive={timerActive}
                    onTimerComplete={handleTimerExpire}
                    onAction={handleAction}
                    disabled={actionsDisabled}
                    selectedAction={isActive ? action : null}
                  />
                </div>
              )
            })}
          </>
        )}
      </Page>
    </div>
  )
}
