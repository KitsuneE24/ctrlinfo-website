import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AppHeader from './AppHeader'
import ExitGamePrompt from './ExitGamePrompt'
import GameStart from './GameStart'
import GameTutorial from './GameTutorial'
import TabBar from './TabBar'
import { abandonnerSession, auMieux } from '../api/progression'
import { useCompte } from '../state/compte'
import { ExitGuardContext } from '../state/exitGuard'
import { getCurrentSession } from '../state/currentSession'
import { useJeu, useJeux } from '../state/jeux'
import { PATHS, pageTitle } from '../routes'

/** Le jeu qui commence à cette adresse. La boîte de réception n'en est pas un. */
const gameOfPath = (path) => {
  if (path === PATHS.feed) return 'feed'
  if (path.startsWith(`${PATHS.chats}/`)) return 'chat'
  return null
}

/**
 * Coque de l'application : en-tête, écran de la route en cours, barre
 * d'onglets.
 *
 * C'est aussi le seuil des jeux, et il tient en un écran : **l'écran de
 * départ**. Il dit la règle, la durée, ce qu'on va faire, et rappelle qu'on
 * joue sans compte quand c'est le cas. Le tutoriel détaillé n'est plus imposé
 * — il s'ouvre depuis là, à la demande.
 *
 * Rien ne barre l'entrée d'un jeu : jouer sans compte se fait d'un trait.
 *
 * Le même écran se rouvre en cours de partie par le bouton de l'en-tête. Il
 * annonce alors « Reprendre », et la partie n'est pas relancée : elle est
 * seulement mise en pause le temps de la relecture.
 */
export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { connecte } = useCompte()

  const gameId = gameOfPath(pathname)
  const jeu = useJeu(gameId)
  const { chargement: jeuxEnCours } = useJeux()

  const [lancee, setLancee] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const [relecture, setRelecture] = useState(false)
  const [tutoriel, setTutoriel] = useState(false)
  const [exitTo, setExitTo] = useState(null)
  const [finished, setFinished] = useState(false)

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans son seuil.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setLancee(false)
    setRelecture(false)
    setTutoriel(false)
    setExitTo(null)
    setFinished(false)
  }

  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])

  // Sans la description du jeu, on ne sait rien annoncer : on laisse passer, et
  // l'écran affichera sa propre erreur de chargement.
  const jeuEnPlace = Boolean(gameId && jeu)
  const enAttente = Boolean(gameId) && jeuxEnCours
  const seuil = jeuEnPlace && !lancee

  const departVisible = jeuEnPlace && (seuil || relecture)
  const demarree = !gameId || (!seuil && !enAttente)

  const commencer = useCallback(() => {
    setLancee(true)
    setRelecture(false)
  }, [])

  const revoirLeDepart = useCallback(() => setRelecture(true), [])
  const marquerFini = useCallback(() => setFinished(true), [])

  // La sortie n'est retenue que pendant une partie en cours : une fois jouée
  // jusqu'au bout, il n'y a plus rien à perdre et la question serait de trop.
  const enPartie = demarree && gameId !== null && !finished

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
        <AppHeader onGame={Boolean(gameId)} onShowRules={revoirLeDepart} />

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
              {/* `runKey` ne change qu'au premier départ : rouvrir l'écran en
                  cours de partie met en pause, il ne relance pas. */}
              <Outlet
                context={{
                  paused: !demarree || departVisible || tutoriel,
                  runKey: demarree ? 'play' : 'idle',
                  onFinished: marquerFini,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <TabBar />

        <AnimatePresence>
          {departVisible && (
            <GameStart
              key="start"
              jeu={jeu}
              connecte={connecte}
              reprise={lancee}
              onStart={commencer}
              onRules={() => setTutoriel(true)}
            />
          )}

          {tutoriel && jeu && (
            <GameTutorial key="rules" jeu={jeu} onClose={() => setTutoriel(false)} />
          )}

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
