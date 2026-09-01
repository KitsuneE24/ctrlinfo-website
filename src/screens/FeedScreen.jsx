import { useNavigate, useOutletContext } from 'react-router'
import Feed from '../components/Feed'
import { GAME_PATHS } from '../routes'

export default function FeedScreen() {
  // `runKey` change à la fermeture des règles : la partie repart à neuf.
  const { paused, runKey } = useOutletContext()
  const navigate = useNavigate()

  return (
    <Feed
      key={runKey}
      paused={paused}
      onSwitch={(gameId) => navigate(GAME_PATHS[gameId])}
    />
  )
}
