import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, GraduationCap, ArrowRight, CircleCheck, RefreshCw } from 'lucide-react'
import {
  fabriquerNouvellesPublications,
  getNiveaux,
  getRemediations,
  getTirageEtReste,
} from '../api/contenu'
import { dureePour, reglesDuNiveau } from '../lib/niveaux'
import { dejaVus, niveauDeDepart, noterDecision, noterNiveau } from '../state/progression'
import { useAutreJeu } from '../state/jeux'
import Page from './ui/Page'
import { Chargement, ErreurChargement } from './ui/Chargement'
import FeedStats from './FeedStats'
import PostCard from './PostCard'
import FeedbackModal from './FeedbackModal'
import { signalerAuCompagnon } from '../state/compagnonSignaux'
import { lienWeb } from '../lib/lienWeb'

const ANNONCE_MS = 6000

function AnnonceNiveau({ regles, suite, onFermer, onSwitch }) {
  useEffect(() => {
    const minuteur = setTimeout(onFermer, ANNONCE_MS)
    return () => clearTimeout(minuteur)
  }, [onFermer])

  return (
    <div className="palier anim-apparait" onClick={onFermer}>
      <section
        role="status"
        className="card outcome palier__carte anim-surgit"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="outcome__badge outcome__badge--small">
          <Sparkles size={22} strokeWidth={2} />
        </span>
        <h2 className="outcome__title">{regles.titre}</h2>
        <p className="outcome__note">{regles.sousTitre}</p>
        <div className="outcome__action">
          <button type="button" onClick={onFermer} className="bouton bouton--plein bouton--large">
            Continuer
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
          {suite && (
            <button type="button" onClick={() => onSwitch(suite.id)} className="bouton bouton--large">
              Changer de jeu&nbsp;: «&nbsp;{suite.titre}&nbsp;»
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

function ToutVu({ fabrication, onFabriquer, onFermer }) {
  const rien = fabrication === 'rien'
  return (
    <div className="palier anim-apparait">
      <section role="dialog" aria-modal="true" className="card outcome palier__carte anim-surgit">
        <span className="outcome__badge outcome__badge--small">
          <CircleCheck size={22} strokeWidth={2} />
        </span>
        <h2 className="outcome__title">Vous êtes à jour</h2>
        <p className="outcome__note">
          {rien
            ? 'Pas de nouveaux posts pour l’instant. Revenez demain !'
            : 'Vous avez vu tous les nouveaux posts.'}
        </p>
        <div className="outcome__action">
          {!rien && (
            <button
              type="button"
              onClick={onFabriquer}
              disabled={fabrication === 'encours'}
              className="bouton bouton--plein bouton--large"
            >
              <RefreshCw size={16} strokeWidth={2.2} />
              {fabrication === 'encours' ? 'Chargement…' : 'Continuer à jouer'}
            </button>
          )}
          <button type="button" onClick={onFermer} className="bouton bouton--large">
            Revoir les anciens posts
          </button>
        </div>
      </section>
    </div>
  )
}

export default function Feed({ onSwitch, onRegles, paused = false }) {
  const suite = useAutreJeu('feed')

  const [niveaux, setNiveaux] = useState([])
  const [currentLevel, setCurrentLevel] = useState(niveauDeDepart)
  const [annonce, setAnnonce] = useState(false)
  const [postQueue, setPostQueue] = useState([])
  const [queueIdx, setQueueIdx] = useState(0)
  const [levelDoneCount, setLevelDoneCount] = useState(0)
  const [action, setAction] = useState(null)
  const [errorsPerBias, setErrorsPerBias] = useState({})
  const [biasRemediationAdded, setBiasRemediationAdded] = useState(new Set())
  const [timerActive, setTimerActive] = useState(true)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [remediations, setRemediations] = useState({})
  const [toutVu, setToutVu] = useState(false)
  const [fabrication, setFabrication] = useState(null)
  const propose = useRef(null)

  const affichee = useRef(0)

  // File vide = chargement.
  const chargerNiveau = useCallback(
    (level) =>
      getTirageEtReste(level, { vus: dejaVus() })
        .then(({ tirage, reste, taille, plus }) => {
          if (tirage.length === 0) throw new Error('Aucun post disponible.')
          if (plus && reste < taille && propose.current !== level) {
            propose.current = level
            setFabrication(null)
            setToutVu(true)
          }
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
    chargerNiveau(niveauDeDepart())
    getRemediations()
      .then(setRemediations)
      .catch(() => setRemediations({}))
    getNiveaux()
      .then(setNiveaux)
      .catch(() => setNiveaux([]))
  }, [chargerNiveau])

  const regles = reglesDuNiveau(niveaux, currentLevel)
  const chargement = postQueue.length === 0 && erreur === null
  const currentPost = postQueue[queueIdx] ?? null

  const levelTotal = postQueue.filter((post) => !post.isRemediation).length

  const isCorrect =
    action !== null && currentPost !== null ? action === currentPost.correctAction : false

  function handleAction(type) {
    if (action !== null) return

    signalerAuCompagnon(type === currentPost.correctAction ? 'bonneReponse' : 'mauvaiseReponse')

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

    if (!currentPost?.isRemediation) setLevelDoneCount((compte) => compte + 1)

    if (nextIdx >= postQueue.length) {
      const suivant = currentLevel + 1
      noterNiveau(suivant)
      setCurrentLevel(suivant)
      setAnnonce(true)
      setPostQueue([])
      chargerNiveau(suivant)
      return
    }

    setQueueIdx(nextIdx)
    setTimerActive(true)
    affichee.current = Date.now()
  }

  const fermerAnnonce = useCallback(() => setAnnonce(false), [])

  function fabriquer() {
    setFabrication('encours')
    fabriquerNouvellesPublications(currentLevel, { vus: dejaVus() })
      .then((nombre) => {
        if (nombre === 0) return setFabrication('rien')
        setToutVu(false)
        setPostQueue([])
        chargerNiveau(currentLevel)
      })
      .catch(() => setFabrication('rien'))
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
        onLearnMore={(url) => lienWeb(url) && window.open(url, '_blank', 'noopener,noreferrer')}
      />

      {annonce && regles && !chargement && (
        <AnnonceNiveau regles={regles} suite={suite} onFermer={fermerAnnonce} onSwitch={onSwitch} />
      )}

      {toutVu && !annonce && !chargement && (
        <ToutVu fabrication={fabrication} onFabriquer={fabriquer} onFermer={() => setToutVu(false)} />
      )}

      <Page feed fill>
        {erreur ? (
          <ErreurChargement erreur={erreur} onReessayer={() => chargerNiveau(currentLevel)} />
        ) : chargement ? (
          <Chargement quoi="le fil" />
        ) : (
          <div className="fil-jeu">
            <FeedStats
              currentLevel={currentLevel}
              levelDoneCount={levelDoneCount}
              levelTotal={levelTotal}
              timerKey={`${currentLevel}:${queueIdx}`}
              timerActive={timerActive && !paused && !annonce && !toutVu}
              timerSecondes={dureePour(currentPost, regles?.dureeSecondes)}
              onTimerComplete={handleTimerExpire}
              onRegles={onRegles}
            />

            {currentPost && (
              <div className="fil-jeu__post anim-monte" key={`${currentPost.id}-${currentLevel}-${queueIdx}`}>
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
                  disabled={actionsDisabled || annonce || toutVu}
                  selectedAction={action}
                />
              </div>
            )}
          </div>
        )}
      </Page>
    </div>
  )
}
