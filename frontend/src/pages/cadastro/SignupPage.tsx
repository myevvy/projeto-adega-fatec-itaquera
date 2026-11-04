import { useState } from 'react'
import AuthLayout from '../../components/auth-layout/AuthLayout'
import AdminSetupForm from '../../components/admin-setup-form/AdminSetupForm'
import BusinessSetupForm from '../../components/business-setup-form/BusinessSetupForm'
import SetupCompleteModal from '../../components/setup-complete-modal/SetupCompleteModal'
import useLocalStorage from '../../hooks/useLocalStorage'
import type { SetupData } from '../../types'

type SignupPageProps = {
  onChange: (setupData: SetupData) => void
  onComplete: () => void
  onLogin: () => void
  setupData: SetupData
}

function SignupPage({
  onChange,
  onComplete,
  onLogin,
  setupData,
}: SignupPageProps) {
  const [step, setStep] = useLocalStorage(
    'adega.signup-step',
    'business' as const,
    (value): value is 'business' | 'admin' =>
      value === 'business' || value === 'admin',
  )
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const updateField = (field: keyof SetupData, value: string) => {
    onChange({ ...setupData, [field]: value })
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
          onChange={updateField}
          onComplete={() => setIsCompleteModalOpen(true)}
          setupData={setupData}
        />
      )}
      {isCompleteModalOpen && (
        <SetupCompleteModal onContinue={onComplete} />
      )}
    </AuthLayout>
  )
}

export default SignupPage
