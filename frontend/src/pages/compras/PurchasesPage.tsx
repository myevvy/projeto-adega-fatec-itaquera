import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { PurchaseRecord } from '../../types/financeiro'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type PurchasesPageProps = {
  onNavigate: (path: AppPath) => void
  purchases: PurchaseRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function PurchasesPage({ onNavigate, purchases, setupData }: PurchasesPageProps) {
  const sortedPurchases = [...purchases].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <main>
      <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <header>
          <div>
            <h1>Compras</h1>
            <p>Histórico de compras salvo neste navegador.</p>
          </div>
          <button onClick={() => onNavigate('compras/nova')} type="button">
            + Nova compra
          </button>
        </header>
        {sortedPurchases.length === 0 ? (
          <p>Nenhuma compra registrada. Registre uma compra para atualizar o estoque.</p>
        ) : (
          <ul aria-label="Histórico de compras">
            {sortedPurchases.map((purchase) => (
              <li key={purchase.id}>
                <article>
                  <h2>{purchase.supplierName}</h2>
                  <p>
                    {purchase.quantity}x {purchase.productName} ·{' '}
                    {new Date(`${purchase.date}T12:00:00`).toLocaleDateString('pt-BR')}
                  </p>
                  <strong>{formatCurrency(purchase.total)}</strong>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default PurchasesPage
