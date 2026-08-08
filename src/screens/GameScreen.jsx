import { Fragment } from 'react'
import Feed from '../components/Feed'
import GameHub from '../components/GameHub'
import GameTabs from '../components/GameTabs'
import ChatScreen from './ChatScreen'
import DetectGame from './DetectScreen'

/**
 * Onglet « Jeux » : la barre du jeu, puis le jeu choisi — ou la galerie si
 * aucun ne l'est. Le jeu en cours vient de la coque (AppShell).
 *
 * Deux drapeaux pour le tutoriel :
 *
 * - `enAttente` — ce sont les règles d'ouverture. Le jeu est remonté à leur
 *   fermeture, pour qu'il démarre à neuf.
 * - `enPause` — des règles sont à l'écran. Le jeu garde son état mais suspend
 *   ce qui court.
 */
export default function GameScreen({
  jeu,
  onSelect,
  onRevoirRegles,
  enAttente = false,
  enPause = false,
}) {
  return (
    <div className="app__screen">
      <GameTabs jeu={jeu} onSelect={onSelect} onRevoirRegles={onRevoirRegles} />

      <Fragment key={enAttente ? 'regles' : 'jeu'}>
        {jeu === 'feed' ? (
          <Feed onSwitch={onSelect} enPause={enPause} />
        ) : jeu === 'detect' ? (
          <DetectGame onSwitch={onSelect} />
        ) : jeu === 'chat' ? (
          <ChatScreen />
        ) : (
          <GameHub onPlay={onSelect} />
        )}
      </Fragment>
    </div>
  )
}
