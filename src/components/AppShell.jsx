import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AppHeader from './AppHeader'
import ExitGamePrompt from './ExitGamePrompt'
import GameStart from './GameStart'
import GameTutorial from './GameTutorial'
import IdentityGate from './IdentityGate'
import TabBar from './TabBar'
import { abandonnerSession, auMieux } from '../api/progression'
import { useGameRules } from '../lib/useGameRules'
import { useCompte } from '../state/compte'
import { ExitGuardContext } from '../state/exitGuard'
import { getCurrentSession } from '../state/currentSession'
import { useJeu } from '../state/jeux'
import { PATHS, pageTitle } from '../routes'

/** Le jeu qui commence à cette adresse. La boîte de réception n'en est pas un. */
const gameOfPath = (path) => {
  if (path === PATHS.feed) return 'feed'
  if (path.startsWith(`${PATHS.chats}/`)) return 'chat'
  return null
}

/** Les onglets de jeu, où l'identité se demande avant toute chose. */
const isGameTab = (path) => path === PATHS.feed || path.startsWith(PATHS.chats)

/**
 * Coque de l'application : en-tête, écran de la route en cours, barre
 * d'onglets.
 *
 * C'est aussi le seuil des jeux, et il se franchit dans cet ordre :
 *
 *   1. **l'identité** — avec un compte ou en invité, la question est posée une
 *      fois, à l'entrée de l'onglet ;
 *   2. **l'écran de départ** — avant chaque partie, la règle en une phrase et
 *      la durée. Les règles détaillées s'ouvrent par-dessus si elles n'ont
 *      jamais été lues ;
 *   3. **la partie**, qui ne démarre — et n'ouvre de session — qu'ici.
 *
 * Et une sortie : quitter un onglet en pleine partie demande confirmation.
 */
export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { connecte, invite, continuerEnInvite } = useCompte()

  const gameId = gameOfPath(pathname)
  const jeu = useJeu(gameId)
  const { aAfficher, marquerLues } = useGameRules(gameId)

  const premiereEtape = useCallback(
    (path) => {
      if (isGameTab(path) && !connecte && !invite) return 'identity'
      return gameOfPath(path) ? 'start' : 'playing'
    },
    [connecte, invite]
  )

  const [step, setStep] = useState(() => premiereEtape(pathname))
  const [lastPath, setLastPath] = useState(pathname)
  const [rulesAsked, setRulesAsked] = useState(false)
  const [rulesDone, setRulesDone] = useState(false)
  const [exitTo, setExitTo] = useState(null)
  const [finished, setFinished] = useState(false)

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans son seuil.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setStep(premiereEtape(pathname))
    setRulesAsked(false)
    setRulesDone(false)
    setExitTo(null)
    setFinished(false)
  }

  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])

  const tutorialOpen = Boolean(
    jeu && gameId && (rulesAsked || (step === 'start' && aAfficher && !rulesDone))
  )

  const showRules = useCallback(() => setRulesAsked(true), [])

  const marquerFini = useCallback(() => setFinished(true), [])

  const closeTutorial = useCallback(() => {
    marquerLues()
    setRulesAsked(false)
    setRulesDone(true)
  }, [marquerLues])

  const acceptGuest = useCallback(() => {
    continuerEnInvite()
    setStep(gameId ? 'start' : 'playing')
  }, [continuerEnInvite, gameId])

  // La sortie n'est retenue que pendant une partie en cours : une fois jouée
  // jusqu'au bout, il n'y a plus rien à perdre et la question serait de trop.
  const enPartie = step === 'playing' && gameId !== null && !finished

  const requestExit = useCallback(
    (to) => {
      if (!enPartie) return true
      setExitTo(to)
      return false
    },
    [enPartie]
  )

  const guard = useMemo(() => ({ requestExit }), [requestExit])

  const confirmExit = useCallback(() => {
    const sessionId = getCurrentSession()
    if (sessionId) auMieux(abandonnerSession(sessionId))
    const to = exitTo
    setExitTo(null)
    if (to) navigate(to)
  }, [exitTo, navigate])

  return (
    <ExitGuardContext.Provider value={guard}>
      <div className="app">
        <AppHeader onGame={Boolean(gameId)} onShowRules={showRules} />

        <div className="app__main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="app__screen"
            >
              {/* `runKey` remonte le jeu au départ de la partie : elle
                  commence à neuf, pas au milieu de l'écran d'attente. */}
              <Outlet
                context={{
                  paused: step !== 'playing' || tutorialOpen,
                  runKey: step === 'playing' ? 'play' : 'idle',
                  onFinished: marquerFini,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <TabBar />

        <AnimatePresence>
          {step === 'identity' && <IdentityGate key="identity" onGuest={acceptGuest} />}

          {step === 'start' && jeu && gameId && (
            <GameStart
              key="start"
              jeu={jeu}
              connecte={connecte}
              onStart={() => setStep('playing')}
              onRules={showRules}
            />
          )}

          {tutorialOpen && <GameTutorial key="rules" jeu={jeu} onClose={closeTutorial} />}

          {exitTo !== null && (
            <ExitGamePrompt
              key="exit"
              connecte={connecte}
              onConfirm={confirmExit}
              onCancel={() => setExitTo(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </ExitGuardContext.Provider>
  )
}
