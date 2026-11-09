import { useState } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import FormField from '../../components/form-field/FormField'

type LoginPageProps = {
  onCreateAccount: () => void
  onForgotPassword: () => void
  onLogin: () => void
}

function LoginPage({ onCreateAccount, onForgotPassword, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <AuthLayout description="Gestão de vendas e estoque">
      <form
       className="flex flex-col gap-4 text-left"
        onSubmit={(event) => {
          event.preventDefault()
          onLogin()
        }}
      >
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

        <button
          className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#33412c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
        onClick={onForgotPassword} type="button">
          Esqueci minha senha
        </button>

        <button className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#33412c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
        type="submit"
        >Entrar</button>

        <p className="text-center text-sm text-gray-500">
          Ainda não tem conta?{' '}
          <button 
          className="cursor-pointer font-medium text-[#3d4d35] hover:underline"
          onClick={onCreateAccount} 
          type="button">
            Configurar uma adega
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
