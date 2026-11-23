import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { AgentProvider } from './context/AgentContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AgentProvider>
        <App />
      </AgentProvider>
    </ThemeProvider>
  </React.StrictMode>,
)