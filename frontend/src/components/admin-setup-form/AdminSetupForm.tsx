import { useState } from 'react'
import FormField from '../form-field/FormField'
import type { SetupData } from '../../types'

type AdminSetupFormProps = {
  onChange: (field: keyof SetupData, value: string) => void
  onComplete: () => void
  setupData: SetupData
}

function AdminSetupForm({
  onChange,
  onComplete,
  setupData,
}: AdminSetupFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    setPasswordError('')
    onComplete()
  }

  return (
    <form
      className="signup-step signup-step--admin"
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        textAlign: 'left',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ height: '8px', width: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px' }} />
          <div style={{ height: '8px', width: '32px', backgroundColor: '#3d4d35', borderRadius: '9999px' }} />
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Etapa 2 de 2</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '4px', marginBottom: '4px' }}>
            Crie sua conta de administrador
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Você poderá cadastrar outros usuários depois.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField
            id="admin-name"
            label="Seu nome"
            name="adminName"
            onChange={(value) => onChange('adminName', value)}
            placeholder="Ex: Marcos Almeida"
            value={setupData.adminName || ''}
          />

          <FormField
            id="admin-email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            onChange={(value) => onChange('email', value)}
            placeholder="seuemail@exemplo.com"
            value={setupData.email || ''}
          />

          <FormField
            id="admin-password"
            label="Senha"
            name="password"
            type="password"
            autoComplete="new-password"
            onChange={(value) => setPassword(value)}
            placeholder="Crie uma senha"
            value={password}
          />

          <FormField
            id="confirm-password"
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            onChange={(value) => setConfirmPassword(value)}
            placeholder="Repita a senha"
            value={confirmPassword}
          />

          {passwordError && (
            <p role="alert" style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>
              {passwordError}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: '#3d4d35',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Concluir cadastro
        </button>
      </div>
    </form>
  )
}

export default AdminSetupForm
