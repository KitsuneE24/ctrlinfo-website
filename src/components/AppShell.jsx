import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AppHeader from './AppHeader'
import Compagnon from './Compagnon'
import ExitGamePrompt from './ExitGamePrompt'
import GameStart from './GameStart'
import TabBar from './TabBar'
import { ExitGuardContext } from '../state/exitGuard'
import { signalerAuCompagnon } from '../state/compagnonSignaux'
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
 * départ**. Il dit la règle, la durée, ce qu'on va faire, et où la progression
 * est gardée. C'est le seul endroit où les règles sont dites : les répéter dans
 * un tutoriel revenait à ne les lire nulle part.
 *
 * Rien ne barre l'entrée d'un jeu : il n'y a ni compte ni inscription.
 *
 * Le même écran se rouvre en cours de partie par le bouton de l'en-tête. Il
 * annonce alors « Reprendre », et la partie n'est pas relancée : elle est
 * seulement mise en pause le temps de la relecture.
 */
export default function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const gameId = gameOfPath(pathname)
  const jeu = useJeu(gameId)
  const { chargement: jeuxEnCours } = useJeux()

  const [lancee, setLancee] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const [relecture, setRelecture] = useState(false)
  const [exitTo, setExitTo] = useState(null)
  const [finished, setFinished] = useState(false)

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans son seuil.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setLancee(false)
    setRelecture(false)
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
  const marquerFini = useCallback(() => {
    setFinished(true)
    signalerAuCompagnon('finPartie')
  }, [])

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

  // Il n'y a plus de partie à clore côté serveur : la progression a été écrite
  // au fil des décisions, il ne reste qu'à s'en aller.
  const confirmExit = useCallback(() => {
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
                  paused: !demarree || departVisible,
                  runKey: demarree ? 'play' : 'idle',
                  onFinished: marquerFini,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* L'écran de départ vit dans la zone de l'écran, pas par-dessus
              toute l'application : la barre d'onglets reste atteignable, et
              qui change d'avis n'est pas coincé. */}
          <AnimatePresence>
            {departVisible && (
              <GameStart
                key="start"
                jeu={jeu}
                reprise={lancee}
                onStart={commencer}
              />
            )}
          </AnimatePresence>

          {/* Le compagnon vit dans la zone de l'écran, au-dessus du contenu et
              en dessous du seuil de jeu. Il y est posé une fois pour toutes :
              changer d'écran ne le fait pas disparaître, il continue sa
              balade. Pendant une partie, il s'assoit sur le côté. */}
          <Compagnon enJeu={enPartie && !departVisible} />
        </div>

        <TabBar />

        <AnimatePresence>
          {exitTo !== null && (
            <ExitGamePrompt
              key="exit"
              onConfirm={confirmExit}
              onCancel={() => setExitTo(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </ExitGuardContext.Provider>
  )
}
