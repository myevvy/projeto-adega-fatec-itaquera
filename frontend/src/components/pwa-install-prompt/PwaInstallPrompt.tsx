import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  )
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleInstallAvailable = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => setInstallPrompt(null)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener(
      'beforeinstallprompt',
      handleInstallAvailable as EventListener,
    )
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleInstallAvailable as EventListener,
      )
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <aside aria-label="Status do aplicativo">
      {isOffline && (
        <p role="status">
          Você está offline. O aplicativo está usando os dados salvos neste
          dispositivo.
        </p>
      )}
      {installPrompt && (
        <section aria-label="Instalar aplicativo">
          <p>Instale a Adega Bom Sabor para acessar mais rapidamente.</p>
          <button onClick={installApp} type="button">
            Instalar aplicativo
          </button>
          <button
            onClick={() => setInstallPrompt(null)}
            type="button"
          >
            Agora não
          </button>
        </section>
      )}
    </aside>
  )
}

export default PwaInstallPrompt
