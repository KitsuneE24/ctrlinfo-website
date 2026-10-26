import { useNavigate, useOutletContext } from 'react-router'
import Feed from '../components/Feed'
import { GAME_PATHS } from '../routes'

export default function FeedScreen() {
  // `runKey` change à la fermeture des règles : la partie repart à neuf.
  const { paused, runKey, onRegles } = useOutletContext()
  const navigate = useNavigate()

  // Rien ne se charge tant que la partie n'a pas commencé : l'écran de départ
  // couvre de toute façon le fil, et un tirage fait pour rien serait jeté au
  // remontage.
  if (runKey !== 'play') return null

  return (
    <Feed
      key={runKey}
      paused={paused}
      onRegles={onRegles}
      onSwitch={(gameId) => navigate(GAME_PATHS[gameId])}
    />
  )
}
