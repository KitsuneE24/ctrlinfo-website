import { createElement, useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, GraduationCap, ArrowRight } from 'lucide-react'
import { getNiveaux, getRemediations, getTirage } from '../api/contenu'
import { icone } from '../data/icones'
import { auMieux, enregistrerDecision, sauvegarder, terminerSession } from '../api/progression'
import { lireInterets } from '../lib/interests'
import { useSessionJeu } from '../lib/useSessionJeu'
import { useAutreJeu } from '../state/jeux'
import Page from './ui/Page'
import { Chargement, ErreurChargement } from './ui/Chargement'
import FeedStats from './FeedStats'
import PostCard from './PostCard'
import FeedbackModal from './FeedbackModal'

export default function Feed({ onSwitch, onFinished, paused = false }) {
  // Proposé à l'arrivée, pour ne pas laisser le joueur sur un écran final.
  const suite = useAutreJeu('feed')

  // Les règles des niveaux — taille du tirage, durée du chrono, texte de
  // transition. Elles étaient écrites ici ; elles viennent de l'API.
  const [niveaux, setNiveaux] = useState({})

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
  // Les couronnes que cette partie vient de faire tomber. Elles arrivent avec
  // la réponse de « terminer » : c'est le seul moment où on peut les montrer.
  const [couronnes, setCouronnes] = useState([])

  // Le moment où la publication en cours s'est affichée, pour mesurer le temps
  // de décision — la vraie donnée intéressante du jeu.
  const affichee = useRef(0)

  // Pas de partie tant que les règles d'ouverture sont à l'écran : le fil sera
  // remonté à leur fermeture, et une partie vide resterait en base.
  const sessionId = useSessionJeu({ jeu: 'feed', level: 1, actif: !paused })

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
      // Les sujets choisis ordonnent le tirage ; ils ne le filtrent pas.
      getTirage(level, { themes: lireInterets() })
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
          onFinished?.()
          if (sessionId) {
            auMieux(terminerSession(sessionId)).then((fin) => setCouronnes(fin?.couronnes ?? []))
          }
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

            {/* Ce que la partie vient de faire tomber. Rien n'apparaît en mode
                invité : sans compte, rien n'est décroché. */}
            {couronnes.length > 0 && (
              <ul className="gains">
                {couronnes.map((couronne) => (
                  <li key={couronne.id} className="gain">
                    <span className="gain__picto" style={{ background: couronne.couleur }}>
                      {createElement(icone(couronne.picto), { size: 18, strokeWidth: 2 })}
                    </span>
                    <div>
                      <p className="gain__nom">{couronne.nom}</p>
                      <p className="gain__texte">{couronne.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
