import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './css/index.css'
import App from './App.jsx'
import Rattrapage from './components/ui/Rattrapage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Le filet est au-dessus du routeur : une erreur de rendu, où qu'elle
        survienne, laisse un message et un bouton plutôt qu'une page vide. */}
    <Rattrapage>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Rattrapage>
  </StrictMode>,
)
