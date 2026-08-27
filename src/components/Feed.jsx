import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, GraduationCap, ArrowRight } from 'lucide-react'
import { getRemediations, getTirage } from '../api/contenu'
import { auMieux, enregistrerDecision, sauvegarder, terminerSession } from '../api/progression'
import { useSessionJeu } from '../lib/useSessionJeu'
import { useAutreJeu } from '../state/jeux'
import Page from './ui/Page'
import { Chargement, ErreurChargement } from './ui/Chargement'
import FeedStats from './FeedStats'
import PostCard from './PostCard'
import FeedbackModal from './FeedbackModal'

/** Le nombre de publications d'un niveau. Le serveur tire dans tout le vivier. */
const PAR_NIVEAU = 5

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

export default function Feed({ onSwitch, enPause = false }) {
  // Proposé à l'arrivée, pour ne pas laisser le joueur sur un écran final.
  const suite = useAutreJeu('feed')

  const activeRef = useRef(null)
  // La publication déjà amenée en haut. On la compare plutôt que de compter
  // les rendus : React monte les effets deux fois en développement.
  const dernierScrollRef = useRef(null)
  const statsRef = useRef(null)

  // Hauteur du bandeau collé en haut, qui sert de marge de défilement.
  const [statsHeight, setStatsHeight] = useState(0)

  const [currentLevel, setCurrentLevel] = useState(1)
  const [levelTransition, setLevelTransition] = useState(false)
  const [postQueue, setPostQueue] = useState([])
  const [queueIdx, setQueueIdx] = useState(0)
  const [levelDoneCount, setLevelDoneCount] = useState(0)
  const [action, setAction] = useState(null)
  const [errorsPerBias, setErrorsPerBias] = useState({})
  const [biasRemediationAdded, setBiasRemediationAdded] = useState(new Set())
  const [timerActive, setTimerActive] = useState(true)
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  // Le contenu vient du serveur : deux états de plus qu'avant.
  const [erreur, setErreur] = useState(null)
  const [remediations, setRemediations] = useState({})

  // Le moment où la publication en cours s'est affichée, pour mesurer le temps
  // de décision — la vraie donnée intéressante du jeu.
  const affichee = useRef(0)

  // Pas de partie tant que les règles d'ouverture sont à l'écran : le fil sera
  // remonté à leur fermeture, et une partie vide resterait en base.
  const sessionId = useSessionJeu({ jeu: 'feed', level: 1, actif: !enPause })

  /**
   * Un niveau, tiré au sort par le serveur.
   *
   * C'est le changement de fond par rapport au fil d'origine : le niveau
   * n'était que « les publications marquées level: 2 », toujours les mêmes
   * dans le même ordre. Le serveur pioche maintenant dans tout le vivier —
   * publications écrites à la main et publications fabriquées à partir des
   * flux — en écartant celles que ce joueur a déjà traitées.
   *
   * La fonction ne touche à aucun état avant la réponse : la file vide suffit
   * à dire « ça charge », et l'appelant la vide avant de relancer.
   */
  const chargerNiveau = useCallback(
    (level) =>
      getTirage(level, PAR_NIVEAU)
        .then((tirage) => {
          setPostQueue(tirage)
          setQueueIdx(0)
          setLevelDoneCount(0)
          setBiasRemediationAdded(new Set())
          setAction(null)
          setTimerActive(true)
          setErreur(null)
          affichee.current = Date.now()
        })
        .catch(setErreur),
    []
  )

  useEffect(() => {
    chargerNiveau(1)
    // Les remédiations sont peu nombreuses : on les prend une fois pour toutes.
    getRemediations()
      .then(setRemediations)
      .catch(() => setRemediations({}))
  }, [chargerNiveau])

  // Pas de drapeau de chargement : tant que la file est vide et qu'aucune
  // erreur n'est remontée, c'est que le tirage est en route.
  const chargement = postQueue.length === 0 && erreur === null
  const isAllDone = currentLevel > 3
  const currentPost = !isAllDone && !levelTransition ? postQueue[queueIdx] : null

  // Le total du niveau est la taille du tirage : les publications de
  // remédiation s'y ajoutent sans compter dans l'avancement.
  const levelTotal = postQueue.filter((post) => !post.isRemediation).length

  const levelProgress = levelTotal > 0 ? Math.min(levelDoneCount / levelTotal, 1) : 0

  const isCorrect =
    action !== null && currentPost !== null
      ? action === currentPost.correctAction
      : false

  // Mesuré plutôt que codé en dur : la hauteur change avec la largeur de
  // l'écran. L'observateur émet un premier appel dès l'observation.
  useEffect(() => {
    const el = statsRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setStatsHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Le fil est continu : on amène la publication en cours en haut de l'écran.
  // La toute première y est déjà, la déplacer enfoncerait son en-tête sous le
  // bandeau.
  useEffect(() => {
    const cle = `${currentLevel}:${queueIdx}`
    const premiere = dernierScrollRef.current === null
    if (dernierScrollRef.current === cle) return
    dernierScrollRef.current = cle
    if (premiere) return
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [queueIdx, currentLevel])

  function handleAction(type) {
    if (action !== null) return

    if (type !== currentPost.correctAction && !currentPost.isRemediation) {
      const biais = currentPost.biais
      const newCount = (errorsPerBias[biais] || 0) + 1
      setErrorsPerBias({ ...errorsPerBias, [biais]: newCount })

      if (newCount === 2 && !biasRemediationAdded.has(biais) && remediations[biais]) {
        const newQueue = [...postQueue]
        newQueue.splice(queueIdx + 1, 0, remediations[biais])
        setPostQueue(newQueue)
        setBiasRemediationAdded((prev) => new Set([...prev, biais]))
      }
    }

    // La décision part au serveur : c'est lui qui tranche, compte le score et
    // retient que cette publication a été vue — elle ne reviendra pas dans les
    // prochains tirages de ce joueur.
    if (sessionId) {
      auMieux(
        enregistrerDecision(sessionId, {
          postId: currentPost.id,
          action: type,
          tempsMs: Date.now() - affichee.current,
        })
      )
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
      if (newLevelDoneCount >= levelTotal) {
        if (currentLevel < 3) {
          setLevelTransition(true)
        } else {
          setCurrentLevel(4)
          if (sessionId) auMieux(terminerSession(sessionId))
        }
      }
      return
    }

    setQueueIdx(nextIdx)
    setTimerActive(true)
    affichee.current = Date.now()

    // Sauvegarde : où on en est, et de quoi reprendre le fil tel quel.
    if (sessionId) {
      auMieux(
        sauvegarder(sessionId, {
          etape: nextIdx,
          etat: {
            level: currentLevel,
            queueIdx: nextIdx,
            slugs: postQueue.map((post) => post.slug),
            errorsPerBias,
          },
        })
      )
    }
  }

  function handleLevelUnlock() {
    const nextLevel = currentLevel + 1
    setCurrentLevel(nextLevel)
    setLevelTransition(false)
    // Vider la file, c'est afficher le chargement le temps du tirage suivant.
    setPostQueue([])
    chargerNiveau(nextLevel)
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
        {erreur ? (
          <ErreurChargement erreur={erreur} onReessayer={() => chargerNiveau(currentLevel)} />
        ) : chargement ? (
          <Chargement quoi="le fil" />
        ) : isAllDone ? (
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
            {suite && (
              <div className="outcome__action">
                <button
                  type="button"
                  onClick={() => onSwitch(suite.id)}
                  className="button"
                >
                  Enchaîner sur «&nbsp;{suite.titre}&nbsp;»
                  <ArrowRight size={16} strokeWidth={2.2} />
                </button>
              </div>
            )}
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
            {/* Fin de niveau : le moment où l'on propose l'autre jeu. */}
            <div className="outcome__action">
              <button type="button" onClick={handleLevelUnlock} className="button">
                Continuer
              </button>
              {suite && (
                <button
                  type="button"
                  onClick={() => onSwitch(suite.id)}
                  className="button button--ghost"
                >
                  Changer de jeu&nbsp;: «&nbsp;{suite.titre}&nbsp;»
                </button>
              )}
            </div>
          </motion.section>
        ) : (
          <>
            <FeedStats
              ref={statsRef}
              progress={levelProgress}
              currentLevel={Math.min(currentLevel, 3)}
              levelDoneCount={levelDoneCount}
              levelTotal={levelTotal}
              // Une publication, un décompte : la clé le remonte.
              timerKey={`${currentLevel}:${queueIdx}`}
              // Le chrono s'arrête tant que les règles sont à l'écran.
              timerActive={timerActive && !enPause}
              onTimerComplete={handleTimerExpire}
            />


            {/* Fil continu : tout le niveau est là dès le départ. Seule la
                publication en cours est interactive, les autres s'estompent. */}
            {postQueue.map((post, i) => {
              const isActive = i === queueIdx
              return (
                <div
                  key={`${post.id}-${i}`}
                  ref={isActive ? activeRef : null}
                  style={{
                    opacity: opacityFor(i - queueIdx),
                    // Marge respectée par scrollIntoView.
                    scrollMarginTop: statsHeight + 12,
                  }}
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
