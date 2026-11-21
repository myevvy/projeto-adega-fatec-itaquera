import AppSidebar from '../../components/app-sidebar/AppSidebar'
import SupplierForm from '../../components/supplier-form/SupplierForm'
import type { Supplier } from '../../types/fornecedor'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SupplierFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (supplier: Supplier) => Promise<Supplier>
  setupData: SetupData
  supplier?: Supplier
}

function SupplierFormPage({
  onNavigate,
  onSave,
  setupData,
  supplier,
}: SupplierFormPageProps) {
  const title = supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'

  return (
    <div className="min-h-screen bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="fornecedores"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
        {/* Topo */}
        <div className="flex items-center gap-3 border-b border-line pb-4 sm:border-0 sm:pb-0">
          <button
            aria-label="Voltar para fornecedores"
            className="inline-flex items-center gap-2 rounded-md p-1 text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => onNavigate('fornecedores')}
            type="button"
          >
            <span aria-hidden="true" className="text-lg sm:text-base">←</span>
            <span className="hidden sm:inline">Voltar para fornecedores</span>
          </button>
          <p className="flex-1 pr-8 text-center text-base font-semibold sm:hidden">
            {title}
          </p>
        </div>

        <h1 className="mt-6 hidden text-3xl font-semibold sm:block">{title}</h1>

        <div className="mt-5 sm:rounded-3xl sm:border sm:border-line sm:bg-card sm:p-8 sm:shadow-sm">
          <SupplierForm
            onCancel={() =>
              onNavigate(supplier ? `fornecedores/${supplier.id}` : 'fornecedores')
            }
            onDone={(savedSupplier) =>
              onNavigate(
                supplier
                  ? `fornecedores/${savedSupplier.id}`
                  : 'fornecedores',
              )
            }
            onSave={onSave}
            supplier={supplier}
          />
        </div>
      </main>
    </div>
  )
}

export default SupplierFormPage