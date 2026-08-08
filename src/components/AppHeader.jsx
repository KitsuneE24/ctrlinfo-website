import TopNav from './TopNav'

/**
 * En-tête de l'application : le logotype à gauche, la navigation à droite —
 * la disposition d'un site, pas celle d'une application mobile.
 *
 * Le logotype est cliquable : il ramène à l'accueil, où qu'on soit.
 *
 * Rien de propre à un jeu ne se range ici : ce bandeau appartient au site. Les
 * règles d'un jeu, elles, sont dans la barre du jeu (voir GameTabs) — sans quoi
 * on les prendrait pour celles de l'application entière.
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
