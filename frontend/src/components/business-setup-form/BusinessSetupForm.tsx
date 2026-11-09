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
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        textAlign: 'left',
        padding: '24px',
        boxSizing: 'border-box',
      }}
      onSubmit={(event) => {
        event.preventDefault()
        onContinue()
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ height: '8px', width: '32px', backgroundColor: '#3d4d35', borderRadius: '9999px' }} />
          <div style={{ height: '8px', width: '8px', backgroundColor: '#e5e7eb', borderRadius: '9999px' }} />
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Etapa 1 de 2</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginTop: '4px', marginBottom: '4px' }}>
            Vamos configurar sua adega
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>Informe os dados do seu negócio.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField
            id="business-name"
            label="Nome do estabelecimento"
            name="businessName"
            onChange={(value) => onChange('businessName', value)}
            placeholder="Ex: Adega Bom Sabor"
            value={setupData.businessName || ''}
          />

          <FormField
            id="category"
            label="Categoria"
            name="category"
            onChange={(value) => onChange('category', value)}
            placeholder="Ex: Adega e distribuidora"
            value={setupData.category || ''}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: '#3d4d35',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Continuar
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text)' }}>
          Já tem uma conta?{' '}
          <button
            onClick={onLogin}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#3d4d35',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              fontSize: 'inherit',
            }}
          >
            Entrar
          </button>
        </p>
      </div>
    </form>
  )
}

export default BusinessSetupForm
