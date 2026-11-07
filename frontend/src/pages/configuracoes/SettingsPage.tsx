import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath } from '../../types/sistema'
import type { SetupData, WorkspaceUser } from '../../types/usuario'

type SettingsPageProps = {
  onNavigate: (path: AppPath) => void
  onSetupDataChange: (data: SetupData) => void
  onUsersChange: (users: WorkspaceUser[]) => void
  setupData: SetupData
  users: WorkspaceUser[]
}

function SettingsPage({
  onNavigate,
  onSetupDataChange,
  onUsersChange,
  setupData,
  users,
}: SettingsPageProps) {
  const [form, setForm] = useState(setupData)
  const [addingUser, setAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [message, setMessage] = useState('')

  const handleBusinessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSetupDataChange(form)
    setMessage('Dados da adega salvos neste navegador.')
  }

  const handleUserSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onUsersChange([
      ...users,
      {
        id: crypto.randomUUID(),
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: 'Operador',
        active: true,
      },
    ])
    setNewUser({ name: '', email: '' })
    setAddingUser(false)
    setMessage('Operador adicionado aos dados locais.')
  }

  return (
    <div>
      <AppSidebar
        currentPage="configuracoes"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <main>
        <header>
          <p>Preferências do sistema</p>
          <h1>Configurações</h1>
          <p>Gerencie os dados da adega e os acessos de demonstração.</p>
        </header>
        <section aria-labelledby="business-settings-title">
          <h2 id="business-settings-title">Dados da adega</h2>
          <form onSubmit={handleBusinessSubmit}>
            <label>
              Nome da adega *
              <input
                onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))}
                required
                value={form.businessName}
              />
            </label>
            <label>
              Categoria
              <input
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                value={form.category}
              />
            </label>
            <label>
              Telefone
              <input
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                value={form.phone}
              />
            </label>
            <label>
              Nome do administrador
              <input
                onChange={(event) => setForm((current) => ({ ...current, adminName: event.target.value }))}
                value={form.adminName}
              />
            </label>
            <label>
              E-mail
              <input
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={form.email}
              />
            </label>
            <button type="submit">Salvar dados</button>
          </form>
        </section>
        <section aria-labelledby="users-title">
          <h2 id="users-title">Usuários</h2>
          <p>Contas demonstrativas locais; não há autenticação nem criação de acesso no servidor.</p>
          <table>
            <thead>
              <tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Perfil</th><th scope="col">Status</th><th scope="col">Ações</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{setupData.adminName || 'Administrador da adega'}</td>
                <td>{setupData.email || '—'}</td>
                <td>Administrador</td>
                <td>Ativo</td>
                <td>Conta atual</td>
              </tr>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? 'Ativo' : 'Inativo'}</td>
                  <td>
                    <button
                      onClick={() =>
                        onUsersChange(users.map((current) =>
                          current.id === user.id ? { ...current, active: !current.active } : current,
                        ))
                      }
                      type="button"
                    >
                      {user.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => onUsersChange(users.filter((current) => current.id !== user.id))}
                      type="button"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setAddingUser((current) => !current)} type="button">
            {addingUser ? 'Cancelar' : 'Adicionar operador'}
          </button>
          {addingUser && (
            <form onSubmit={handleUserSubmit}>
              <label>
                Nome *
                <input
                  onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))}
                  required
                  value={newUser.name}
                />
              </label>
              <label>
                E-mail *
                <input
                  onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
                  required
                  type="email"
                  value={newUser.email}
                />
              </label>
              <button type="submit">Salvar operador</button>
            </form>
          )}
        </section>
        {message && <p aria-live="polite" role="status">{message}</p>}
      </main>
    </div>
  )
}

export default SettingsPage
