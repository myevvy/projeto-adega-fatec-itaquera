import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import SalesPeriodFilter from '../../components/sales-period-filter/SalesPeriodFilter'
import type { AppPath, SaleRecord, SalesPeriod, SetupData } from '../../types'

type SalesReportPageProps = {
  onNavigate: (path: AppPath) => void
  sales: SaleRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function SalesReportPage({
  onNavigate,
  sales,
  setupData,
}: SalesReportPageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('7')
  const filteredSales = useMemo(() => {
    if (period === 'all') return sales
    if (period === 'today') {
      return sales.filter(
        (sale) =>
          new Date(sale.createdAt).toDateString() === new Date().toDateString(),
      )
    }
    const from = new Date()
    from.setDate(from.getDate() - Number(period))
    return sales.filter((sale) => new Date(sale.createdAt) >= from)
  }, [period, sales])
  const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

  const exportReport = () => {
    const rows = [
      ['Venda', 'Data', 'Itens', 'Pagamento', 'Total'],
      ...filteredSales.map((sale) => [
        sale.id,
        new Date(sale.createdAt).toLocaleString('pt-BR'),
        String(sale.items.reduce((count, item) => count + item.quantity, 0)),
        sale.paymentMethod,
        sale.total.toFixed(2),
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((field) => `"${field.replaceAll('"', '""')}"`).join(';'),
      )
      .join('\n')
    const file = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio-de-vendas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main>
      <AppSidebar currentPage="vendas" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <button onClick={() => onNavigate('vendas')} type="button">
          ← Voltar
        </button>
        <header>
          <h1>Relatório de vendas</h1>
          <button onClick={exportReport} type="button">
            Exportar relatório
          </button>
        </header>
        <SalesPeriodFilter onChange={setPeriod} value={period} />
        <section aria-label="Resumo do período">
          <p>Vendas</p>
          <strong>{filteredSales.length}</strong>
          <p>Total</p>
          <strong>{formatCurrency(total)}</strong>
        </section>
        <section aria-labelledby="period-sales-heading">
          <h2 id="period-sales-heading">Vendas no período</h2>
          {filteredSales.length ? (
            <ul>
              {filteredSales.map((sale) => (
                <li key={sale.id}>
                  <div>
                    <strong>Venda #{sale.id.slice(-6)}</strong>
                    <p>
                      {sale.items.reduce((count, item) => count + item.quantity, 0)}{' '}
                      itens · {sale.paymentMethod} ·{' '}
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <strong>{formatCurrency(sale.total)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma venda registrada no período selecionado.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default SalesReportPage
