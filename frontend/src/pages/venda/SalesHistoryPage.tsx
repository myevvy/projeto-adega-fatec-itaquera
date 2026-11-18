import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import SalesPeriodFilter from '../../components/sales-period-filter/SalesPeriodFilter'
import type { AppPath, SaleRecord, SalesPeriod, SetupData } from '../../types'

type SalesHistoryPageProps = {
  onNavigate: (path: AppPath) => void
  onCancelSale: (saleId: string) => Promise<void>
  sales: SaleRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const btnBase =
  'min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1c19]'
const btnPrimary = `${btnBase} border-[#1d1c19] bg-[#1d1c19] text-[#faf8f3] hover:bg-[#36342f]`
const btnGhost = `${btnBase} border-[#e8e4d9] bg-transparent text-[#1d1c19] hover:bg-[#efece3]`

function SalesHistoryPage({
  onNavigate,
  onCancelSale,
  sales,
  setupData,
}: SalesHistoryPageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('7')
  const [saleToCancel, setSaleToCancel] = useState<SaleRecord | null>(null)
  const [error, setError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const filteredSales = useMemo(() => {
    if (period === 'all') return sales
    if (period === 'today') {
      return sales.filter(
        (sale) =>
          new Date(sale.createdAt).toDateString() === new Date().toDateString(),
      )
    }
    const days = Number(period)
    const from = new Date()
    from.setDate(from.getDate() - days)
    return sales.filter((sale) => new Date(sale.createdAt) >= from)
  }, [period, sales])
  const activeSales = filteredSales.filter((sale) => sale.status !== 'CANCELADA')
  const total = activeSales.reduce((sum, sale) => sum + sale.total, 0)
  const handleCancel = async () => {
    if (!saleToCancel || isCancelling) return
    setError('')
    setIsCancelling(true)
    try {
      await onCancelSale(saleToCancel.id)
      setSaleToCancel(null)
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Não foi possível cancelar a venda.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#faf8f3] font-sans text-[#1d1c19] min-[900px]:flex-row">
      <AppSidebar currentPage="vendas" onNavigate={onNavigate} userName={setupData.adminName} />

      <section className="mx-auto flex w-full min-w-0 max-w-240 flex-1 flex-col gap-5 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:gap-6 sm:px-6 sm:pt-6 sm:pb-24 min-[900px]:mx-0 min-[900px]:max-w-none min-[900px]:px-10 min-[900px]:pt-8 min-[900px]:pb-12 min-[900px]:*:max-w-240">
        <header className="flex flex-col gap-3 border-b border-[#e8e4d9] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-[1.6rem]">
              Histórico de Vendas
            </h1>
            <p className="mt-1 hidden text-[0.95rem] text-[#6f6b61] sm:block">
              Consulte as vendas realizadas no período.
            </p>
          </div>
          <div>
            <SalesPeriodFilter onChange={setPeriod} value={period} />
          </div>
        </header>

        <section
          aria-label="Resumo das vendas"
          className="grid grid-cols-2 gap-4 border-b border-[#e8e4d9] pb-5 sm:gap-6 min-[900px]:rounded-xl min-[900px]:border min-[900px]:bg-white min-[900px]:px-6 min-[900px]:py-5"
        >
          <article className="min-w-0">
            <p className="text-[0.8rem] text-[#6f6b61]">Vendas Realizadas</p>
            <strong className="mt-1 block text-[clamp(1.15rem,5vw,1.6rem)] font-bold tracking-tight wrap-anywhere">
              {activeSales.length} vendas
            </strong>
          </article>
          <article className="min-w-0">
            <p className="text-[0.8rem] text-[#6f6b61]">Faturamento Total</p>
            <strong className="mt-1 block text-[clamp(1.15rem,5vw,1.6rem)] font-bold tracking-tight wrap-anywhere">
              {formatCurrency(total)}
            </strong>
          </article>
        </section>

        <section aria-labelledby="recent-sales-heading" className="flex flex-col gap-2">
          <header className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold" id="recent-sales-heading">
              Vendas Recentes
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                className={btnGhost}
                onClick={() => onNavigate('vendas/relatorio')}
                type="button"
              >
                Relatório de vendas
              </button>
              <button
                className={btnPrimary}
                onClick={() => onNavigate('nova-venda')}
                type="button"
              >
                + Nova venda
              </button>
            </div>
          </header>

          {error && (
            <p
              className="rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-[#b3261e]"
              role="alert"
            >
              {error}
            </p>
          )}

          {filteredSales.length ? (
            <ul className="m-0 list-none p-0">
              {filteredSales.map((sale) => {
                const cancelled = sale.status === 'CANCELADA'
                return (
                  <li
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-[#e8e4d9] py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4 min-[900px]:rounded-lg min-[900px]:px-2 min-[900px]:py-4 min-[900px]:hover:bg-black/[0.025]"
                    key={sale.id}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-10 place-items-center rounded-[10px] bg-[#efece3] ${cancelled ? 'opacity-50' : ''}`}
                    >
                      <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                        <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="20" x="2" y="5" />
                        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </span>

                    <div className="min-w-0">
                      <strong
                        className={`block text-[0.95rem] ${cancelled ? 'opacity-50' : ''}`}
                      >
                        Venda #{sale.id.slice(-6)}
                      </strong>
                      <p className="mt-0.5 text-[0.78rem] leading-snug text-[#6f6b61]">
                        {sale.items.length
                          ? `${sale.items.reduce((count, item) => count + item.quantity, 0)} itens`
                          : 'Itens não detalhados pela API'}{' '}
                        · {sale.paymentMethod} ·{' '}
                        {new Date(sale.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {cancelled && (
                        <span className="mt-1.5 inline-block rounded-full bg-[#fbe9e7] px-2 py-0.5 text-[0.72rem] font-semibold text-[#b3261e]">
                          Cancelada
                        </span>
                      )}
                    </div>

                    <strong
                      className={`text-right text-[0.95rem] whitespace-nowrap tabular-nums ${cancelled ? 'line-through opacity-50' : ''}`}
                    >
                      {formatCurrency(sale.total)}
                    </strong>

                    {!cancelled && (
                      <button
                        className="col-span-2 col-start-2 min-h-9 justify-self-start py-1 text-[0.8rem] font-semibold text-[#b3261e] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1c19] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:col-start-auto sm:justify-self-end sm:px-2"
                        disabled={isCancelling}
                        onClick={() => setSaleToCancel(sale)}
                        type="button"
                      >
                        Cancelar venda
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[#e8e4d9] px-4 py-10 text-center text-[#6f6b61]">
              <p>Nenhuma venda encontrada nesse período.</p>
              <button
                className={btnPrimary}
                onClick={() => onNavigate('nova-venda')}
                type="button"
              >
                Registrar uma venda
              </button>
            </div>
          )}
        </section>
      </section>

      {saleToCancel && (
        <ConfirmDialog
          description="O cancelamento será registrado no banco e fará o estorno do estoque e do financeiro."
          onCancel={() => setSaleToCancel(null)}
          onConfirm={() => void handleCancel()}
          title={isCancelling ? 'Cancelando venda...' : 'Cancelar venda?'}
        />
      )}
    </main>
  )
}

export default SalesHistoryPage
