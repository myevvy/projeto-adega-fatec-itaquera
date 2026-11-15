import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SettingsPageProps = {
  onNavigate: (path: AppPath) => void
  onSetupDataChange: (data: SetupData) => void
  setupData: SetupData
}

function SettingsPage({
  onNavigate,
  onSetupDataChange,
  setupData,
}: SettingsPageProps) {
  const [form, setForm] = useState(setupData)
  const [message, setMessage] = useState('')

  const handleBusinessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSetupDataChange(form)
    setMessage('Dados da adega salvos neste navegador.')
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
        {message && <p aria-live="polite" role="status">{message}</p>}
      </main>
    </div>
  )
}

export default SettingsPage
