import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import type { Supplier } from '../../types/fornecedor'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SupplierDetailPageProps = {
  onDelete: (supplierId: string) => void
  onNavigate: (path: AppPath) => void
  onUpdate: (supplier: Supplier) => void
  setupData: SetupData
  supplier: Supplier
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function SupplierDetailPage({
  onDelete,
  onNavigate,
  onUpdate,
  setupData,
  supplier,
}: SupplierDetailPageProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const purchasesTotal = supplier.purchases.reduce((total, purchase) => total + purchase.total, 0)

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
        <header>
          <p>Detalhes do fornecedor</p>
          <h1>{supplier.name}</h1>
          <p>{supplier.active ? 'Ativo' : 'Inativo'}</p>
          <button
            onClick={() => onNavigate(`fornecedores/${supplier.id}/editar`)}
            type="button"
          >
            Editar fornecedor
          </button>
          <button
            onClick={() => onUpdate({ ...supplier, active: !supplier.active })}
            type="button"
          >
            {supplier.active ? 'Desativar' : 'Ativar'} fornecedor
          </button>
          <button onClick={() => setConfirmDelete(true)} type="button">
            Excluir fornecedor
          </button>
        </header>
        <section aria-labelledby="supplier-data-title">
          <h2 id="supplier-data-title">Dados cadastrais</h2>
          <dl>
            <dt>Razão social</dt><dd>{supplier.legalName || '—'}</dd>
            <dt>CNPJ</dt><dd>{supplier.cnpj || '—'}</dd>
            <dt>Telefone</dt><dd>{supplier.phone}</dd>
            <dt>E-mail</dt><dd>{supplier.email || '—'}</dd>
            <dt>Endereço</dt><dd>{supplier.address || '—'}</dd>
            <dt>Cidade / Estado</dt>
            <dd>{[supplier.city, supplier.state].filter(Boolean).join(' / ') || '—'}</dd>
            <dt>Observações</dt><dd>{supplier.description || '—'}</dd>
          </dl>
        </section>
        <section aria-labelledby="purchase-history-title">
          <h2 id="purchase-history-title">Histórico de compras demonstrativo</h2>
          <p>Total de compras registradas: {supplier.purchases.length}</p>
          <p>Total movimentado: {formatCurrency(purchasesTotal)}</p>
          {supplier.purchases.length === 0 ? (
            <p>Nenhuma compra demonstrativa registrada para este fornecedor.</p>
          ) : (
            <table>
              <thead>
                <tr><th scope="col">Data</th><th scope="col">Itens</th><th scope="col">Total</th></tr>
              </thead>
              <tbody>
                {supplier.purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{new Date(`${purchase.date}T12:00:00`).toLocaleDateString('pt-BR')}</td>
                    <td>{purchase.itemCount}</td>
                    <td>{formatCurrency(purchase.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {confirmDelete && (
          <ConfirmDialog
            description="Esta ação remove o fornecedor dos dados salvos neste navegador."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => onDelete(supplier.id)}
            title="Excluir fornecedor?"
          />
        )}
      </main>
    </div>
  )
}

export default SupplierDetailPage
