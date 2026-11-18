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

type SaleDetailsProps = {
  sale: SaleRecord
  sellerName: string
  cancelled: boolean
  cancelNotice: { units: number } | null
  error?: string
  isCancelling: boolean
  onBack: () => void
  onCancel: () => void
}

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  const day = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${day} às ${time}`
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#34452b]'

function SaleDetails({
  sale,
  sellerName,
  cancelled,
  cancelNotice,
  error,
  isCancelling,
  onBack,
  onCancel,
}: SaleDetailsProps) {
  const shortId = sale.id.slice(-6)
  const hasItems = sale.items.length > 0
  const units = sale.items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = hasItems
    ? sale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    : sale.total
  const discount = Math.max(Math.round((subtotal - sale.total) * 100) / 100, 0)

  return (
    <article aria-labelledby="sale-details-heading" className="w-full">
      <div className="flex max-w-xl flex-col gap-5 min-[900px]:rounded-xl min-[900px]:border min-[900px]:border-[#e8e4d9] min-[900px]:bg-white min-[900px]:p-6">

        <header className="flex items-center gap-2">
          <button
            aria-label="Voltar ao histórico"
            className={`-ml-2 grid size-10 place-items-center rounded-full hover:bg-[#efece3] ${focusRing}`}
            onClick={onBack}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
              <path
                d="M15 9H3m0 0 5-5M3 9l5 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
          <h1 className="text-base font-bold sm:text-lg" id="sale-details-heading">
            Detalhes da Venda
          </h1>
        </header>
        
        <div className="flex items-center justify-between gap-3 border-b border-[#e8e4d9] pb-4">
          <h2 className="text-xl font-bold tracking-tight">Venda #{shortId}</h2>
          {cancelled && (
            <span className="rounded-full bg-[#ece9e0] px-3 py-1 text-xs font-semibold text-[#6f6b61]">
              Cancelada
            </span>
          )}
        </div>

        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-b border-[#e8e4d9] pb-4 text-[0.82rem]">
          <dt className="text-[#6f6b61]">Data e hora</dt>
          <dd className="m-0 text-right font-medium tabular-nums">
            {formatDateTime(sale.createdAt)}
          </dd>
          <dt className="text-[#6f6b61]">Pagamento</dt>
          <dd className="m-0 text-right font-medium">{sale.paymentMethod}</dd>
          <dt className="text-[#6f6b61]">Vendedor</dt>
          <dd className="m-0 text-right font-medium wrap-anywhere">{sellerName}</dd>
        </dl>

        <section aria-labelledby="sale-items-heading" className="border-b border-[#e8e4d9] pb-4">
          <h3 className="mb-1 text-base font-bold" id="sale-items-heading">
            Itens ({units})
          </h3>
          {hasItems ? (
            <ul className="m-0 list-none p-0">
              {sale.items.map((item) => (
                <li
                  className="flex items-center gap-3 border-b border-[#e8e4d9] py-3 last:border-b-0"
                  key={`${item.productId}-${item.unitPrice}`}
                >
                  <span aria-hidden="true" className="size-10 shrink-0 rounded-lg bg-[#dfe8d3]" />
                  <div className="min-w-0 flex-1">
                    <strong className="block text-[0.92rem] wrap-anywhere">{item.name}</strong>
                    <p className="m-0 mt-0.5 text-[0.75rem] text-[#6f6b61]">
                      {item.quantity} un. × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <strong className="text-[0.92rem] whitespace-nowrap tabular-nums">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-3 text-sm text-[#6f6b61]">Itens não detalhados pela API.</p>
          )}
        </section>

        <section aria-label="Totais da venda" className="flex flex-col gap-2">
          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.82rem]">
            <dt className="text-[#6f6b61]">Subtotal</dt>
            <dd className="m-0 text-right tabular-nums">{formatCurrency(subtotal)}</dd>
            <dt className="text-[#6f6b61]">Desconto</dt>
            <dd className="m-0 text-right tabular-nums">{formatCurrency(discount)}</dd>
          </dl>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold">Total</span>
            <strong className="text-[1.6rem] leading-none font-extrabold tracking-tight tabular-nums">
              {formatCurrency(sale.total)}
            </strong>
          </div>
          {cancelled && (
            <p className="m-0 text-[0.75rem] text-[#6f6b61]">Valor histórico da venda cancelada.</p>
          )}
        </section>

        {cancelNotice && (
          <div
            className="flex items-start gap-3 rounded-xl border border-[#cfdcc0] bg-[#e4ecd9] p-4 text-[#2b3a23]"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              fill="none"
              height="22"
              viewBox="0 0 22 22"
              width="22"
            >
              <path
                d="m4 11.5 4.5 4.5L18 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <div className="min-w-0">
              <strong className="block text-[0.88rem]">
                Venda #{shortId} cancelada com sucesso.
              </strong>
              <p className="m-0 mt-0.5 text-[0.8rem]">
                {cancelNotice.units > 0
                  ? `Estoque restaurado: ${cancelNotice.units} ${cancelNotice.units === 1 ? 'unidade devolvida' : 'unidades devolvidas'}.`
                  : 'Estoque e financeiro estornados.'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="m-0 rounded-xl bg-[#fbe9e7] px-4 py-3 text-sm text-[#b3261e]" role="alert">
            {error}
          </p>
        )}
        
        <div className="flex flex-col gap-2">
          {!cancelled && (
            <button
              className={`min-h-12 w-full rounded-xl border border-[#b3261e] text-sm font-semibold text-[#b3261e] hover:bg-[#fbe9e7] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              disabled={isCancelling}
              onClick={onCancel}
              type="button"
            >
              Cancelar venda
            </button>
          )}
          <button
            className={`min-h-12 w-full rounded-xl bg-[#34452b] text-sm font-semibold text-[#faf8f3] transition-colors hover:bg-[#2a3823] motion-reduce:transition-none ${focusRing}`}
            onClick={onBack}
            type="button"
          >
            Voltar ao histórico
          </button>
        </div>
      </div>
    </article>
  )
}

function SalesHistoryPage({ onNavigate, onCancelSale, sales, setupData }: SalesHistoryPageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('7')
  const [saleToCancel, setSaleToCancel] = useState<SaleRecord | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cancelNotice, setCancelNotice] = useState<{ saleId: string; units: number } | null>(null)
  const [error, setError] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const filteredSales = useMemo(() => {
    if (period === 'all') return sales
    if (period === 'today') {
      return sales.filter(
        (sale) => new Date(sale.createdAt).toDateString() === new Date().toDateString(),
      )
    }
    const days = Number(period)
    const from = new Date()
    from.setDate(from.getDate() - days)
    return sales.filter((sale) => new Date(sale.createdAt) >= from)
  }, [period, sales])
  const selectedSale = selectedId ? (sales.find((sale) => sale.id === selectedId) ?? null) : null
  const activeSales = filteredSales.filter((sale) => sale.status !== 'CANCELADA')
  const total = activeSales.reduce((sum, sale) => sum + sale.total, 0)
  const openDetails = (saleId: string) => {
    setError('')
    setCancelNotice(null)
    setSelectedId(saleId)
    window.scrollTo({ top: 0 })
  }
  const closeDetails = () => {
    setSelectedId(null)
    setCancelNotice(null)
    setError('')
  }
  const handleCancel = async () => {
    if (!saleToCancel || isCancelling) return
    const target = saleToCancel
    setError('')
    setIsCancelling(true)
    try {
      await onCancelSale(target.id)
      setCancelNotice({
        saleId: target.id,
        units: target.items.reduce((count, item) => count + item.quantity, 0),
      })
      setSelectedId(target.id)
      setSaleToCancel(null)
      window.scrollTo({ top: 0 })
    } catch (cancelError) {
      setError(
        cancelError instanceof Error ? cancelError.message : 'Não foi possível cancelar a venda.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#faf8f3] font-sans text-[#1d1c19] min-[900px]:flex-row">
      <AppSidebar currentPage="vendas" onNavigate={onNavigate} userName={setupData.adminName} />

      <section className="mx-auto flex w-full min-w-0 max-w-240 flex-1 flex-col gap-5 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:gap-6 sm:px-6 sm:pt-6 sm:pb-24 min-[900px]:mx-0 min-[900px]:max-w-none min-[900px]:px-10 min-[900px]:pt-8 min-[900px]:pb-12 min-[900px]:*:max-w-240">
        {selectedSale ? (
          <SaleDetails
            cancelNotice={cancelNotice?.saleId === selectedSale.id ? cancelNotice : null}
            cancelled={
              selectedSale.status === 'CANCELADA' || cancelNotice?.saleId === selectedSale.id
            }
            error={error}
            isCancelling={isCancelling}
            onBack={closeDetails}
            onCancel={() => setSaleToCancel(selectedSale)}
            sale={selectedSale}
            sellerName={setupData.adminName}
          />
        ) : (
          <>

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
                <SalesPeriodFilter
                  onChange={setPeriod}
                  value={period}
                />
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
                        className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-[#e8e4d9] py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4 min-[900px]:rounded-lg min-[900px]:px-2 min-[900px]:py-4 min-[900px]:hover:bg-black/[0.025]"
                        key={sale.id}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-10 place-items-center rounded-[10px] bg-[#efece3] ${cancelled ? 'opacity-50' : ''}`}
                        >
                          <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                            <rect
                              height="14"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              width="20"
                              x="2"
                              y="5"
                            />
                            <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        </span>

                        <div className="min-w-0">
                          <strong
                            className={`block text-[0.95rem] ${cancelled ? 'opacity-50' : ''}`}
                          >
                            <button
                              aria-label={`Ver detalhes da venda #${sale.id.slice(-6)}`}
                              className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-[#1d1c19]"
                              onClick={() => openDetails(sale.id)}
                              type="button"
                            >
                              Venda #{sale.id.slice(-6)}
                            </button>
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
                            className="relative z-10 col-span-2 col-start-2 min-h-9 justify-self-start py-1 text-[0.8rem] font-semibold text-[#b3261e] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1c19] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:col-start-auto sm:justify-self-end sm:px-2"
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
          </>
        )}
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
