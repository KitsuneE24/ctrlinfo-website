import { Fragment } from 'react'
import Feed from '../components/Feed'
import GameHub from '../components/GameHub'
import GameTabs from '../components/GameTabs'
import ChatScreen from './ChatScreen'
import DetectGame from './DetectScreen'

/**
 * Onglet « Jeux » : la sous-navigation, puis le jeu choisi — ou, si aucun ne
 * l'est, la galerie de présentation.
 *
 * Les conversations sont un jeu comme les autres : elles entrent par ici, au
 * même titre que le fil et les indices.
 *
 * Le jeu en cours n'est pas un état local : il vient de la coque (AppShell),
 * pour que le menu déroulant du haut et les onglets de la page pilotent
 * exactement la même chose.
 *
 * Deux drapeaux disent ce que fait le tutoriel, parce qu'il ne fait pas la même
 * chose selon qu'il s'ouvre tout seul ou qu'on le rouvre :
 *
 * - `enAttente` — ce sont les règles d'ouverture. Le jeu est monté derrière,
 *   on l'aperçoit en fond, mais il est remonté à leur fermeture : sinon le
 *   chrono du fil aurait tourné pendant la lecture et la partie commencerait
 *   avec la moitié de son temps consommée.
 * - `enPause` — les règles sont à l'écran, quelles qu'elles soient. Le jeu
 *   garde son état mais suspend ce qui court : relire les règles en pleine
 *   partie ne doit pas coûter la publication en cours.
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
