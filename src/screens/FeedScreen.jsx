import { useNavigate, useOutletContext } from 'react-router'
import Feed from '../components/Feed'
import { GAME_PATHS } from '../routes'

export default function FeedScreen() {
  const { paused, runKey, onRegles } = useOutletContext()
  const navigate = useNavigate()

  // Rien ne se charge avant le début de la partie.
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
