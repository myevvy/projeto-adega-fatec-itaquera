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
    <aside
      aria-label="Status do aplicativo"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-full sm:max-w-sm sm:p-0"
    >
      {isOffline && (
        <p
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
          role="status"
        >
          Você está offline. O aplicativo está usando os dados salvos neste
          dispositivo.
        </p>
      )}
      {installPrompt && (
        <section
          aria-label="Instalar aplicativo"
          className="rounded-3xl border border-[#e7e9e3] bg-white p-4 shadow-[0_16px_50px_rgba(27,35,24,0.2)] sm:p-5"
        >
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3d4d35] text-white shadow-sm"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold leading-5 text-[#1c1f1a]">
                Tenha sua adega sempre à mão
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Instale o aplicativo para abrir seu painel com mais rapidez.
              </p>
            </div>
            <button
              aria-label="Dispensar aviso de instalação"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35]"
              onClick={() => setInstallPrompt(null)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="min-h-11 flex-1 cursor-pointer rounded-xl bg-[#3d4d35] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#33412c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
              onClick={installApp}
              type="button"
            >
              Instalar agora
            </button>
            <button
              className="min-h-11 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
              onClick={() => setInstallPrompt(null)}
              type="button"
            >
              Agora não
            </button>
          </div>
        </section>
      )}
    </aside>
  )
}

export default PwaInstallPrompt
