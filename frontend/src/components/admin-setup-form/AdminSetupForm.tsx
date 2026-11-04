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

  return (
    <form
      className="signup-step signup-step--admin"
      onSubmit={(event) => {
        event.preventDefault()
        if (password !== confirmPassword) {
          setPasswordError('As senhas não coincidem.')
          return
        }
        setPasswordError('')
        onComplete()
      }}
    >
      <p aria-label="Etapa 2 de 2">○ ●</p>
      <h2>Crie sua conta de administrador</h2>
      <p>Você poderá cadastrar outros usuários depois.</p>
      <FormField
        id="admin-name"
        label="Seu nome"
        name="adminName"
        onChange={(value) => onChange('adminName', value)}
        placeholder="Ex: Marcos Almeida"
        value={setupData.adminName}
      />
      <FormField
        id="admin-email"
        label="E-mail"
        name="email"
        onChange={(value) => onChange('email', value)}
        placeholder="seuemail@exemplo.com"
        type="email"
        value={setupData.email}
      />
      <FormField
        autoComplete="new-password"
        id="admin-password"
        label="Senha"
        name="password"
        onChange={setPassword}
        placeholder="Crie uma senha"
        type="password"
        value={password}
      />
      <FormField
        autoComplete="new-password"
        id="confirm-password"
        label="Confirmar senha"
        name="confirmPassword"
        onChange={setConfirmPassword}
        placeholder="Repita a senha"
        type="password"
        value={confirmPassword}
      />
      {passwordError && <p role="alert">{passwordError}</p>}
      <button type="submit">Concluir cadastro</button>
    </form>
  )
}

export default AdminSetupForm
