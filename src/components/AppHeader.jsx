import { Link } from 'react-router'
import { HelpCircle } from 'lucide-react'
import { useExitGuard } from '../state/exitGuard'
import { PATHS } from '../routes'
import { useAvatar } from '../state/useAvatar'
import { useProgression } from '../state/useProgression'
import { AvatarJoueur } from './AvatarPicker'

/**
 * En-tête de l'application : le logotype à gauche, qui ramène à l'accueil.
 *
 * La navigation n'est plus ici — elle est en bas, dans la barre d'onglets, à
 * toutes les tailles d'écran. Il ne reste donc à droite que ce qui dépend de
 * l'écran en cours : les règles du fil, et l'avancement du joueur.
 */
export default function AppHeader({ onGame, onShowRules }) {
  const { pseudo } = useProgression()
  const avatar = useAvatar()
  const { requestExit } = useExitGuard()

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link
          to={PATHS.home}
          onClick={(event) => {
            if (!requestExit(PATHS.home)) event.preventDefault()
          }}
          aria-label="CTRL INFO — retour à l'accueil"
          className="app-header__home"
        >
          <img src="/logo-ctrl-info.png" alt="" className="app-header__logo" />
          <span className="app-header__name">CTRL INFO</span>
        </Link>

        <div className="app-header__actions">
          {onGame && (
            <button
              type="button"
              onClick={onShowRules}
              title="Revoir les règles du jeu"
              className="rules-button"
            >
              <HelpCircle size={17} strokeWidth={2} />
              <span className="rules-button__label">Règles du jeu</span>
            </button>
          )}

          <Link
            to={PATHS.profile}
            aria-label={pseudo ? `Profil de ${pseudo}` : 'Ma progression'}
            title={pseudo || 'Ma progression'}
            className="app-header__avatar"
          >
            <AvatarJoueur avatar={avatar} taille={42} />
          </Link>
        </div>
      </div>
    </header>
  )
}
