import { Component } from 'react'
import { RefreshCw } from 'lucide-react'

// Classe : seule façon de capter une erreur de rendu. Détail affiché en dev uniquement.
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
          L'écran n'a pas pu s'afficher. Recharger suffit le plus souvent : votre
          progression reste enregistrée dans ce navigateur.
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
