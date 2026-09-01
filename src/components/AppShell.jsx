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
import { useJeu, useJeux } from '../state/jeux'
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
 * C'est aussi le seuil des jeux, et il se franchit dans cet ordre, une porte
 * à la fois :
 *
 *   1. **l'identité** — avec un compte ou en invité. La question est posée une
 *      fois, à l'entrée de l'onglet ;
 *   2. **les règles** — elles ne s'ouvrent qu'une fois l'identité choisie,
 *      puisque c'est elle qui décide si on les remontre ;
 *   3. **l'écran de départ** — la règle en une phrase et la durée ;
 *   4. **la partie**, qui ne démarre — et n'ouvre de session — qu'ici.
 *
 * Et une sortie : quitter un onglet en pleine partie demande confirmation.
 */
export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { connecte, invite, continuerEnInvite } = useCompte()

  const gameId = gameOfPath(pathname)
  const jeu = useJeu(gameId)
  const { chargement: jeuxEnCours } = useJeux()
  const { aAfficher, pret, marquerLues } = useGameRules(gameId)

  const [franchies, setFranchies] = useState([])
  const [lastPath, setLastPath] = useState(pathname)
  const [rulesAsked, setRulesAsked] = useState(false)
  const [exitTo, setExitTo] = useState(null)
  const [finished, setFinished] = useState(false)

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans son seuil.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setFranchies([])
    setRulesAsked(false)
    setExitTo(null)
    setFinished(false)
  }

  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])

  // Les portes de cette adresse, dans l'ordre. L'identité disparaît d'elle-même
  // une fois choisie ; les deux autres se franchissent d'un geste.
  const portes = []
  if (isGameTab(pathname) && !connecte && !invite) portes.push('identity')
  // Sans le jeu, on ne sait ni quoi annoncer ni quelles règles montrer : on
  // laisse alors passer, et l'écran affichera sa propre erreur de chargement.
  if (gameId && jeu) {
    if (aAfficher) portes.push('rules')
    portes.push('start')
  }

  // Une fois la partie lancée, plus rien ne s'intercale : une réponse tardive
  // du serveur ne doit pas ouvrir un tutoriel par-dessus le jeu.
  const porte = franchies.includes('start')
    ? null
    : (portes.find((nom) => !franchies.includes(nom)) ?? null)

  const enAttente = Boolean(gameId) && (!pret || jeuxEnCours)
  const jouable = porte === null && !enAttente
  const tutorial = Boolean(jeu) && (rulesAsked || porte === 'rules')

  const franchir = useCallback(
    (nom) => setFranchies((deja) => (deja.includes(nom) ? deja : [...deja, nom])),
    []
  )

  const showRules = useCallback(() => setRulesAsked(true), [])
  const marquerFini = useCallback(() => setFinished(true), [])

  const closeTutorial = useCallback(() => {
    marquerLues()
    setRulesAsked(false)
    franchir('rules')
  }, [franchir, marquerLues])

  // La sortie n'est retenue que pendant une partie en cours : une fois jouée
  // jusqu'au bout, il n'y a plus rien à perdre et la question serait de trop.
  const enPartie = jouable && gameId !== null && !finished

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
                  paused: !jouable || tutorial,
                  runKey: jouable ? 'play' : 'idle',
                  onFinished: marquerFini,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <TabBar />

        <AnimatePresence>
          {porte === 'identity' && <IdentityGate key="identity" onGuest={continuerEnInvite} />}

          {porte === 'start' && (
            <GameStart
              key="start"
              jeu={jeu}
              connecte={connecte}
              onStart={() => franchir('start')}
              onRules={showRules}
            />
          )}

          {tutorial && <GameTutorial key="rules" jeu={jeu} onClose={closeTutorial} />}

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
