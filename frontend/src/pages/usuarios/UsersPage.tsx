import { useEffect, useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import { useAuth } from '../../hooks/useAuth'
import {
  createCollaborator,
  deactivateUser,
  isAdministratorProfile,
  listUsers,
  type DirectoryUser,
} from '../../services/authService'
import type { AppPath } from '../../types/sistema'

type UsersPageProps = {
  onNavigate: (path: AppPath) => void
}

const emptyForm = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
}

function generateInitialPassword() {
  return `Adega-${crypto.randomUUID()}`
}

function UsersPage({ onNavigate }: UsersPageProps) {
  const { session } = useAuth()
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [userToDeactivate, setUserToDeactivate] = useState<DirectoryUser | null>(
    null,
  )
  const [isDeactivating, setIsDeactivating] = useState(false)

  useEffect(() => {
    let active = true
    if (!session) return

    listUsers(session.token)
      .then((result) => {
        if (active) setUsers(result)
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Não foi possível carregar os usuários.',
          )
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  useEffect(() => {
    if (!userToDeactivate) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeactivating) setUserToDeactivate(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [userToDeactivate, isDeactivating])

  const refreshUsers = async () => {
    if (!session) return

    setIsLoading(true)
    try {
      setUsers(await listUsers(session.token))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível atualizar a lista de usuários.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollaborator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session || isSubmitting) return

    setError('')
    setMessage('')
    setIsSubmitting(true)
    const initialPassword = form.senha
    try {
      const result = await createCollaborator(session.token, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        senha: initialPassword,
      })
      setMessage(
        result.reativado
          ? `${result.nome} foi reativado. Os dados e a senha anteriores foram mantidos.`
          : `Colaborador cadastrado com sucesso. Senha inicial de ${form.nome.trim()}: ${initialPassword}. Compartilhe-a de forma segura.`,
      )
      setForm(emptyForm)
      setIsFormOpen(false)
      await refreshUsers()
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Não foi possível cadastrar o colaborador.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeactivate = async () => {
    if (!session || !userToDeactivate || isDeactivating) return

    setError('')
    setMessage('')
    setIsDeactivating(true)
    try {
      await deactivateUser(session.token, userToDeactivate.id)
      setMessage(`${userToDeactivate.nome} foi desativado.`)
      setUserToDeactivate(null)
      await refreshUsers()
    } catch (deactivationError) {
      setUserToDeactivate(null)
      setError(
        deactivationError instanceof Error
          ? deactivationError.message
          : 'Não foi possível desativar o colaborador.',
      )
    } finally {
      setIsDeactivating(false)
    }
  }

  const toggleForm = () => {
    setError('')
    setMessage('')
    if (!isFormOpen) {
      setForm({ ...emptyForm, senha: generateInitialPassword() })
    }
    setIsFormOpen(!isFormOpen)
  }

  const collaborators = users.filter(
    (user) => !isAdministratorProfile(user.tipo),
  )

  return (
    <div className="min-h-dvh bg-[#faf9f6] text-[#1c1f1a] md:flex">
      <AppSidebar
        currentPage="configuracoes"
        onNavigate={onNavigate}
        userName={session?.usuario.nome ?? ''}
      />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        <button
          className="mb-4 -ml-1 inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm text-[#687064] transition hover:text-[#1c1f1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35]"
          onClick={() => onNavigate('configuracoes')}
          type="button"
        >
          <span aria-hidden="true">←</span> Voltar para configurações
        </button>
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#687064]">Administração</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Usuários
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Cadastre e gerencie os colaboradores que podem acessar o painel da
              adega.
            </p>
          </div>
          <button
            className="min-h-11 cursor-pointer rounded-xl bg-[#3d4d35] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#33412c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
            onClick={toggleForm}
            type="button"
          >
            {isFormOpen ? 'Cancelar' : 'Adicionar colaborador'}
          </button>
        </header>

        {error && (
          <p
            aria-live="polite"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            aria-live="polite"
            className="mb-5 break-words rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
          >
            {message}
          </p>
        )}

        {isFormOpen && (
          <section
            aria-labelledby="create-user-title"
            className="mb-8 rounded-2xl border border-[#e7e9e3] bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="text-lg font-semibold" id="create-user-title">
              Novo colaborador
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Para um novo colaborador, uma senha inicial exclusiva será
              gerada e exibida após o cadastro. Se o e-mail pertencer a uma
              conta desativada, ela será reativada com os dados e a senha
              anteriores.
            </p>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={handleCreateCollaborator}
            >
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nome
                <input
                  autoComplete="name"
                  className="min-h-11 rounded-xl border border-gray-300 px-3 py-2 font-normal focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nome: event.target.value }))
                  }
                  required
                  value={form.nome}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                E-mail
                <input
                  autoComplete="email"
                  className="min-h-11 rounded-xl border border-gray-300 px-3 py-2 font-normal focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                  type="email"
                  value={form.email}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Telefone <span className="font-normal text-gray-500">(opcional)</span>
                <input
                  autoComplete="tel"
                  className="min-h-11 rounded-xl border border-gray-300 px-3 py-2 font-normal focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      telefone: event.target.value,
                    }))
                  }
                  type="tel"
                  value={form.telefone}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Senha inicial
                <input
                  autoComplete="new-password"
                  className="min-h-11 rounded-xl border border-gray-300 px-3 py-2 font-normal focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                  minLength={8}
                  readOnly
                  required
                  type="text"
                  value={form.senha}
                />
              </label>
              <div className="flex justify-end sm:col-span-2">
                <button
                  className="min-h-11 cursor-pointer rounded-xl bg-[#3d4d35] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#33412c] disabled:cursor-wait disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar colaborador'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          aria-labelledby="collaborators-title"
          className="overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#eef0eb] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold" id="collaborators-title">
                Colaboradores ativos
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {collaborators.length}{' '}
                {collaborators.length === 1 ? 'colaborador' : 'colaboradores'}
              </p>
            </div>
            <button
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-[#3d4d35] hover:bg-[#f2f4ef] disabled:opacity-50"
              disabled={isLoading}
              onClick={() => void refreshUsers()}
              type="button"
            >
              Atualizar
            </button>
          </div>
          {isLoading ? (
            <p className="px-5 py-8 text-sm text-gray-600" role="status">
              Carregando usuários...
            </p>
          ) : collaborators.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-600">
              Nenhum colaborador ativo cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#f7f8f5] text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold" scope="col">Nome</th>
                    <th className="px-5 py-3 font-semibold" scope="col">E-mail</th>
                    <th className="px-5 py-3 font-semibold" scope="col">Perfil</th>
                    <th className="px-5 py-3 font-semibold" scope="col">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0eb]">
                  {collaborators.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-medium">{user.nome}</td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4 text-gray-600">{user.tipo}</td>
                      <td className="px-5 py-4">
                        <button
                          className="cursor-pointer rounded-lg px-3 py-2 font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50"
                          disabled={isDeactivating}
                          onClick={() => setUserToDeactivate(user)}
                          type="button"
                        >
                          Desativar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {userToDeactivate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#1c1f1a]/50 p-4 sm:items-center"
          onClick={() => {
            if (!isDeactivating) setUserToDeactivate(null)
          }}
        >
          <div
            aria-describedby="desativar-descricao"
            aria-labelledby="desativar-titulo"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-[#e7e9e3] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-lg font-semibold" id="desativar-titulo">
              Desativar colaborador?
            </h2>
            <p
              className="mt-2 break-words text-sm leading-6 text-gray-600"
              id="desativar-descricao"
            >
              O acesso de <strong className="font-semibold text-[#1c1f1a]">{userToDeactivate.nome}</strong>{' '}
              será desativado. A pessoa não poderá mais entrar no painel.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                autoFocus
                className="min-h-11 cursor-pointer rounded-xl border border-[#e7e9e3] bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#f2f4ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDeactivating}
                onClick={() => setUserToDeactivate(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="min-h-11 cursor-pointer rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                disabled={isDeactivating}
                onClick={() => void handleDeactivate()}
                type="button"
              >
                {isDeactivating ? 'Desativando…' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
