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

  const handleGoToDashboard = () => {
    setStep('business')
    onComplete()
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-white px-4 pb-6 pt-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9fbef]">
            <svg
              className="h-6 w-6 text-[#15803d]"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <button
          className="w-full cursor-pointer rounded-2xl bg-[#3d4d35] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#33412c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3d4d35] focus-visible:ring-offset-2"
          onClick={handleGoToDashboard}
          type="button"
        >
          Ir para o painel
        </button>
      </div>
      
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
