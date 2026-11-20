import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import FormField from '../../components/form-field/FormField'

type LoginPageProps = {
  onForgotPassword: () => void
  onLogin: (email: string, password: string) => Promise<void>
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

function LoginPage({ onForgotPassword, onLogin }: LoginPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loggedOut] = useState(
    () => Boolean((location.state as { loggedOut?: boolean } | null)?.loggedOut),
  )

  useEffect(() => {
    if (loggedOut) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      await onLogin(email, password)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout description="Gestão de vendas e estoque">
      <form className="flex flex-col gap-4 text-left" onSubmit={submit}>
        <h2 className="text-base font-semibold text-[#1c1f1a]">Entrar na sua conta</h2>
        <div className="flex flex-col gap-4">
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
        </div>
        <button
          className="-mt-1 cursor-pointer self-end text-xs text-[#1c1f1a] hover:underline"
          onClick={onForgotPassword}
          type="button"
        >
          Esqueci minha senha
        </button>
        {error && (
          <p aria-live="polite" className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#33412c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
        {loggedOut && !error && (
          <p
            className="flex items-center gap-3 rounded-xl bg-[#e3e9db] px-4 py-3 text-sm font-semibold text-[#3b4a2b]"
            role="status"
          >
            <CheckIcon />
            <span className="min-w-0">Sessão encerrada com sucesso.</span>
          </p>
        )}
        <p className="text-center text-sm text-gray-500">
          Acesso disponível para usuários cadastrados pelo administrador.
        </p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
