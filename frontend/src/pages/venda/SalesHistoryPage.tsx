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
  const total = filteredSales
    .filter((sale) => sale.status !== 'CANCELADA')
    .reduce((sum, sale) => sum + sale.total, 0)
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
    <main>
      <AppSidebar currentPage="vendas" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <header>
          <div>
            <h1>Histórico de Vendas</h1>
            <p>Consulte as vendas realizadas no período.</p>
          </div>
          <SalesPeriodFilter onChange={setPeriod} value={period} />
        </header>
        <section aria-label="Resumo das vendas">
          <article>
            <p>Vendas Realizadas</p>
            <strong>
              {filteredSales.filter((sale) => sale.status !== 'CANCELADA').length}{' '}
              vendas
            </strong>
          </article>
          <article>
            <p>Faturamento Total</p>
            <strong>{formatCurrency(total)}</strong>
          </article>
        </section>
        <section aria-labelledby="recent-sales-heading">
          <header>
            <h2 id="recent-sales-heading">Vendas Recentes</h2>
            <button onClick={() => onNavigate('vendas/relatorio')} type="button">
              Relatório de vendas
            </button>
            <button onClick={() => onNavigate('nova-venda')} type="button">
              + Nova venda
            </button>
          </header>
          {error && <p role="alert">{error}</p>}
          {filteredSales.length ? (
            <ul>
              {filteredSales.map((sale) => (
                <li key={sale.id}>
                  <span aria-hidden="true">↑</span>
                  <div>
                    <strong>Venda #{sale.id.slice(-6)}</strong>
                    <p>
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
                    {sale.status === 'CANCELADA' && <p>Cancelada</p>}
                  </div>
                  <strong>{formatCurrency(sale.total)}</strong>
                  {sale.status !== 'CANCELADA' && (
                    <button
                      disabled={isCancelling}
                      onClick={() => setSaleToCancel(sale)}
                      type="button"
                    >
                      Cancelar venda
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Nenhuma venda encontrada nesse período.{' '}
              <button onClick={() => onNavigate('nova-venda')} type="button">
                Registrar uma venda
              </button>
            </p>
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
