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
 * Coque de l'application : l'en-tête, l'écran en cours, la barre d'onglets du
 * bas.
 *
 * L'écran affiché n'est plus choisi ici : c'est le routeur qui le pose dans
 * l'`<Outlet />`. La coque ne garde que ce qui l'entoure et ce qui survit d'un
 * écran à l'autre.
 *
 * Le tutoriel du fil vit ici : il s'ouvre tout seul à la première arrivée sur
 * le fil, et par le bouton « Règles du jeu » à tout moment. Le fil, lui, a
 * besoin de savoir qu'il est en pause tant que les règles sont à l'écran —
 * c'est ce que la coque lui passe par le contexte de l'`<Outlet />`.
 *
 * Le bouton flottant « Sources » a disparu : l'annuaire est devenu la rangée
 * de stories de l'accueil et le sous-onglet « Vérifier » de Ressources. Un
 * bouton qui suivait le visiteur partout n'était utile qu'à cause de sa
 * mauvaise place.
 */
export default function AppShell() {
  // Le jeu du fil vient de l'API : au premier rendu il n'est pas là, et le
  // tutoriel n'a rien à montrer. Il s'ouvrira dès qu'il sera arrivé.
  const feedGame = useJeu('feed')

  const { pathname } = useLocation()

  const onFeed = pathname === PATHS.feed

  /** Les règles s'ouvrent d'elles-mêmes à la première partie, et là seulement. */
  const openingRules = (path) =>
    path === PATHS.feed && !dejaVu('tuto:feed') ? { auto: true } : null

  // { auto } — le tutoriel du fil, et s'il s'est ouvert de lui-même. Il est
  // calculé dès le premier rendu : arriver directement sur /fil, par un lien
  // ou un favori, doit ouvrir les règles comme n'importe quelle autre arrivée.
  const [tutorial, setTutorial] = useState(() => openingRules(pathname))
  const [lastPath, setLastPath] = useState(pathname)

  // Changer d'adresse rejoue la question : les règles s'ouvrent en arrivant
  // sur le fil, et se referment en le quittant. Ajusté pendant le rendu plutôt
  // que dans un effet — sinon l'écran s'affiche une fois sans elles.
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setTutorial(openingRules(pathname))
  }

  // Le titre de l'onglet du navigateur suit l'adresse : c'est ce qui rend
  // l'historique lisible, et une page mise en favori reconnaissable.
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
