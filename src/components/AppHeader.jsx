import { Link } from 'react-router'
import { HelpCircle } from 'lucide-react'
import { useExitGuard } from '../state/exitGuard'
import { PATHS } from '../routes'
import { useProgression } from '../state/useProgression'

/**
 * En-tête de l'application : le logotype à gauche, qui ramène à l'accueil.
 *
 * La navigation n'est plus ici — elle est en bas, dans la barre d'onglets, à
 * toutes les tailles d'écran. Il ne reste donc à droite que ce qui dépend de
 * l'écran en cours : les règles du fil, et l'avancement du joueur.
 */
export default function AppHeader({ onGame, onShowRules }) {
  const { fil } = useProgression()
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

          {/* La pastille disait l'identité — « Invité », « Se connecter ». Elle
              dit maintenant l'avancement, la seule chose qu'un joueur ait à
              suivre : son score dès qu'il en a un, et l'invitation à aller
              chercher son code sinon. */}
          <Link
            to={PATHS.profile}
            className={`app-header__score${fil.points > 0 ? ' app-header__score--actif' : ''}`}
          >
            {fil.points > 0 ? `${fil.points} pts` : 'Ma progression'}
          </Link>
        </div>
      </div>
    </header>
  )
}
