import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'highlight.js/styles/github-dark.min.css'
import './styles/global.css'
import './styles/prose.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/presentation-md">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
