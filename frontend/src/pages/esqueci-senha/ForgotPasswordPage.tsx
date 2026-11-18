import { useState, type FormEvent } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import { confirmPasswordReset } from '../../services/authService'
import { sendPasswordResetEmail } from '../../services/firebasePasswordReset'

type ForgotPasswordPageProps = {
  onBackToLogin: () => void
}

function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const resetParams = new URLSearchParams(window.location.search)
  const isResetLink = resetParams.get('mode') === 'resetPassword'
  const oobCode = resetParams.get('oobCode')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [passwordResetDone, setPasswordResetDone] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    if (isResetLink && !oobCode) {
      setError('O link de recuperação é inválido ou está incompleto.')
      return
    }
    if (isResetLink && password !== passwordConfirmation) {
      setError('As senhas não coincidem.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      if (isResetLink && oobCode) {
        await confirmPasswordReset(oobCode, password)
        setPasswordResetDone(true)
        window.history.replaceState({}, '', window.location.pathname)
      } else {
        await sendPasswordResetEmail(email)
        setSubmitted(true)
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
        ? submitError.message
        : 'Não foi possível solicitar a recuperação da senha.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

   return (
    <AuthLayout description="Recuperação de acesso">
      <section className="flex w-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-sm">
        {passwordResetDone ? (
          <>
            <h1 className="text-lg font-semibold text-[#1c1f1a]">Senha redefinida</h1>
            <p className="text-base text-gray-600">
              Sua nova senha já pode ser usada para entrar no sistema.
            </p>
            <button
              className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#33412c]"
              onClick={onBackToLogin}
              type="button"
            >
              Voltar ao login
            </button>
          </>
        ) : isResetLink ? (
          <>
            <h1 className="text-base font-semibold text-[#1c1f1a]">Criar nova senha</h1>
            <p className="text-sm text-gray-600">
              Informe uma nova senha para acessar o sistema.
            </p>
            {!oobCode ? (
              <p aria-live="polite" className="text-sm text-red-700" role="alert">
                O link de recuperação é inválido ou está incompleto.
              </p>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={submit}>
                <label className="flex flex-col gap-2 text-sm text-[#1c1f1a]" htmlFor="reset-password">
                  Nova senha
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1c1f1a] focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                    id="reset-password"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-[#1c1f1a]" htmlFor="reset-password-confirmation">
                  Confirme a nova senha
                  <input
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1c1f1a] focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                    id="reset-password-confirmation"
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    required
                    type="password"
                    value={passwordConfirmation}
                  />
                </label>
                {error && (
                  <p aria-live="polite" className="text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#33412c] disabled:cursor-wait disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
                </button>
              </form>
            )}
            <button
              className="cursor-pointer self-center text-sm font-medium text-[#1c1f1a] hover:underline"
              onClick={onBackToLogin}
              type="button"
            >
              Voltar ao login
            </button>
          </>
        ) : submitted ? (
          <>
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#e3e9db]">
              <svg
                aria-hidden="true"
                className="h-7 w-7 text-[#3d4d35]"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M4 12.5l5.5 5.5L20 6.5" />
              </svg>
            </div>

            <h1 className="text-lg font-semibold text-[#1c1f1a]">Solicitação concluída</h1>

            <p className="text-base text-gray-600">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua
              senha.
            </p>

            <p className="text-xs text-gray-600">
              E-mail informado:
              <br />
              {email}
            </p>

            <button
              className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#33412c]"
              onClick={onBackToLogin}
              type="button"
            >
              Voltar ao login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-base font-semibold text-[#1c1f1a]">Recuperar senha</h1>

            <p className="text-sm text-gray-600">
              Enviaremos um link ao e-mail cadastrado para redefinir sua senha.
            </p>

            <form className="flex flex-col gap-4" onSubmit={submit}>
              <label
                className="flex flex-col gap-2 text-sm text-[#1c1f1a]"
                htmlFor="reset-email"
              >
                E-mail cadastrado
                <input
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1c1f1a] placeholder:text-gray-400 focus:border-[#3d4d35] focus:outline-none focus:ring-2 focus:ring-[#3d4d35]/20"
                  id="reset-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  type="email"
                  value={email}
                />
              </label>

              {error && (
                <p aria-live="polite" className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#33412c] disabled:cursor-wait disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <button
              className="cursor-pointer self-center text-sm font-medium text-[#1c1f1a] hover:underline"
              onClick={onBackToLogin}
              type="button"
            >
              Voltar ao login
            </button>
          </>
        )}
      </section>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
