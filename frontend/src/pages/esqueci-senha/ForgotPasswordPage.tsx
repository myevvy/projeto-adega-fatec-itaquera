import { useState, type FormEvent } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'

type ForgotPasswordPageProps = {
  onBackToLogin: () => void
}

function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AuthLayout description="Recuperação de acesso">
      <section>
        <h1>Recuperar senha</h1>
        {submitted ? (
          <>
            <p>Solicitação registrada para {email}.</p>
            <p role="status">
              Esta é uma demonstração: nenhum e-mail foi enviado. A recuperação estará disponível
              quando o backend for integrado.
            </p>
            <button onClick={onBackToLogin} type="button">Voltar ao login</button>
          </>
        ) : (
          <>
            <p>Informe o e-mail cadastrado para iniciar a recuperação da senha.</p>
            <form onSubmit={submit}>
              <label>
                E-mail cadastrado
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <button type="submit">Enviar link de recuperação</button>
            </form>
            <button onClick={onBackToLogin} type="button">Voltar ao login</button>
          </>
        )}
      </section>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
