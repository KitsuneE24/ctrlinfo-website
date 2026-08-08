import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import AppHeader from './AppHeader'
import GameTutorial from './GameTutorial'
import TabBar from './TabBar'
import games from '../data/games'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import HomeScreen from '../screens/HomeScreen'
import GameScreen from '../screens/GameScreen'
import SourcesScreen from '../screens/SourcesScreen'

/**
 * Coque de l'application : l'en-tête, l'écran en cours, la barre d'onglets du
 * bas, et le bouton « Sources » par-dessus.
 *
 * Les deux navigations sont toujours rendues, le CSS décide laquelle se
 * montre. Elles partagent le même état et les mêmes données (navItems.js).
 *
 * Le tutoriel d'un jeu vit ici : il s'ouvre tout seul à la première partie, et
 * par le bouton « Règles du jeu » à tout moment.
 */
export default function AppShell() {
  const [tab, setTab] = useState('home')
  // Le jeu en cours, pour que le menu de l'en-tête puisse en lancer un depuis
  // n'importe quel onglet.
  const [jeu, setJeu] = useState(null)
  // D'où l'on venait avant d'ouvrir les sources, pour y revenir.
  const [avantSources, setAvantSources] = useState(null)
  // { id, auto } — le tutoriel ouvert, et s'il s'est ouvert de lui-même.
  const [tuto, setTuto] = useState(null)

  // Ouvrir un jeu, c'est aussi décider s'il commence par ses règles.
  const ouvrirJeu = useCallback((id) => {
    setJeu(id)
    setTuto(id && !dejaVu(`tuto:${id}`) ? { id, auto: true } : null)
  }, [])

  const navigate = useCallback(
    (prochainOnglet, prochainJeu = null) => {
      setTab(prochainOnglet)
      setAvantSources(null)
      if (prochainOnglet === 'game') ouvrirJeu(prochainJeu)
    },
    [ouvrirJeu]
  )

  const revoirRegles = useCallback(() => {
    if (jeu) setTuto({ id: jeu, auto: false })
  }, [jeu])

  const fermerTuto = useCallback(() => {
    marquerVu(`tuto:${tuto.id}`)
    setTuto(null)
  }, [tuto])

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
  const jeuDuTuto = games.find(({ id }) => id === tuto?.id)

  return (
    <div className="app">
      <AppHeader tab={tab} jeu={jeu} onNavigate={navigate} />

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
            {tab === 'home' && <HomeScreen />}
            {tab === 'game' && (
              <GameScreen
                jeu={jeu}
                onSelect={ouvrirJeu}
                onRevoirRegles={revoirRegles}
                // Le jeu n'a pas commencé : ses règles sont à l'écran.
                enAttente={tuto?.auto === true}
                enPause={tuto !== null}
              />
            )}
            {tab === 'sources' && <SourcesScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar tab={tab} onNavigate={navigate} />

      {/* Ordinateur seulement : sur téléphone, les sources ont leur onglet dans
          la barre du bas. Sur les conversations, le bouton descend se poser sur
          le champ de saisie barré. */}
      <button
        type="button"
        onClick={basculerSources}
        aria-label={surSources ? 'Fermer les sources' : 'Ouvrir les sources'}
        className={`sources-fab${
          tab === 'game' && jeu === 'chat' ? ' sources-fab--sur-champ' : ''
        }`}
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
        {jeuDuTuto && (
          <GameTutorial key={jeuDuTuto.id} jeu={jeuDuTuto} onClose={fermerTuto} />
        )}
      </AnimatePresence>
    </div>
  )
}
