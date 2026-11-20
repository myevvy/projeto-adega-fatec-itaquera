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
    <main className="min-h-dvh bg-[#fbfaf5] text-[#2b3025] lg:flex">
      <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />

      {/* pb-24: espaço para a navegação inferior no mobile */}
      <section className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-8 lg:pb-10 lg:pt-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              aria-label="Voltar"
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#efefe9] transition hover:bg-[#e4e8dc] lg:hidden"
              onClick={() => onNavigate('inicio' as AppPath)}
              type="button"
            >
              <svg
                aria-hidden
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Compras</h1>
              <p className="mt-0.5 text-xs text-[#858a80] sm:text-sm">
                Histórico de compras
              </p>
            </div>
          </div>
          <button
            className="h-10 shrink-0 rounded-xl bg-[#39452d] px-4 text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
            onClick={() => onNavigate('compras/nova')}
            type="button"
          >
            + <span className="sm:hidden">Nova</span>
            <span className="hidden sm:inline">Nova compra</span>
          </button>
        </header>

        {error && (
          <p
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {sortedPurchases.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-[#d9dbd2] px-6 py-12 text-center text-sm text-[#747a6d]">
            Nenhuma compra registrada. Registre uma compra para atualizar o estoque.
          </p>
        ) : (
          <ul
            aria-label="Histórico de compras"
            className="mt-6 divide-y divide-[#ecece4] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#e8e8e0] sm:bg-white"
          >
            {sortedPurchases.map((purchase) => {
              const cancelled = purchase.status === 'CANCELADA'
              return (
                <li key={purchase.id}>
                  <article className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
                    <div className="min-w-0">
                      <h2
                        className={`truncate text-sm font-semibold sm:text-base ${
                          cancelled ? 'text-[#858a80] line-through' : ''
                        }`}
                      >
                        {purchase.supplierName}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#858a80] sm:text-sm">
                        {purchase.productName
                          ? `${purchase.quantity}x ${purchase.productName} · `
                          : 'Detalhes dos itens indisponíveis · '}
                        {new Date(`${purchase.date}T12:00:00`).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      {cancelled ? (
                        <span className="rounded-full bg-[#efefe9] px-2.5 py-1 text-xs font-medium text-[#747a6d]">
                          Cancelada
                        </span>
                      ) : (
                        <button
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-[#a14a3a] transition hover:bg-red-50 disabled:opacity-50"
                          disabled={isCancelling}
                          onClick={() => setPurchaseToCancel(purchase)}
                          type="button"
                        >
                          Cancelar compra
                        </button>
                      )}
                      <strong className="min-w-24 text-right text-sm sm:text-base">
                        {formatCurrency(purchase.total)}
                      </strong>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {purchaseToCancel && (
        <ConfirmDialog
          description="O cancelamento removerá do estoque os itens dessa compra. Se parte deles já foi vendida, a operação poderá não ser permitida."
          onCancel={() => setPurchaseToCancel(null)}
          onConfirm={() => void handleCancel()}
          title={isCancelling ? 'Cancelando compra...' : 'Cancelar compra?'}
        />
      )}
    </main>
  )
}

export default PurchasesPage
