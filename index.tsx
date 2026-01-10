import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App' // se já tiveres o App separado

const el = document.getElementById('root')
if (!el) {
  throw new Error('Elemento #root não encontrado no index.html')
}

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
