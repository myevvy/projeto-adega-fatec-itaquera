import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import type { AppPath } from '../../types/sistema'
import type { NotificationPreferences, SetupData } from '../../types/usuario'

type ProfilePageProps = {
  notifications: NotificationPreferences
  onNavigate: (path: AppPath) => void
  onNotificationsChange: (preferences: NotificationPreferences) => void
  onSetupDataChange: (data: SetupData) => void
  setupData: SetupData
}

const notificationLabels: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'lowStock', label: 'Avisos de estoque baixo' },
  { key: 'emptyStock', label: 'Avisos de produtos sem estoque' },
  { key: 'salesSummary', label: 'Resumo de vendas' },
  { key: 'email', label: 'Receber notificações por e-mail' },
  { key: 'push', label: 'Receber notificações no dispositivo' },
]

function ProfilePage({
  notifications,
  onNavigate,
  onNotificationsChange,
  onSetupDataChange,
  setupData,
}: ProfilePageProps) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(setupData)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [message, setMessage] = useState('')

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSetupDataChange(form)
    setEditing(false)
    setMessage('Perfil salvo neste navegador.')
  }

  const handleLogout = () => {
    setConfirmLogout(false)
    navigate('/login')
  }

  return (
    <div>
      <AppSidebar currentPage="perfil" onNavigate={onNavigate} userName={setupData.adminName} />
      <main>
        <header>
          <p>Minha conta</p>
          <h1>Perfil</h1>
        </header>
        <section aria-labelledby="profile-summary-title">
          <h2 id="profile-summary-title">Dados do perfil</h2>
          <p aria-hidden="true">{(setupData.adminName || 'A').slice(0, 1).toLocaleUpperCase('pt-BR')}</p>
          <p>{setupData.adminName || 'Administrador da adega'}</p>
          <p>{setupData.email || 'E-mail não informado'}</p>
          <p>Administrador</p>
          <button
            onClick={() => {
              setForm(setupData)
              setEditing((current) => !current)
            }}
            type="button"
          >
            {editing ? 'Cancelar edição' : 'Editar perfil'}
          </button>
          {editing && (
            <form onSubmit={saveProfile}>
              <label>
                Nome *
                <input
                  onChange={(event) => setForm((current) => ({ ...current, adminName: event.target.value }))}
                  required
                  value={form.adminName}
                />
              </label>
              <label>
                E-mail *
                <input
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                  type="email"
                  value={form.email}
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
              <button type="submit">Salvar perfil</button>
            </form>
          )}
        </section>
        <section aria-labelledby="notifications-title">
          <h2 id="notifications-title">Notificações</h2>
          <p>Preferências salvas somente neste navegador.</p>
          {notificationLabels.map(({ key, label }) => (
            <label key={key}>
              <input
                checked={notifications[key]}
                onChange={(event) =>
                  onNotificationsChange({ ...notifications, [key]: event.target.checked })
                }
                type="checkbox"
              />
              {label}
            </label>
          ))}
        </section>
        <section aria-labelledby="help-title">
          <h2 id="help-title">Ajuda e suporte</h2>
          <details>
            <summary>Como os dados são armazenados?</summary>
            <p>Esta versão de demonstração mantém as alterações no Local Storage deste navegador.</p>
          </details>
          <details>
            <summary>Precisa de suporte?</summary>
            <p>O suporte estará disponível quando a integração de atendimento for configurada.</p>
          </details>
        </section>
        <section aria-labelledby="session-title">
          <h2 id="session-title">Sessão</h2>
          <p>O login é apenas demonstrativo nesta versão e não valida credenciais.</p>
          <button onClick={() => setConfirmLogout(true)} type="button">Sair da conta</button>
        </section>
        {message && <p aria-live="polite" role="status">{message}</p>}
        {confirmLogout && (
          <ConfirmDialog
            description="Você será direcionado para a tela de login demonstrativa. Nenhuma sessão de servidor será encerrada."
            onCancel={() => setConfirmLogout(false)}
            onConfirm={handleLogout}
            title="Sair da conta?"
          />
        )}
      </main>
    </div>
  )
}

export default ProfilePage
