import { useState } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import FormField from '../../components/form-field/FormField'

type LoginPageProps = {
  onCreateAccount: () => void
  onLogin: () => void
}

function LoginPage({ onCreateAccount, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  return (
    <AuthLayout description="Gestão de vendas e estoque">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onLogin()
        }}
      >
        <h2>Entrar na sua conta</h2>
        <FormField
          id="login-email"
          label="E-mail"
          name="email"
          onChange={setEmail}
          placeholder="seuemail@exemplo.com"
          type="email"
          value={email}
        />
        <FormField
          id="login-password"
          label="Senha"
          name="password"
          onChange={setPassword}
          placeholder="Digite sua senha"
          type="password"
          value={password}
        />
        <button
          onClick={() => setMessage('Recuperação de senha não disponível nesta demonstração.')}
          type="button"
        >
          Esqueci minha senha
        </button>
        <button type="submit">Entrar</button>
        {message && <p role="status">{message}</p>}
        <p>
          Ainda não tem conta?{' '}
          <button onClick={onCreateAccount} type="button">
            Configurar uma adega
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
