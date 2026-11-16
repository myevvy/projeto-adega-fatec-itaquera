import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, SaleRecord, SetupData } from '../../types'
import type { ExpenseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'

type DashboardPageProps = {
  onNavigate: (page: AppPath) => void
  expenses: ExpenseRecord[]
  products: Product[]
  sales: SaleRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function DashboardPage({
  onNavigate,
  expenses,
  products,
  sales,
  setupData,
}: DashboardPageProps) {
  const [search, setSearch] = useState('')
  const todaySales = sales.filter(
    (sale) =>
      sale.status !== 'CANCELADA' &&
      new Date(sale.createdAt).toDateString() === new Date().toDateString(),
  )
  const completedSales = sales.filter((sale) => sale.status !== 'CANCELADA')
  const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const expensesToday = expenses.filter(
    (expense) =>
      expense.active !== false &&
      new Date(`${expense.paidAt}T12:00:00`).toDateString() ===
        new Date().toDateString(),
  )
  const expensesTotal = expensesToday.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const activeProducts = products.filter((product) => product.active)
  const outOfStock = activeProducts.filter((product) => product.stock === 0)
  const lowStock = activeProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.minimumStock,
  )

  return (
    <main>
      <AppSidebar
        currentPage="dashboard"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <header>
          <div>
            <h1>Olá, {setupData.adminName || 'Marcos'}</h1>
            <p>{setupData.businessName || 'Adega Bom Sabor'}</p>
          </div>
          <label>
            <span>Buscar produto </span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto..."
              type="search"
              value={search}
            />
          </label>
          <button aria-label="Notificações" type="button">
            Notificações
          </button>
        </header>
        <button onClick={() => onNavigate('nova-venda')} type="button">
          <strong>Nova Venda</strong>
          <br />
          Registrar em poucos segundos →
        </button>
        <section aria-labelledby="daily-summary">
          <h2 id="daily-summary">Resumo de hoje</h2>
          <p>Faturamento: {formatCurrency(revenueToday)}</p>
          <p>Vendas hoje: {todaySales.length}</p>
          <p>Despesas: {formatCurrency(expensesTotal)}</p>
          <p>
            Resultado após despesas de hoje:{' '}
            {formatCurrency(revenueToday - expensesTotal)}
          </p>
          <small>
            Vendas menos despesas do dia; não inclui o custo dos produtos
            vendidos.
          </small>
        </section>
        <section aria-labelledby="stock-alerts">
          <h2 id="stock-alerts">Atenção ao estoque</h2>
          <ul>
            <li>{outOfStock.length} produtos zerados</li>
            <li>{lowStock.length} produtos com estoque baixo</li>
          </ul>
        </section>
        <section aria-labelledby="recent-sales">
          <h2 id="recent-sales">Últimas vendas</h2>
          <button onClick={() => onNavigate('vendas')} type="button">
            Ver tudo
          </button>
          {completedSales.length > 0 ? (
            <ul>
              {completedSales.slice(0, 3).map((sale, index) => (
                <li key={sale.id}>
                  <strong>Venda #{completedSales.length - index}</strong>
                  <p>
                    {sale.items.length
                      ? `${sale.items.reduce((count, item) => count + item.quantity, 0)} itens`
                      : 'Itens não detalhados'}{' '}
                    · {sale.paymentMethod}
                  </p>
                  <p>
                    {formatCurrency(sale.total)} ·{' '}
                    {new Date(sale.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma venda registrada. Crie uma nova venda para testar.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
