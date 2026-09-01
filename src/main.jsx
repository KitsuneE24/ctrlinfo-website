import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './css/index.css'
import App from './App.jsx'

/**
 * `basename` suit la base de Vite : en local le site est à la racine, sur
 * GitHub Pages il vit sous `/CTRL_INFO/`. Sans lui, toutes les adresses
 * seraient fausses d'un sous-dossier en production.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
