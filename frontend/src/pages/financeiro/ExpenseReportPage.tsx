import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import SalesPeriodFilter from '../../components/sales-period-filter/SalesPeriodFilter'
import type {
  AppPath,
  ExpenseCategory,
  ExpenseRecord,
  SalesPeriod,
  SetupData,
} from '../../types'

type ExpenseReportPageProps = {
  expenses: ExpenseRecord[]
  onNavigate: (path: AppPath) => void
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const categories: ExpenseCategory[] = [
  'Fixa (contas, aluguel)',
  'Compras de fornecedores',
  'Outras despesas',
]

function ExpenseReportPage({
  expenses,
  onNavigate,
  setupData,
}: ExpenseReportPageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('7')
  const filteredExpenses = useMemo(() => {
    if (period === 'all') return expenses
    if (period === 'today') {
      return expenses.filter(
        (expense) =>
          new Date(`${expense.paidAt}T12:00:00`).toDateString() ===
          new Date().toDateString(),
      )
    }
    const from = new Date()
    from.setDate(from.getDate() - Number(period))
    return expenses.filter(
      (expense) => new Date(`${expense.paidAt}T12:00:00`) >= from,
    )
  }, [expenses, period])
  const total = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const categoryTotals = categories.map((category) => ({
    category,
    amount: filteredExpenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }))

  const exportReport = () => {
    const rows = [
      ['Descrição', 'Categoria', 'Data do pagamento', 'Valor', 'Observação'],
      ...filteredExpenses.map((expense) => [
        expense.description,
        expense.category,
        expense.paidAt,
        expense.amount.toFixed(2),
        expense.observation,
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
    link.download = 'relatorio-de-despesas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main>
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <button onClick={() => onNavigate('financeiro')} type="button">
          ← Voltar para financeiro
        </button>
        <header>
          <h1>Relatório de Despesas</h1>
          <SalesPeriodFilter onChange={setPeriod} value={period} />
          <button onClick={exportReport} type="button">
            Exportar relatório
          </button>
        </header>
        <section aria-label="Total de despesas">
          <p>Total de Despesas no período</p>
          <strong>{formatCurrency(total)}</strong>
        </section>
        <section aria-labelledby="expense-categories-heading">
          <h2 id="expense-categories-heading">Por Categoria</h2>
          {categoryTotals.map(({ category, amount }) => (
            <p key={category}>
              {category} — {formatCurrency(amount)}
              {total > 0 ? ` · ${Math.round((amount / total) * 100)}%` : ' · 0%'}
            </p>
          ))}
        </section>
        <section aria-labelledby="expense-history-heading">
          <h2 id="expense-history-heading">Histórico Detalhado</h2>
          {filteredExpenses.length ? (
            <ul>
              {filteredExpenses.map((expense) => (
                <li key={expense.id}>
                  <span aria-hidden="true">↓</span>
                  <div>
                    <strong>{expense.description}</strong>
                    <p>
                      {expense.category} ·{' '}
                      {new Date(`${expense.paidAt}T12:00:00`).toLocaleDateString(
                        'pt-BR',
                      )}
                    </p>
                    {expense.observation && <p>{expense.observation}</p>}
                  </div>
                  <strong>− {formatCurrency(expense.amount)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma despesa no período selecionado.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default ExpenseReportPage
