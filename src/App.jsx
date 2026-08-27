import AppShell from './components/AppShell'
import FournisseurJeux from './state/FournisseurJeux'

/**
 * Le contenu du jeu vient de l'API (ctrlinfo-app). La liste des jeux, elle,
 * est demandée une fois pour toute l'application : le fournisseur est donc
 * posé ici, au-dessus de la coque.
 */
export default function App() {
  return (
    <FournisseurJeux>
      <AppShell />
    </FournisseurJeux>
  )
}
