import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import type { PurchaseRecord } from '../../types/financeiro'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type PurchasesPageProps = {
  onNavigate: (path: AppPath) => void
  onCancelPurchase: (purchaseId: string) => Promise<void>
  purchases: PurchaseRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function PurchasesPage({
  onNavigate,
  onCancelPurchase,
  purchases,
  setupData,
}: PurchasesPageProps) {
  const [purchaseToCancel, setPurchaseToCancel] = useState<PurchaseRecord | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const sortedPurchases = [...purchases].sort((a, b) => b.date.localeCompare(a.date))
  const handleCancel = async () => {
    if (!purchaseToCancel || isCancelling) return
    setError('')
    setIsCancelling(true)
    try {
      await onCancelPurchase(purchaseToCancel.id)
      setPurchaseToCancel(null)
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Não foi possível cancelar a compra.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <main>
      <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <header>
          <div>
            <h1>Compras</h1>
            <p>Histórico sincronizado com o banco de dados.</p>
          </div>
          <button onClick={() => onNavigate('compras/nova')} type="button">
            + Nova compra
          </button>
        </header>
        {error && <p role="alert">{error}</p>}
        {sortedPurchases.length === 0 ? (
          <p>Nenhuma compra registrada. Registre uma compra para atualizar o estoque.</p>
        ) : (
          <ul aria-label="Histórico de compras">
            {sortedPurchases.map((purchase) => (
              <li key={purchase.id}>
                <article>
                  <h2>{purchase.supplierName}</h2>
                  <p>
                    {purchase.productName
                      ? `${purchase.quantity}x ${purchase.productName} · `
                      : 'Detalhes dos itens indisponíveis · '}
                    {new Date(`${purchase.date}T12:00:00`).toLocaleDateString('pt-BR')}
                  </p>
                  <strong>{formatCurrency(purchase.total)}</strong>
                  {purchase.status !== 'CANCELADA' && (
                    <button
                      disabled={isCancelling}
                      onClick={() => setPurchaseToCancel(purchase)}
                      type="button"
                    >
                      Cancelar compra
                    </button>
                  )}
                  {purchase.status === 'CANCELADA' && <p>Cancelada</p>}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
      {purchaseToCancel && (
        <ConfirmDialog
          description="O cancelamento removerá do estoque os itens dessa compra. Se parte deles já foi vendida, o backend poderá recusar a operação."
          onCancel={() => setPurchaseToCancel(null)}
          onConfirm={() => void handleCancel()}
          title={isCancelling ? 'Cancelando compra...' : 'Cancelar compra?'}
        />
      )}
    </main>
  )
}

export default PurchasesPage
