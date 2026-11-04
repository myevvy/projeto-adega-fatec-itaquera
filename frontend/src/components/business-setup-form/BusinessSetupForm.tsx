import FormField from '../form-field/FormField'
import type { SetupData } from '../../types'

type BusinessSetupFormProps = {
  onChange: (field: keyof SetupData, value: string) => void
  onContinue: () => void
  onLogin: () => void
  setupData: SetupData
}

function BusinessSetupForm({
  onChange,
  onContinue,
  onLogin,
  setupData,
}: BusinessSetupFormProps) {
  return (
    <form
      className="signup-step signup-step--business"
      onSubmit={(event) => {
        event.preventDefault()
        onContinue()
      }}
    >
      <p aria-label="Etapa 1 de 2">● ○</p>
      <h2>Dados da adega</h2>
      <p>Conte um pouco sobre o seu negócio.</p>
      <FormField
        id="business-name"
        label="Nome do estabelecimento"
        name="businessName"
        onChange={(value) => onChange('businessName', value)}
        placeholder="Ex: Adega Bom Sabor"
        value={setupData.businessName}
      />
      <FormField
        id="category"
        label="Categoria"
        name="category"
        onChange={(value) => onChange('category', value)}
        placeholder="Ex: Adega e distribuidora"
        value={setupData.category}
      />
      <FormField
        id="business-phone"
        label="Telefone comercial"
        name="phone"
        onChange={(value) => onChange('phone', value)}
        placeholder="(00) 00000-0000"
        type="tel"
        value={setupData.phone}
      />
      <button type="submit">Continuar</button>
      <p>
        Já tem uma conta?{' '}
        <button onClick={onLogin} type="button">
          Entrar
        </button>
      </p>
    </form>
  )
}

export default BusinessSetupForm
