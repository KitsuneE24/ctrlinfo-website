import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Le filet sous l'application.
 *
 * Sans lui, une erreur de rendu — un champ absent, une réponse d'API d'une
 * forme inattendue — vide l'écran sans un mot : le joueur voit une page
 * blanche et n'a aucune idée de ce qu'il doit faire.
 *
 * C'est encore une classe, et ce n'est pas un oubli : React n'expose la
 * capture d'erreur de rendu qu'à ce niveau, il n'existe pas de crochet
 * équivalent.
 *
 * L'erreur détaillée n'est montrée qu'en développement. En production elle
 * n'apprendrait rien au joueur, et dirait à un curieux comment le site est
 * fait.
 */
export default class Rattrapage extends Component {
  state = { erreur: null }

  static getDerivedStateFromError(erreur) {
    return { erreur }
  }

  componentDidCatch(erreur, infos) {
    if (import.meta.env.DEV) console.error('Erreur de rendu :', erreur, infos)
  }

  render() {
    if (!this.state.erreur) return this.props.children

    return (
      <div className="rattrapage">
        <h1 className="rattrapage__titre">Quelque chose a lâché</h1>
        <p className="rattrapage__texte">
          L'écran n'a pas pu s'afficher. Recharger suffit le plus souvent — ta
          progression est enregistrée si tu as un compte.
        </p>

        {import.meta.env.DEV && (
          <pre className="rattrapage__detail">{String(this.state.erreur)}</pre>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bouton bouton--plein"
        >
          <RefreshCw size={16} strokeWidth={2.2} />
          Recharger la page
        </button>
      </div>
    )
  }
}
