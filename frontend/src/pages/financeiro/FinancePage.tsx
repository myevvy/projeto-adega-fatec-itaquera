import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import FinancePeriodFilter from '../../components/finance-period-filter/FinancePeriodFilter'
import type {
  AppPath,
  ExpenseRecord,
  SalesPeriod,
  SaleRecord,
  SetupData,
} from '../../types'

type FinancePageProps = {
  expenses: ExpenseRecord[]
  onNavigate: (path: AppPath) => void
  sales: SaleRecord[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function isWithinPeriod(date: Date, period: SalesPeriod) {
  const now = new Date()
  if (period === 'today') {
    return date.toDateString() === now.toDateString()
  }
  const days = Number(period)
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return date >= start && date <= now
}

function FinancePage({
  expenses,
  onNavigate,
  sales,
  setupData,
}: FinancePageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('today')
  const filteredSales = useMemo(
    () => sales.filter((sale) => isWithinPeriod(new Date(sale.createdAt), period)),
    [period, sales],
  )
  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        isWithinPeriod(new Date(`${expense.paidAt}T12:00:00`), period),
      ),
    [expenses, period],
  )
  const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const expenseTotal = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const profit = revenue - expenseTotal
  const averageTicket = filteredSales.length
    ? revenue / filteredSales.length
    : 0
  const expenseGroups = [
    'Fixa (contas, aluguel)',
    'Compras de fornecedores',
    'Outras despesas',
  ] as const
  const categories = expenseGroups.map((category) => {
    const amount = filteredExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return { category, amount }
  })
  const maxAmount = Math.max(
    revenue,
    expenseTotal,
    ...filteredSales.map((sale) => sale.total),
    1,
  )
  const days = period === 'today' ? 1 : Number(period)
  const dailyTotals = Array.from({ length: Math.min(days, 7) }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (Math.min(days, 7) - 1 - index))
    const salesForDay = filteredSales.filter(
      (sale) => new Date(sale.createdAt).toDateString() === day.toDateString(),
    )
    const expensesForDay = filteredExpenses.filter(
      (expense) => new Date(`${expense.paidAt}T12:00:00`).toDateString() === day.toDateString(),
    )
    return {
      label: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
      revenue: salesForDay.reduce((sum, sale) => sum + sale.total, 0),
      expense: expensesForDay.reduce((sum, expense) => sum + expense.amount, 0),
    }
  })
  const movements = [
    ...filteredSales.map((sale) => ({
      id: `sale-${sale.id}`,
      title: `Venda #${sale.id.slice(-6)}`,
      detail: `Entrada · Venda · ${new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      amount: sale.total,
    })),
    ...filteredExpenses.map((expense) => ({
      id: `expense-${expense.id}`,
      title: expense.description,
      detail: `Despesa · ${expense.category} · ${new Date(`${expense.paidAt}T12:00:00`).toLocaleDateString('pt-BR')}`,
      amount: -expense.amount,
    })),
  ].sort((a, b) => b.id.localeCompare(a.id))

  return (
    <main>
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <header>
          <h1>Financeiro</h1>
          <FinancePeriodFilter onChange={setPeriod} value={period} />
        </header>
        <section aria-label="Resumo financeiro">
          <article>
            <p>Faturamento</p>
            <strong>{formatCurrency(revenue)}</strong>
          </article>
          <article>
            <p>Despesas</p>
            <strong>{formatCurrency(expenseTotal)}</strong>
          </article>
          <article>
            <p>Lucro bruto</p>
            <strong>{formatCurrency(profit)}</strong>
          </article>
          <article>
            <p>Ticket médio</p>
            <strong>{formatCurrency(averageTicket)}</strong>
          </article>
        </section>
        <nav aria-label="Ações financeiras">
          <button onClick={() => onNavigate('financeiro/despesas/nova')} type="button">
            + Registrar despesa
          </button>
          <button
            onClick={() => onNavigate('financeiro/despesas/relatorio')}
            type="button"
          >
            Relatório de despesas
          </button>
        </nav>
        <section aria-labelledby="revenue-expenses-heading">
          <h2 id="revenue-expenses-heading">
            Receita x Despesa ({dailyTotals.length} dias)
          </h2>
          <p>🟢 Receita · ⚫ Despesa</p>
          {dailyTotals.map((day) => (
            <div key={day.label}>
              <span>{day.label} </span>
              <progress
                aria-label={`Receita ${day.label}`}
                max={maxAmount}
                value={day.revenue}
              />
              <progress
                aria-label={`Despesa ${day.label}`}
                max={maxAmount}
                value={day.expense}
              />
              <span>
                {formatCurrency(day.revenue)} / {formatCurrency(day.expense)}
              </span>
            </div>
          ))}
        </section>
        <section aria-labelledby="expenses-category-heading">
          <h2 id="expenses-category-heading">Despesas por categoria</h2>
          {categories.map(({ category, amount }) => (
            <p key={category}>
              {category}: {formatCurrency(amount)}
              {expenseTotal > 0
                ? ` · ${Math.round((amount / expenseTotal) * 100)}%`
                : ' · 0%'}
            </p>
          ))}
        </section>
        <section aria-labelledby="financial-movements-heading">
          <header>
            <h2 id="financial-movements-heading">Movimentações</h2>
            <button
              onClick={() => onNavigate('financeiro/despesas/nova')}
              type="button"
            >
              + Nova despesa
            </button>
          </header>
          {movements.length ? (
            <ul>
              {movements.map((movement) => (
                <li key={movement.id}>
                  <div>
                    <strong>{movement.title}</strong>
                    <p>{movement.detail}</p>
                  </div>
                  <strong>
                    {movement.amount > 0 ? '+' : '−'}{' '}
                    {formatCurrency(Math.abs(movement.amount))}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Sem movimentações para o período selecionado.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default FinancePage
