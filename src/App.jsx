import AppShell from './components/AppShell'
import FournisseurCompte from './state/FournisseurCompte'
import FournisseurJeux from './state/FournisseurJeux'

/**
 * Le contenu du jeu vient de l'API (ctrlinfo-app). Deux choses valent pour
 * toute l'application et sont donc posées ici, au-dessus de la coque : la
 * liste des jeux, demandée une fois, et l'identité du joueur.
 */
export default function App() {
  return (
    <FournisseurCompte>
      <FournisseurJeux>
        <AppShell />
      </FournisseurJeux>
    </FournisseurCompte>
  )
}
