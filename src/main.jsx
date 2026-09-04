import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './css/index.css'
import App from './App.jsx'
import Rattrapage from './components/ui/Rattrapage.jsx'

/**
 * `basename` suit la base de Vite : en local le site est à la racine, sur
 * GitHub Pages il vit sous `/CTRL_INFO/`. Sans lui, toutes les adresses
 * seraient fausses d'un sous-dossier en production.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Le filet est au-dessus du routeur : une erreur de rendu, où qu'elle
        survienne, laisse un message et un bouton plutôt qu'une page vide. */}
    <Rattrapage>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Rattrapage>
  </StrictMode>,
)
