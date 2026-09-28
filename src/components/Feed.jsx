import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, GraduationCap, ArrowRight } from 'lucide-react'
import { getNiveaux, getRemediations, getTirage } from '../api/contenu'
import { lireInterets } from '../lib/interests'
import {
  dejaVus,
  finirLeFil,
  niveauDeDepart,
  noterDecision,
  noterNiveau,
} from '../state/progression'
import { useAutreJeu } from '../state/jeux'
import Page from './ui/Page'
import { Chargement, ErreurChargement } from './ui/Chargement'
import FeedStats from './FeedStats'
import PostCard from './PostCard'
import FeedbackModal from './FeedbackModal'
import { signalerAuCompagnon } from '../state/compagnonSignaux'

export default function Feed({ onSwitch, onFinished, paused = false }) {
  // Proposé à l'arrivée, pour ne pas laisser le joueur sur un écran final.
  const suite = useAutreJeu('feed')

  // Les règles des niveaux — taille du tirage, durée du chrono, texte de
  // transition. Elles étaient écrites ici ; elles viennent de l'API.
  const [niveaux, setNiveaux] = useState({})

  // Le niveau retenu par le navigateur : un joueur qui revient ne recommence
  // pas au premier sous prétexte qu'il a fermé l'onglet.
  const [currentLevel, setCurrentLevel] = useState(niveauDeDepart)
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

  // La file vide dit « ça charge » : la fonction ne touche à rien avant le
  // tirage, et l'appelant la vide avant de relancer.
  const chargerNiveau = useCallback(
    (level) =>
      getTirage(level, { themes: lireInterets(), vus: dejaVus() })
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
    // Relu du magasin : l'effet ne doit pas dépendre de `currentLevel`, sinon le
    // passage au niveau suivant tirerait deux fois.
    chargerNiveau(niveauDeDepart())
    // Les remédiations sont peu nombreuses : on les prend une fois pour toutes.
    getRemediations()
      .then(setRemediations)
      .catch(() => setRemediations({}))
    getNiveaux()
      .then((liste) => setNiveaux(Object.fromEntries(liste.map((n) => [n.level, n]))))
      .catch(() => setNiveaux({}))
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
  function handleAction(type) {
    if (action !== null) return

    // Le compagnon suit la partie : il ne relève ni une bonne réponse isolée
    // ni une erreur isolée, mais il compte les séries.
    signalerAuCompagnon(
      type === currentPost.correctAction ? 'bonneReponse' : 'mauvaiseReponse'
    )

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

    // La décision est retenue tout de suite : points, biais, et le fait que
    // cette publication a été traitée — elle sera écartée des prochains
    // tirages. Les points sont ceux que le contenu porte, donc exactement ceux
    // que le serveur comptait. Une publication de remédiation n'est pas notée :
    // elle entraîne, elle ne juge pas.
    if (!currentPost.isRemediation) {
      noterDecision({
        slug: currentPost.slug,
        biais: currentPost.biais,
        juste: type === currentPost.correctAction,
        points: currentPost.scores?.[type] ?? 0,
      })
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
          // Le niveau est acquis dès qu'il est bouclé, pas au clic sur
          // « Continuer » : qui s'en va devant l'écran de transition a bel et
          // bien fini ce niveau, et ne doit pas le rejouer.
          noterNiveau(currentLevel + 1)
          setLevelTransition(true)
        } else {
          setCurrentLevel(4)
          onFinished?.()
          finirLeFil()
        }
      }
      return
    }

    setQueueIdx(nextIdx)
    setTimerActive(true)
    affichee.current = Date.now()
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
            <h2 className="outcome__title">{niveaux[currentLevel + 1]?.titre}</h2>
            <p className="outcome__note">{niveaux[currentLevel + 1]?.sousTitre}</p>
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
              progress={levelProgress}
              currentLevel={Math.min(currentLevel, 3)}
              levelDoneCount={levelDoneCount}
              levelTotal={levelTotal}
              // Une publication, un décompte : la clé le remonte.
              timerKey={`${currentLevel}:${queueIdx}`}
              // Le chrono s'arrête tant que les règles sont à l'écran.
              timerActive={timerActive && !paused}
              timerSecondes={niveaux[currentLevel]?.dureeSecondes ?? null}
              onTimerComplete={handleTimerExpire}
            />


            {/* Une publication à la fois. Le fil continu affichait tout le
                niveau d'un coup, estompé : on lisait la suite au lieu de
                décider de celle-ci. */}
            {currentPost && (
              <motion.div
                key={`${currentPost.id}-${queueIdx}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                {currentPost.isRemediation && (
                  <p className="remediation">
                    <GraduationCap size={15} strokeWidth={2} />
                    Entraînement ciblé — reconnaître ce biais
                  </p>
                )}
                <PostCard
                  post={currentPost}
                  isActive
                  onAction={handleAction}
                  disabled={actionsDisabled}
                  selectedAction={action}
                />
              </motion.div>
            )}
          </>
        )}
      </Page>
    </div>
  )
}
