import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import SalesPeriodFilter from '../../components/sales-period-filter/SalesPeriodFilter'
import type {
  AppPath,
  ExpenseRecord,
  SalesPeriod,
  SetupData,
} from '../../types'

type ExpenseReportPageProps = {
  expenses: ExpenseRecord[]
  onCancelExpense: (expenseId: string) => Promise<void>
  onNavigate: (path: AppPath) => void
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ExpenseReportPage({
  expenses,
  onCancelExpense,
  onNavigate,
  setupData,
}: ExpenseReportPageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('7')
  const [expenseToCancel, setExpenseToCancel] = useState<ExpenseRecord | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const filteredExpenses = useMemo(() => {
    const activeExpenses = expenses.filter((expense) => expense.active !== false)
    if (period === 'all') return activeExpenses
    if (period === 'today') {
      return activeExpenses.filter(
        (expense) =>
          new Date(`${expense.paidAt}T12:00:00`).toDateString() ===
          new Date().toDateString(),
      )
    }
    const from = new Date()
    from.setDate(from.getDate() - Number(period))
    return activeExpenses.filter(
      (expense) => new Date(`${expense.paidAt}T12:00:00`) >= from,
    )
  }, [expenses, period])
  const total = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const handleCancel = async () => {
    if (!expenseToCancel || isCancelling) return
    setError('')
    setIsCancelling(true)
    try {
      await onCancelExpense(expenseToCancel.id)
      setExpenseToCancel(null)
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Não foi possível estornar a despesa.',
      )
    } finally {
      setIsCancelling(false)
    }
  }
  const categories = [...new Set(expenses.map((expense) => expense.category))]
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
        {error && <p role="alert">{error}</p>}
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
                  {expense.active !== false && (
                    <button
                      disabled={isCancelling}
                      onClick={() => setExpenseToCancel(expense)}
                      type="button"
                    >
                      Estornar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma despesa no período selecionado.</p>
          )}
        </section>
      </section>
      {expenseToCancel && (
        <ConfirmDialog
          description="O estorno ficará registrado no banco e removerá esta despesa dos totais financeiros."
          onCancel={() => setExpenseToCancel(null)}
          onConfirm={() => void handleCancel()}
          title={isCancelling ? 'Estornando despesa...' : 'Estornar despesa?'}
        />
      )}
    </main>
  )
}

export default ExpenseReportPage
