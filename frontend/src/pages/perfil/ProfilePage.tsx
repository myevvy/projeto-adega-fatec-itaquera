import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath } from '../../types/sistema'
import type { NotificationPreferences, SetupData } from '../../types/usuario'

type ProfilePageProps = {
  notifications: NotificationPreferences
  onLogout: () => Promise<void>
  onNavigate: (path: AppPath) => void
  onNotificationsChange: (preferences: NotificationPreferences) => void
  onSave: (data: SetupData) => Promise<void>
  setupData: SetupData
}

type View = 'main' | 'edit' | 'notifications' | 'help'

const notificationLabels: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'lowStock', label: 'Avisos de estoque baixo' },
  { key: 'emptyStock', label: 'Avisos de produtos sem estoque' },
  { key: 'salesSummary', label: 'Resumo de vendas' },
  { key: 'email', label: 'Receber notificações por e-mail' },
  { key: 'push', label: 'Receber notificações no dispositivo' },
]

const viewTitles: Record<View, string> = {
  main: 'Perfil',
  edit: 'Editar perfil',
  notifications: 'Notificações',
  help: 'Ajuda e suporte',
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const inputClass =
  'mt-1.5 w-full min-w-0 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-base text-[#26291f] outline-none transition placeholder:text-[#a8a496] focus:border-[#3b4a2b] focus:ring-2 focus:ring-[#3b4a2b]/20 sm:text-[15px]'

const labelClass = 'block min-w-0 text-xs font-medium text-[#6f6b60]'

const primaryButtonClass = `w-full rounded-xl bg-[#3b4a2b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] sm:w-auto sm:min-w-56 sm:px-8 ${focusRing}`

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function MenuItem({
  label,
  onClick,
  variant = 'default',
}: {
  label: string
  onClick: () => void
  variant?: 'primary' | 'default' | 'danger'
}) {
  const styles = {
    primary: 'bg-[#3b4a2b] text-white hover:bg-[#2f3b22] border-transparent',
    default:
      'bg-white text-[#26291f] hover:bg-[#fdfcf8] border-[#e3dfd2]',
    danger: 'bg-white text-[#c8704d] hover:bg-[#fdf6f3] border-[#e3dfd2]',
  }[variant]

  return (
    <button
      className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99] ${styles} ${focusRing}`}
      onClick={onClick}
      type="button"
    >
      {label}
      <span className={variant === 'primary' ? 'text-white/80' : 'text-[#a8a496]'}>
        <ChevronIcon />
      </span>
    </button>
  )
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
      <span className="min-w-0 text-sm text-[#26291f]">{label}</span>
      <span className="relative shrink-0">
        <input
          checked={checked}
          className="peer sr-only"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="block h-6 w-10 rounded-full bg-[#d6d1c0] transition peer-checked:bg-[#3b4a2b] peer-focus-visible:ring-2 peer-focus-visible:ring-[#3b4a2b]/40 peer-focus-visible:ring-offset-2" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

function StatusBanner({
  children,
  tone = 'success',
}: {
  children: ReactNode
  tone?: 'success' | 'error'
}) {
  return (
    <p
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
        tone === 'success'
          ? 'bg-[#e3e9db] text-[#3b4a2b]'
          : 'border border-red-200 bg-red-50 text-red-700'
      }`}
      role={tone === 'success' ? 'status' : 'alert'}
    >
      {tone === 'success' && <CheckIcon />}
      <span className="min-w-0">{children}</span>
    </p>
  )
}

function LogoutDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    cancelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]"
      onClick={onCancel}
    >
      <div
        aria-describedby="logout-dialog-description"
        aria-labelledby="logout-dialog-title"
        aria-modal="true"
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:max-w-md sm:p-7"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h2
          className="text-lg font-bold leading-tight text-[#26291f]"
          id="logout-dialog-title"
        >
          Sair da conta?
        </h2>
        <p
          className="mt-2 text-sm leading-relaxed text-[#6f6b60]"
          id="logout-dialog-description"
        >
          Você precisará entrar novamente para acessar a adega. Seus dados permanecerão
          salvos.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            className={`w-full rounded-xl bg-[#3b4a2b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] focus-visible:ring-offset-2 ${focusRing}`}
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="w-full rounded-xl py-3 text-[15px] font-semibold text-[#b3261e] transition hover:bg-[#fdf1f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b3261e]/30 focus-visible:ring-offset-2"
            onClick={onConfirm}
            type="button"
          >
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

