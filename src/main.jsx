import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './css/index.css'
import App from './App.jsx'
import Rattrapage from './components/ui/Rattrapage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Rattrapage>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Rattrapage>
  </StrictMode>,
)
