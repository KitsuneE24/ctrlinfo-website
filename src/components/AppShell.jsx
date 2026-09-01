import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import AppHeader from './AppHeader'
import GameTutorial from './GameTutorial'
import TabBar from './TabBar'
import { useJeu } from '../state/jeux'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import { PATHS, pageTitle } from '../routes'

/**
 * Coque de l'application : en-tête, écran de la route en cours, barre
 * d'onglets. Les règles du fil vivent ici, et l'état « en pause » descend à
 * l'écran par le contexte de l'`<Outlet />`.
 */
export default function AppShell() {
  const feedGame = useJeu('feed')

  const { pathname } = useLocation()

  const onFeed = pathname === PATHS.feed

  const openingRules = (path) =>
    path === PATHS.feed && !dejaVu('tuto:feed') ? { auto: true } : null

  // Calculé dès le premier rendu : arriver directement sur /fil doit aussi
  // ouvrir les règles.
  const [tutorial, setTutorial] = useState(() => openingRules(pathname))
  const [lastPath, setLastPath] = useState(pathname)

  // Ajusté pendant le rendu, pas dans un effet : sinon l'écran s'affiche une
  // fois sans les règles.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setTutorial(openingRules(pathname))
  }

  useEffect(() => {
    document.title = pageTitle(pathname)
  }, [pathname])

  const showRules = useCallback(() => setTutorial({ auto: false }), [])

  const closeTutorial = useCallback(() => {
    marquerVu('tuto:feed')
    setTutorial(null)
  }, [])

  return (
    <div className="app">
      <AppHeader onFeed={onFeed} onShowRules={showRules} />

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
            {/* `runKey` remonte le fil à la fermeture des règles d'ouverture :
                la partie démarre à neuf, pas au milieu. */}
            <Outlet
              context={{
                paused: tutorial !== null,
                runKey: tutorial?.auto ? 'rules' : 'game',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar />

      <AnimatePresence>
        {onFeed && tutorial && feedGame && (
          <GameTutorial jeu={feedGame} onClose={closeTutorial} />
        )}
      </AnimatePresence>
    </div>
  )
}
