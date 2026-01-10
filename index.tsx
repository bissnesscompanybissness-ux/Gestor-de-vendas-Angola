import React from 'react'
import ReactDOM from 'react-dom/client'

// Componente principal da aplicação
function App() {
  return (
    <h1>Gestor de Vendas Angola</h1>
  )
}

// Monta a aplicação dentro do div#root do index.html
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 
