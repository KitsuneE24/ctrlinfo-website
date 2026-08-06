import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SideNav from './SideNav'
import TabBar from './TabBar'
import HomeScreen from '../screens/HomeScreen'
import GameScreen from '../screens/GameScreen'
import ChatScreen from '../screens/ChatScreen'
import ResourcesScreen from '../screens/ResourcesScreen'
import DetectScreen from '../screens/DetectScreen'

/**
 * Largeur de la colonne de contenu, par écran. Un fil d'actualité se lit dans
 * une colonne étroite ; la messagerie a besoin de plus de place pour ses deux
 * volets. La valeur alimente `--content-max`, lu par `.page__column`.
 */
const SCREENS = {
  home:      { Component: HomeScreen,      contentMax: 640 },
  game:      { Component: GameScreen,      contentMax: 640 },
  chat:      { Component: ChatScreen,      contentMax: 1000 },
  resources: { Component: ResourcesScreen, contentMax: 720 },
  detect:    { Component: DetectScreen,    contentMax: 720 },
}

/**
 * Coque de l'application, mobile first.
 *
 * - Téléphone : l'app occupe tout l'écran, navigation par la barre du bas.
 * - À partir de 768px : un rail latéral remplace la barre d'onglets.
 *
 * C'est le même arbre de composants dans les deux cas : rien n'est dupliqué
 * entre « version mobile » et « version desktop ».
 */
export default function AppShell() {
  const [tab, setTab] = useState('home')

  const navigate = useCallback((next) => setTab(next), [])

  const { Component: Screen, contentMax } = SCREENS[tab]

  return (
    <div className="app">
      <SideNav active={tab} onChange={navigate} />

      <div className="app__main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="app__screen"
            style={{ '--content-max': `${contentMax}px` }}
          >
            <Screen onNavigate={navigate} />
          </motion.div>
        </AnimatePresence>

        <TabBar active={tab} onChange={navigate} />
      </div>
    </div>
  )
}
