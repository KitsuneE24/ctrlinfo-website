import TopNav from './TopNav'

/**
 * En-tête de l'application : le logotype à gauche, qui ramène à l'accueil, et
 * la navigation à droite.
 *
 * Rien de propre à un jeu ici : ses règles sont dans la barre du jeu, voir
 * GameTabs.
 */
export default function AppHeader({ tab, jeu, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="Alert NC — retour à l'accueil"
          className="app-header__home"
        >
          <img src="/Logo_alerte_NC-02.png" alt="" className="app-header__logo" />
          <span className="app-header__name">Alert NC</span>
        </button>

        <TopNav tab={tab} jeu={jeu} onNavigate={onNavigate} />
      </div>
    </header>
  )
}
