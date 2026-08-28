import { HelpCircle } from 'lucide-react'
import { useCompte } from '../state/compte'

/**
 * En-tête de l'application : le logotype à gauche, qui ramène à l'accueil.
 *
 * La navigation n'est plus ici — elle est en bas, dans la barre d'onglets, à
 * toutes les tailles d'écran. Il ne reste donc à droite que ce qui dépend de
 * l'écran en cours : les règles du fil, et l'identité du joueur.
 */
export default function AppHeader({ tab, onNavigate, onRevoirRegles }) {
  const { utilisateur, connecte } = useCompte()

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="CTRL INFO — retour à l'accueil"
          className="app-header__home"
        >
          <img src="/logo-ctrl-info.png" alt="" className="app-header__logo" />
          <span className="app-header__name">CTRL INFO</span>
        </button>

        <div className="app-header__actions">
          {tab === 'feed' && (
            <button
              type="button"
              onClick={onRevoirRegles}
              title="Revoir les règles du fil d'actualité"
              className="rules-button"
            >
              <HelpCircle size={17} strokeWidth={2} />
              <span className="rules-button__label">Règles du jeu</span>
            </button>
          )}

          {/* Dire en permanence si la partie compte ou non : c'est la seule
              chose que le mode invité change pour le joueur. */}
          <button
            type="button"
            onClick={() => onNavigate('profil')}
            className={`app-header__compte${connecte ? ' app-header__compte--connecte' : ''}`}
          >
            {connecte ? utilisateur?.pseudo : 'Invité'}
          </button>
        </div>
      </div>
    </header>
  )
}
