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
    <main className="min-h-screen bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
        <button
          className="inline-flex items-center gap-2 rounded-md text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => onNavigate('financeiro')}
          type="button"
        >
          <span aria-hidden="true">←</span> Voltar para financeiro
        </button>

        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Relatório de Despesas
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SalesPeriodFilter onChange={setPeriod} value={period} />
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99]"
              onClick={exportReport}
              type="button"
            >
              Exportar relatório
            </button>
          </div>
        </header>

        {error && (
          <p
            className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <section
          aria-label="Total de despesas"
          className="mt-6 rounded-2xl bg-soft px-5 py-5 sm:px-6"
        >
          <p className="text-sm text-muted">Total de Despesas no período</p>
          <strong className="mt-1 block text-3xl font-bold tracking-tight sm:text-4xl">
            {formatCurrency(total)}
          </strong>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <section
            aria-labelledby="expense-categories-heading"
            className="rounded-2xl border border-line bg-card p-5 sm:p-6 lg:col-span-2 lg:self-start"
          >
            <h2
              className="text-base font-semibold sm:text-lg"
              id="expense-categories-heading"
            >
              Por Categoria
            </h2>
            <ul className="mt-4 space-y-4">
              {categoryTotals.map(({ category, amount }) => {
                const percent =
                  total > 0 ? Math.round((amount / total) * 100) : 0
                return (
                  <li key={category}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="shrink-0 text-muted">
                        {formatCurrency(amount)} · {percent}%
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="mt-2 h-2 overflow-hidden rounded-full bg-soft"
                    >
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section
            aria-labelledby="expense-history-heading"
            className="rounded-2xl border border-line bg-card p-5 sm:p-6 lg:col-span-3"
          >
            <h2
              className="text-base font-semibold sm:text-lg"
              id="expense-history-heading"
            >
              Histórico Detalhado
            </h2>

            {filteredExpenses.length ? (
              <ul className="mt-2 divide-y divide-line">
                {filteredExpenses.map((expense) => (
                  <li
                    className="flex flex-wrap items-start gap-x-3 gap-y-3 py-4 sm:flex-nowrap sm:items-center"
                    key={expense.id}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-base font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    >
                      ↓
                    </span>

                    <div className="min-w-0 flex-1 basis-[calc(100%-3rem)] sm:basis-auto">
                      <strong className="block truncate text-sm font-semibold">
                        {expense.description}
                      </strong>
                      <p className="mt-0.5 text-xs text-muted">
                        {expense.category} ·{' '}
                        {new Date(
                          `${expense.paidAt}T12:00:00`,
                        ).toLocaleDateString('pt-BR')}
                      </p>
                      {expense.observation && (
                        <p className="mt-1 text-xs text-muted">
                          {expense.observation}
                        </p>
                      )}
                    </div>

                    <div className="ml-12 flex w-full items-center justify-between gap-3 sm:ml-0 sm:w-auto sm:justify-end">
                      <strong className="whitespace-nowrap text-sm font-semibold text-red-700 dark:text-red-300">
                        − {formatCurrency(expense.amount)}
                      </strong>
                      {expense.active !== false && (
                        <button
                          className="rounded-lg border border-line bg-field px-3 py-1.5 text-xs font-medium transition hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={isCancelling}
                          onClick={() => setExpenseToCancel(expense)}
                          type="button"
                        >
                          Estornar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl bg-soft px-4 py-6 text-center text-sm text-muted">
                Nenhuma despesa no período selecionado.
              </p>
            )}
          </section>
        </div>
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
