import AppSidebar from '../../components/app-sidebar/AppSidebar'
import SupplierForm from '../../components/supplier-form/SupplierForm'
import type { Supplier } from '../../types/fornecedor'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SupplierFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (supplier: Supplier) => void
  setupData: SetupData
  supplier?: Supplier
}

function SupplierFormPage({
  onNavigate,
  onSave,
  setupData,
  supplier,
}: SupplierFormPageProps) {
  return (
    <div>
      <AppSidebar
        currentPage="fornecedores"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <main>
        <button onClick={() => onNavigate('fornecedores')} type="button">
          Voltar para fornecedores
        </button>
        <h1>{supplier ? 'Editar fornecedor' : 'Novo fornecedor'}</h1>
        <SupplierForm
          onCancel={() =>
            onNavigate(supplier ? `fornecedores/${supplier.id}` : 'fornecedores')
          }
          onSave={(updatedSupplier) => {
            onSave(updatedSupplier)
            onNavigate(`fornecedores/${updatedSupplier.id}`)
          }}
          supplier={supplier}
        />
      </main>
    </div>
  )
}

export default SupplierFormPage
