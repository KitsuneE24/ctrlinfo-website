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
 * Coque de l'application.
 *
 * Trois rangées empilées : l'en-tête, l'écran en cours, et la barre d'onglets
 * du bas. Le bouton « Sources » flotte par-dessus, en bas à droite, quel que
 * soit l'écran.
 *
 * Les deux navigations sont toujours rendues, et c'est le CSS qui décide
 * laquelle se montre : la barre horizontale de l'en-tête sur ordinateur, la
 * barre d'onglets sur téléphone. Elles partagent le même état et les mêmes
 * données (navItems.js) — il n'y a pas deux applications à tenir à jour.
 *
 * Le tutoriel d'un jeu vit ici, et non dans l'écran de jeu : il s'ouvre de deux
 * manières — tout seul à la première partie, et par le bouton « Règles du jeu »
 * de la barre du jeu à tout moment.
 */
export default function AppShell() {
  const [tab, setTab] = useState('home')
  // Le jeu en cours vit ici et non dans GameScreen : le menu déroulant de
  // l'en-tête doit pouvoir lancer un jeu directement, depuis n'importe quel
  // onglet.
  const [jeu, setJeu] = useState(null)
  // D'où l'on venait avant d'ouvrir les sources. Le bouton fait alors l'aller
  // et le retour : on les consulte sans perdre le fil de ce qu'on faisait.
  const [avantSources, setAvantSources] = useState(null)
  // { id, auto } — quel tutoriel est ouvert, et s'il s'est ouvert de lui-même.
  // La distinction compte à la fermeture, voir plus bas.
  const [tuto, setTuto] = useState(null)

  // Ouvrir un jeu, c'est aussi décider s'il commence par ses règles. La
  // question se tranche ici, au moment du choix, plutôt que dans un effet qui
  // courrait après le changement.
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
                // Le jeu n'a pas encore commencé : ses règles sont à l'écran.
                enAttente={tuto?.auto === true}
                // Des règles sont ouvertes, d'une manière ou d'une autre.
                enPause={tuto !== null}
              />
            )}
            {tab === 'sources' && <SourcesScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar tab={tab} onNavigate={navigate} />

      {/*
        Bouton constant sur ordinateur : les sources sont à portée depuis tous
        les écrans, et le même bouton ramène d'où l'on vient. Sur téléphone,
        elles ont leur onglet dans la barre du bas et le bouton s'efface.

        Sur les conversations, il descend se poser sur le champ de saisie barré
        — la seule bande de l'écran qu'il ne prive de rien.
      */}
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
