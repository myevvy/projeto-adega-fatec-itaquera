import { useState } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import AdminSetupForm from '../../components/admin-setup-form/AdminSetupForm'
import BusinessSetupForm from '../../components/business-setup-form/BusinessSetupForm'
import SetupCompleteModal from '../../components/setup-complete-modal/SetupCompleteModal'
import { useAuth } from '../../hooks/useAuth'
import { register } from '../../services/authService'
import type { SetupData } from '../../types'

type SignupPageProps = {
  onComplete: () => void
  onLogin: () => void
  setupData: SetupData
  onChange: (setupData: SetupData) => void
}

function SignupPage({
  onComplete,
  onLogin,
  setupData,
  onChange,
}: SignupPageProps) {
  const [step, setStep] = useState<'business' | 'admin'>('business')
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { login, session } = useAuth()

  const updateField = (field: keyof SetupData, value: string) => {
    onChange({ ...setupData, [field]: value })
  }

  const handleCreateAccount = async (password: string) => {
    if (isSubmitting) return
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        nome: setupData.adminName,
        email: setupData.email,
        telefone: setupData.phone,
        senha: password,
      })
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : 'Não foi possível concluir o cadastro.',
      )
      setIsSubmitting(false)
      return
    }

    if (!session) {
      try {
        await login(setupData.email, password)
      } catch (loginError) {
        setError(
          `Cadastro concluído, mas não foi possível iniciar a sessão: ${
            loginError instanceof Error
              ? loginError.message
              : 'erro desconhecido'
          } Entre pela tela de login.`,
        )
        setIsSubmitting(false)
        return
      }
    }

    setStep('business')
    setIsSubmitting(false)
    setIsCompleteModalOpen(true)
  }

  return (
    <AuthLayout
      description={
        step === 'business'
          ? 'Vamos configurar seu negócio'
          : 'Só mais um passo'
      }
      businessName={setupData.businessName || undefined}
    >
      {step === 'business' ? (
        <BusinessSetupForm
          onChange={updateField}
          onContinue={() => setStep('admin')}
          onLogin={onLogin}
          setupData={setupData}
        />
      ) : (
        <AdminSetupForm
          error={error}
          isSubmitting={isSubmitting}
          onChange={updateField}
          onComplete={handleCreateAccount}
          onLogin={onLogin}
          setupData={setupData}
        />
      )}
      {isCompleteModalOpen && (
        <SetupCompleteModal
          onContinue={() => {
            setIsCompleteModalOpen(false)
            onComplete()
          }}
        />
      )}
    </AuthLayout>
  )
}

export default SignupPage
