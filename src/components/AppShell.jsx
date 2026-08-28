import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import AppHeader from './AppHeader'
import GameTutorial from './GameTutorial'
import TabBar from './TabBar'
import Feed from './Feed'
import { useJeu } from '../state/jeux'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import HomeScreen from '../screens/HomeScreen'
import LearnScreen from '../screens/LearnScreen'
import ChatScreen from '../screens/ChatScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SourcesScreen from '../screens/SourcesScreen'

/**
 * Coque de l'application : l'en-tête, l'écran en cours, la barre d'onglets du
 * bas, et le bouton « Sources » par-dessus.
 *
 * Il n'y a plus de galerie de jeux ni d'onglet « Jeux » : chaque jeu a son
 * propre onglet dans la barre du bas, au même rang que le reste du site. Un
 * onglet, un écran — la navigation ne cache plus rien.
 *
 * Les sources gardent leur bouton flottant plutôt qu'un onglet : c'est un
 * outil qu'on ouvre par-dessus ce qu'on est en train de faire, pas une
 * destination.
 *
 * Le tutoriel du fil vit ici : il s'ouvre tout seul à la première partie, et
 * par le bouton « Règles du jeu » à tout moment.
 */
export default function AppShell() {
  // Le jeu du fil vient de l'API : au premier rendu il n'est pas là, et le
  // tutoriel n'a rien à montrer. Il s'ouvrira dès qu'il sera arrivé.
  const jeuDuFil = useJeu('feed')

  const [tab, setTab] = useState('home')
  // D'où l'on venait avant d'ouvrir les sources, pour y revenir.
  const [avantSources, setAvantSources] = useState(null)
  // { auto } — le tutoriel du fil, et s'il s'est ouvert de lui-même.
  const [tuto, setTuto] = useState(null)

  const navigate = useCallback((prochainOnglet) => {
    setTab(prochainOnglet)
    setAvantSources(null)
    // Arriver sur le fil, c'est peut-être commencer par ses règles.
    setTuto(prochainOnglet === 'feed' && !dejaVu('tuto:feed') ? { auto: true } : null)
  }, [])

  const revoirRegles = useCallback(() => setTuto({ auto: false }), [])

  const fermerTuto = useCallback(() => {
    marquerVu('tuto:feed')
    setTuto(null)
  }, [])

  const basculerSources = useCallback(() => {
    if (tab === 'sources') {
      setTab(avantSources ?? 'home')
      setAvantSources(null)
      return
    }
    setAvantSources(tab)
    setTab('sources')
  }, [tab, avantSources])

  const surSources = tab === 'sources'

  return (
    <div className="app">
      <AppHeader tab={tab} onNavigate={navigate} onRevoirRegles={revoirRegles} />

      <div className="app__main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="app__screen"
          >
            {tab === 'home' && <HomeScreen onNavigate={navigate} />}
            {tab === 'feed' && (
              // La clé remonte le fil à la fermeture des règles d'ouverture :
              // la partie démarre à neuf, pas au milieu.
              <Feed
                key={tuto?.auto ? 'regles' : 'partie'}
                onSwitch={navigate}
                enPause={tuto !== null}
              />
            )}
            {tab === 'chat' && <ChatScreen />}
            {tab === 'learn' && <LearnScreen onNavigate={navigate} />}
            {tab === 'profil' && <ProfileScreen onNavigate={navigate} />}
            {tab === 'sources' && <SourcesScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar tab={surSources ? avantSources : tab} onNavigate={navigate} />

      {/* Sur les conversations, le bouton descend se poser sur le champ de
          saisie barré. */}
      <button
        type="button"
        onClick={basculerSources}
        aria-label={surSources ? 'Fermer les sources' : 'Ouvrir les sources'}
        className={`sources-fab${tab === 'chat' ? ' sources-fab--sur-champ' : ''}`}
      >
        {surSources ? (
          <X size={20} strokeWidth={2.2} />
        ) : (
          <BookOpen size={20} strokeWidth={2} />
        )}
        <span className="sources-fab__label">
          {surSources ? 'Fermer' : 'Sources'}
        </span>
      </button>

      <AnimatePresence>
        {tab === 'feed' && tuto && jeuDuFil && (
          <GameTutorial jeu={jeuDuFil} onClose={fermerTuto} />
        )}
      </AnimatePresence>
    </div>
  )
}
