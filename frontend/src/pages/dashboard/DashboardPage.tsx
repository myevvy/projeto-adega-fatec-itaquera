import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, SaleRecord, SetupData } from '../../types'

type DashboardPageProps = {
  onNavigate: (page: AppPath) => void
  sales: SaleRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function DashboardPage({ onNavigate, sales, setupData }: DashboardPageProps) {
  const [search, setSearch] = useState('')
  const todaySales = sales.filter(
    (sale) =>
      new Date(sale.createdAt).toDateString() === new Date().toDateString(),
  )
  const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0)

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
          <p>Despesas: —</p>
          <p>Lucro bruto: —</p>
        </section>
        <section aria-labelledby="stock-alerts">
          <h2 id="stock-alerts">Atenção ao estoque</h2>
          <ul>
            <li>1 produto zerado</li>
            <li>3 produtos com estoque baixo</li>
          </ul>
        </section>
        <section aria-labelledby="recent-sales">
          <h2 id="recent-sales">Últimas vendas</h2>
          <button onClick={() => onNavigate('vendas')} type="button">
            Ver tudo
          </button>
          {sales.length > 0 ? (
            <ul>
              {sales.slice(0, 3).map((sale, index) => (
                <li key={sale.id}>
                  <strong>Venda #{sales.length - index}</strong>
                  <p>
                    {sale.items.reduce((count, item) => count + item.quantity, 0)}{' '}
                    itens · {sale.paymentMethod}
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
