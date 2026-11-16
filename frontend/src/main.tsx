import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({
  immediate: true,
  onRegisteredSW: (_serviceWorkerUrl, registration) => {
    if (!registration) return

    const update = () => {
      void registration.update().catch((error: unknown) => {
        console.error('Não foi possível verificar atualizações do app:', error)
      })
    }
    const intervalId = window.setInterval(update, 5 * 60 * 1000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') update()
    }
    const clearUpdateCheck = () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', clearUpdateCheck)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', clearUpdateCheck, { once: true })
  },
  onRegisterError: (error: unknown) => {
    console.error('Não foi possível registrar o service worker do app:', error)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
