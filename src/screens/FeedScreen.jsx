import { useNavigate, useOutletContext } from 'react-router'
import Feed from '../components/Feed'
import { GAME_PATHS } from '../routes'

/**
 * L'écran du fil d'actualité — l'adresse `/fil`.
 *
 * Il ne fait que brancher le jeu sur son entourage : la coque dit si les
 * règles sont à l'écran (le chrono ne doit pas tourner pendant ce temps), et
 * le routeur sait où aller quand la partie propose d'enchaîner sur l'autre
 * jeu.
 *
 * `runKey` remonte le composant quand les règles d'ouverture se referment : la
 * partie démarre à neuf plutôt qu'au milieu.
 */
export default function FeedScreen() {
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