function ProfilePage({
  notifications,
  onLogout,
  onNavigate,
  onNotificationsChange,
  onSave,
  setupData,
}: ProfilePageProps) {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('main')
  const [form, setForm] = useState(setupData)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const name = setupData.adminName || 'Administrador da adega'
  const initial = (setupData.adminName || 'A').slice(0, 1).toLocaleUpperCase('pt-BR')

  const openEdit = () => {
    setForm(setupData)
    setSaved(false)
    setView('edit')
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    setIsSaving(true)
    try {
      await onSave({
        ...form,
        adminName: form.adminName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })
      setSaved(true)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar as alterações do perfil.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof SetupData, value: string) => {
    setSaved(false)
    setSaveError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleLogout = async () => {
    setConfirmLogout(false)
    setLogoutError('')
    try {
      await onLogout()
      navigate('/login', { replace: true, state: { loggedOut: true } })
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? `Não foi possível encerrar a sessão: ${error.message}`
          : 'Não foi possível encerrar a sessão.',
      )
    }
  }

  const goBack = () => (view === 'main' ? onNavigate('dashboard') : setView('main'))

  const infoRows: [string, string][] = [
    ['E-mail', setupData.email || 'E-mail não informado'],
    ['Telefone', setupData.phone || 'Telefone não informado'],
  ]

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#26291f] lg:flex">
      <AppSidebar currentPage="perfil" onNavigate={onNavigate} userName={setupData.adminName} />

      <main className="mx-auto flex w-full min-w-0 max-w-md flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-5 min-[380px]:pt-8 sm:max-w-2xl sm:px-6 md:pt-10 lg:max-w-5xl lg:flex-1 lg:px-8 lg:pb-10 xl:px-12">
        <header className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3dfd2] bg-white transition hover:bg-[#ebe8dd] ${focusRing}`}
            onClick={goBack}
            type="button"
          >
            <ArrowLeftIcon />
          </button>
          <div className="min-w-0">
            <p className="hidden text-xs text-[#6f6b60] lg:block">Minha conta</p>
            <h1 className="truncate text-lg font-bold leading-tight sm:text-xl lg:text-2xl">
              {viewTitles[view]}
            </h1>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <section
            aria-labelledby="profile-summary-title"
            className="lg:rounded-2xl lg:border lg:border-[#e3dfd2] lg:bg-white lg:p-6"
          >
            <h2 className="sr-only" id="profile-summary-title">
              Dados do perfil
            </h2>
            <div className="flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1c1d18] text-3xl font-medium text-white sm:h-24 sm:w-24 sm:text-4xl"
              >
                {initial}
              </span>
              <p className="mt-3 max-w-full break-words text-base font-bold sm:text-lg">
                {name}
              </p>
              <span className="mt-2 rounded-full bg-[#e3e9db] px-3 py-1 text-xs font-medium text-[#3b4a2b]">
                Administrador
              </span>
            </div>

            <dl
              className={`mt-5 divide-y divide-[#eee9dc] ${
                view === 'main' ? '' : 'hidden lg:block'
              }`}
            >
              {infoRows.map(([label, value]) => (
                <div className="py-3 first:pt-0" key={label}>
                  <dt className="text-xs text-[#8a8678]">{label}</dt>
                  <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="min-w-0">
            {view === 'main' && (
              <div className="space-y-3">
                {logoutError && <StatusBanner tone="error">{logoutError}</StatusBanner>}
                <MenuItem label="Editar perfil" onClick={openEdit} variant="primary" />
                <MenuItem label="Notificações" onClick={() => setView('notifications')} />
                <MenuItem label="Ajuda e suporte" onClick={() => setView('help')} />
                <MenuItem
                  label="Sair da conta"
                  onClick={() => setConfirmLogout(true)}
                  variant="danger"
                />
              </div>
            )}

            {view === 'edit' && (
              <form className="flex flex-col" onSubmit={saveProfile}>
                <div className="space-y-4">
                  <label className={labelClass}>
                    Seu nome *
                    <input
                      className={inputClass}
                      onChange={(event) => updateField('adminName', event.target.value)}
                      required
                      value={form.adminName}
                    />
                  </label>
                  <label className={labelClass}>
                    E-mail *
                    <input
                      className={inputClass}
                      onChange={(event) => updateField('email', event.target.value)}
                      required
                      type="email"
                      value={form.email}
                    />
                  </label>
                  <label className={labelClass}>
                    Telefone
                    <input
                      className={inputClass}
                      onChange={(event) => updateField('phone', event.target.value)}
                      placeholder="(00) 00000-0000"
                      type="tel"
                      value={form.phone}
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs text-[#8a8678]">
                  Mantenha seus dados de contato atualizados.
                </p>

                {saved && (
                  <div className="mt-4">
                    <StatusBanner>Alterações do perfil salvas.</StatusBanner>
                  </div>
                )}
                {saveError && (
                  <div className="mt-4">
                    <StatusBanner tone="error">{saveError}</StatusBanner>
                  </div>
                )}

                <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] mt-8 flex sm:justify-end lg:static lg:mt-6">
                  {saved ? (
                    <button
                      className={primaryButtonClass}
                      onClick={() => setView('main')}
                      type="button"
                    >
                      Voltar ao perfil
                    </button>
                  ) : (
                    <button
                      className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
                      disabled={isSaving}
                      type="submit"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {view === 'notifications' && (
              <section aria-labelledby="notifications-title">
                <h2 className="sr-only" id="notifications-title">
                  Notificações
                </h2>
                <p className="mb-3 text-sm text-[#6f6b60]">
                  Preferências salvas somente neste navegador.
                </p>
                <div className="divide-y divide-[#eee9dc] overflow-hidden rounded-2xl border border-[#e3dfd2] bg-white">
                  {notificationLabels.map(({ key, label }) => (
                    <Toggle
                      checked={notifications[key]}
                      key={key}
                      label={label}
                      onChange={(checked) =>
                        onNotificationsChange({ ...notifications, [key]: checked })
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {view === 'help' && (
              <section aria-labelledby="help-title">
                <h2 className="sr-only" id="help-title">
                  Ajuda e suporte
                </h2>
                <div className="divide-y divide-[#eee9dc] overflow-hidden rounded-2xl border border-[#e3dfd2] bg-white">
                  <details className="group px-4 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      Como os dados são armazenados?
                      <span className="text-[#a8a496] transition group-open:rotate-90">
                        <ChevronIcon />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-[#6f6b60]">
                      Esta versão de demonstração mantém as alterações no Local Storage deste
                      navegador.
                    </p>
                  </details>
                  <details className="group px-4 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      Precisa de suporte?
                      <span className="text-[#a8a496] transition group-open:rotate-90">
                        <ChevronIcon />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-[#6f6b60]">
                      O suporte estará disponível quando a integração de atendimento for
                      configurada.
                    </p>
                  </details>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {confirmLogout && (
        <LogoutDialog
          onCancel={() => setConfirmLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  )
}

export default ProfilePage
