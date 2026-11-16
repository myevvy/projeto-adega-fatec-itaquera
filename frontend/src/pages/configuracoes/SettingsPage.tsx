import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SettingsPageProps = {
  onNavigate: (path: AppPath) => void
  onSetupDataChange: (data: SetupData) => void
  setupData: SetupData
}

type View = 'menu' | 'business'

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px] text-[#26291f] outline-none transition placeholder:text-[#a8a496] focus:border-[#3b4a2b] focus:ring-2 focus:ring-[#3b4a2b]/20'

const labelClass = 'block text-sm font-medium text-[#26291f]'

const primaryButtonClass = `w-full rounded-xl bg-[#3b4a2b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] ${focusRing}`

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
      className="h-4 w-4 shrink-0 text-[#a8a496]"
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

type ScreenHeaderProps = {
  onBack: () => void
  title: string
}

function ScreenHeader({ onBack, title }: ScreenHeaderProps) {
  return (
    <header className="flex items-center gap-3">
      <button
        aria-label="Voltar"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#e3dfd2] bg-white text-[#26291f] transition hover:bg-[#ebe8dd] ${focusRing}`}
        onClick={onBack}
        type="button"
      >
        <ArrowLeftIcon />
      </button>
      <h1 className="text-lg font-bold leading-tight">{title}</h1>
    </header>
  )
}

function SettingsPage({
  onNavigate,
  onSetupDataChange,
  setupData,
}: SettingsPageProps) {
  const [view, setView] = useState<View>('menu')
  const [form, setForm] = useState(setupData)
  const [message, setMessage] = useState('')

  const goTo = (next: View) => {
    setMessage('')
    setView(next)
  }

  const handleBusinessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSetupDataChange(form)
    setMessage('Dados da adega salvos neste navegador.')
  }

  const statusMessage = message && (
    <p
      aria-live="polite"
      className="mt-4 rounded-xl bg-[#ebe8dd] px-4 py-3 text-sm text-[#3b4a2b]"
      role="status"
    >
      {message}
    </p>
  )

  return (
    <div className="min-h-screen bg-[#faf8f2] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="configuracoes"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <main className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-8 lg:flex-1 lg:pb-10">
        {view === 'menu' && (
          <>
            <ScreenHeader
              onBack={() => onNavigate('dashboard')}
              title="Configurações"
            />
            {statusMessage}

            <button
              className={`mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-[#e3dfd2] bg-white p-4 text-left transition hover:bg-[#fdfcf8] active:scale-[0.99] ${focusRing}`}
              onClick={() => goTo('business')}
              type="button"
            >
              <span>
                <span className="block text-[15px] font-semibold">
                  Dados da adega
                </span>
                <span className="mt-1 block text-xs text-[#6f6b60]">
                  Nome, categoria e contato do negócio
                </span>
              </span>
              <ChevronIcon />
            </button>

            <section aria-labelledby="users-title" className="mt-7">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold" id="users-title">
                  Acesso de colaboradores
                </h2>
                <button
                  className={`rounded-lg bg-[#3b4a2b] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#2f3b22] ${focusRing}`}
                  onClick={() => onNavigate('configuracoes/usuarios')}
                  type="button"
                >
                  Gerenciar
                </button>
              </div>
              <p className="mt-2 text-xs text-[#6f6b60]">
                Consulte, cadastre ou desative colaboradores conectados ao banco
                de dados.
              </p>
            </section>
          </>
        )}

        {/* Dados da adega */}
        {view === 'business' && (
          <>
            <ScreenHeader
              onBack={() => goTo('menu')}
              title="Dados da adega"
            />
            <p className="mt-5 text-sm text-[#6f6b60]">
              Atualize o nome, a categoria e o contato do seu negócio.
            </p>

            <section
              aria-labelledby="business-settings-title"
              className="mt-5 flex flex-1 flex-col"
            >
              <h2 className="sr-only" id="business-settings-title">
                Dados da adega
              </h2>
              <form
                className="flex flex-1 flex-col"
                onSubmit={handleBusinessSubmit}
              >
                <div className="space-y-4">
                  <label className={labelClass}>
                    Nome do estabelecimento *
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          businessName: event.target.value,
                        }))
                      }
                      required
                      value={form.businessName}
                    />
                  </label>
                  <label className={labelClass}>
                    Categoria
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      value={form.category}
                    />
                  </label>
                  <label className={labelClass}>
                    Telefone comercial
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="(00) 00000-0000"
                      type="tel"
                      value={form.phone}
                    />
                  </label>
                  <label className={labelClass}>
                    Nome do administrador
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          adminName: event.target.value,
                        }))
                      }
                      value={form.adminName}
                    />
                  </label>
                  <label className={labelClass}>
                    E-mail
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      type="email"
                      value={form.email}
                    />
                  </label>
                </div>

                <p className="mt-4 text-xs text-[#8a8678]">
                  Mantenha os dados de contato da adega atualizados.
                </p>
                {statusMessage}

                <div className="sticky bottom-20 mt-8 lg:bottom-6">
                  <button className={primaryButtonClass} type="submit">
                    Salvar alterações
                  </button>
                </div>
              </form>
            </section>
          </>
        )}

      </main>
    </div>
  )
}

export default SettingsPage
