import { useEffect, useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import {
  createCollaborator,
  deactivateUser,
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
    try {
      await createCollaborator(session.token, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        senha: form.senha,
      })
      setMessage('Colaborador cadastrado com sucesso.')
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
      setError(
        deactivationError instanceof Error
          ? deactivationError.message
          : 'Não foi possível desativar o colaborador.',
      )
    } finally {
      setIsDeactivating(false)
    }
  }

  const collaborators = users.filter(
    (user) => user.tipo.trim().toUpperCase() !== 'ADMINISTRADOR',
  )

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1c1f1a] md:flex">
      <AppSidebar
        currentPage="usuarios"
        onNavigate={onNavigate}
        userName={session?.usuario.nome ?? ''}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
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
            onClick={() => {
              setError('')
              setMessage('')
              setIsFormOpen((open) => !open)
            }}
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
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
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
              Defina uma senha inicial e compartilhe-a com o colaborador de
              forma segura.
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
                  onChange={(event) =>
                    setForm((current) => ({ ...current, senha: event.target.value }))
                  }
                  required
                  type="password"
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
                          className="cursor-pointer rounded-lg px-3 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
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
        {userToDeactivate && (
          <ConfirmDialog
            description={`O acesso de ${userToDeactivate.nome} será desativado. A pessoa não poderá mais entrar no painel.`}
            onCancel={() => setUserToDeactivate(null)}
            onConfirm={() => void handleDeactivate()}
            title="Desativar colaborador?"
          />
        )}
      </main>
    </div>
  )
}

export default UsersPage
