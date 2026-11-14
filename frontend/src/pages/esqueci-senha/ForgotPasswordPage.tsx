import { useState, type FormEvent } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import { sendPasswordResetEmail } from '../../services/firebasePasswordReset'

type ForgotPasswordPageProps = {
  onBackToLogin: () => void
}

function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      await sendPasswordResetEmail(email)
      setSubmitted(true)
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
      <section className="flex flex-col gap-4 text-left">
        <h1 className="text-base font-semibold text-[#1c1f1a]">Recuperar senha</h1>
        {submitted ? (
          <>
          <p className="text-sm text-gray-600">
            Se o endereço estiver cadastrado no Firebase, você receberá as instruções de
            recuperação.
            </p>
          <button
            className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#33412c]"
            onClick={onBackToLogin}
            type="button"
          >
            Voltar ao login
          </button>
          </>
        ) : (
          <>
          <p className="text-sm text-gray-600">
            Informe o e-mail cadastrado no Firebase para receber um link de recuperação.
          </p>
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <label className="flex flex-col gap-2 text-sm text-[#1c1f1a]" htmlFor="reset-email">
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
            <p className="text-xs text-amber-800">
              A API atual valida a senha armazenada no banco. Para a nova senha do Firebase
              também valer no login da adega, será necessária a sincronização das contas no
              backend.
            </p>
            <button
              className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white hover:bg-[#33412c] disabled:cursor-wait disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
            </form>
          <button
            className="cursor-pointer text-sm text-[#1c1f1a] hover:underline"
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
