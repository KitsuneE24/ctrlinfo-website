import { useNavigate, useOutletContext } from 'react-router'
import Feed from '../components/Feed'
import { GAME_PATHS } from '../routes'

export default function FeedScreen() {
  const { paused, runKey, onRegles } = useOutletContext()
  const navigate = useNavigate()

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
