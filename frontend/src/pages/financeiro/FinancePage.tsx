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

type Movement = {
  id: string
  kind: 'sale' | 'expense'
  title: string
  subtitle: string
  when: string
  timestamp: number
  amount: number
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

function sumMoney(values: number[]) {
  const cents = values.reduce(
    (sum, value) => sum + Math.round(value * 100),
    0,
  )
  return cents / 100
}

function isWithinPeriod(date: Date, period: SalesPeriod) {
  if (period === 'all') return true

  const now = new Date()
  if (period === 'today') {
    return date.toDateString() === now.toDateString()
  }
  const days = Number(period)
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return date >= start && date <= now
}

const iconProps = {
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
  viewBox: '0 0 24 24',
}

function ArrowUpIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

function ArrowDownIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}

function FinancePage({
  expenses,
  onNavigate,
  sales,
  setupData,
}: FinancePageProps) {
  const [period, setPeriod] = useState<SalesPeriod>('all')
  const todayString = new Date().toDateString()

  const filteredSales = useMemo(
    () =>
      sales.filter(
        (sale) =>
          sale.status !== 'CANCELADA' &&
          isWithinPeriod(new Date(sale.createdAt), period),
      ),
    [period, sales],
  )
  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          expense.active !== false &&
          isWithinPeriod(new Date(`${expense.paidAt}T12:00:00`), period),
      ),
    [expenses, period],
  )

  const revenue = sumMoney(filteredSales.map((sale) => sale.total))
  const expenseTotal = sumMoney(
    filteredExpenses.map((expense) => expense.amount),
  )
  const resultAfterExpenses = revenue - expenseTotal
  const averageTicket = filteredSales.length
    ? revenue / filteredSales.length
    : 0
  const margin =
    revenue > 0 ? Math.round((resultAfterExpenses / revenue) * 100) : 0

  const periodLabel =
    period === 'today'
      ? 'hoje'
      : period === 'all'
        ? 'todo o período'
        : `${period} dias`

  const expenseGroups = [
    ...new Set(filteredExpenses.map((expense) => expense.category)),
  ]
  const categories = expenseGroups
    .map((category) => {
      const amount = sumMoney(
        filteredExpenses
          .filter((expense) => expense.category === category)
          .map((expense) => expense.amount),
      )
      const percent =
        expenseTotal > 0 ? Math.round((amount / expenseTotal) * 100) : 0
      return { category, amount, percent }
    })
    .sort((a, b) => b.amount - a.amount)

  const days = period === 'today' ? 1 : period === 'all' ? 7 : Number(period)
  const dailyTotals = Array.from({ length: Math.min(days, 7) }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (Math.min(days, 7) - 1 - index))
    const salesForDay = filteredSales.filter(
      (sale) => new Date(sale.createdAt).toDateString() === day.toDateString(),
    )
    const expensesForDay = filteredExpenses.filter(
      (expense) =>
        new Date(`${expense.paidAt}T12:00:00`).toDateString() ===
        day.toDateString(),
    )
    return {
      label: day
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', ''),
      revenue: sumMoney(salesForDay.map((sale) => sale.total)),
      expense: sumMoney(expensesForDay.map((expense) => expense.amount)),
    }
  })
  const chartMax = Math.max(
    1,
    ...dailyTotals.flatMap((day) => [day.revenue, day.expense]),
  )
  const barHeight = (value: number) =>
    `${value > 0 ? Math.max((value / chartMax) * 100, 3) : 0}%`

  const movements: Movement[] = [
    ...filteredSales.map((sale): Movement => {
      const date = new Date(sale.createdAt)
      const time = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return {
        id: `sale-${sale.id}`,
        kind: 'sale',
        title: `Venda #${sale.id.slice(-6)}`,
        subtitle: 'Entrada · Venda',
        when:
          date.toDateString() === todayString
            ? time
            : `${date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })} ${time}`,
        timestamp: date.getTime(),
        amount: sale.total,
      }
    }),
    ...filteredExpenses.map((expense): Movement => {
      const date = new Date(`${expense.paidAt}T12:00:00`)
      return {
        id: `expense-${expense.id}`,
        kind: 'expense',
        title: expense.description,
        subtitle: `Despesa · ${expense.category}`,
        when:
          date.toDateString() === todayString
            ? 'Hoje'
            : date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              }),
        timestamp: date.getTime(),
        amount: expense.amount,
      }
    }),
  ].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto flex w-full min-w-0 max-w-md flex-col px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-5 min-[380px]:pt-8 sm:max-w-2xl sm:px-6 md:pt-10 lg:max-w-6xl lg:flex-1 lg:px-8 lg:pb-10 xl:px-12">
        <header className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 truncate text-2xl font-bold lg:text-3xl">
            Financeiro
          </h1>
          <div className="shrink-0">
            <FinancePeriodFilter onChange={setPeriod} value={period} />
          </div>
        </header>

        <div className="mt-5 flex flex-col gap-6 lg:mt-7 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-8">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
            <section
              aria-label="Resumo financeiro"
              className="order-1 rounded-3xl bg-[#3b4a2b] px-5 py-5 text-white sm:px-7 sm:py-6 lg:order-none"
            >
              <p className="text-sm text-white/70">Lucro bruto do período</p>
              <p
                className={`mt-2 break-words text-3xl font-bold tracking-tight min-[380px]:text-4xl sm:text-5xl ${
                  resultAfterExpenses < 0 ? 'text-[#f2b8a0]' : ''
                }`}
              >
                {formatCurrency(resultAfterExpenses)}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-white/80 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                  Faturamento {formatCurrency(revenue)}
                </span>
                <span className="flex items-center gap-1.5">
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                  Despesas {formatCurrency(expenseTotal)}
                </span>
              </div>
              <p className="mt-3 text-xs text-white/55">
                Faturamento menos despesas; não inclui o custo dos produtos
                vendidos.
              </p>
            </section>

            <nav aria-label="Ações financeiras" className="order-2 lg:order-none">
              <button
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b4a2b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] focus-visible:ring-offset-2 ${focusRing}`}
                onClick={() => onNavigate('financeiro/despesas/nova')}
                type="button"
              >
                <span aria-hidden="true" className="text-[#9cc177]">
                  +
                </span>
                Registrar despesa
              </button>
            </nav>

            <section
              aria-label="Indicadores"
              className="order-4 grid grid-cols-2 gap-3 lg:order-none"
            >
              <article className="min-w-0 rounded-2xl bg-[#e3e9db] p-4 sm:p-5">
                <p className="text-sm text-[#4b4d42]">Ticket médio</p>
                <strong className="mt-2 block break-words text-xl font-bold min-[380px]:text-2xl sm:text-3xl">
                  {formatCurrency(averageTicket)}
                </strong>
              </article>
              <article className="min-w-0 rounded-2xl bg-[#e3e9db] p-4 sm:p-5">
                <p className="text-sm text-[#4b4d42]">Margem de lucro</p>
                <strong
                  className={`mt-2 block text-xl font-bold min-[380px]:text-2xl sm:text-3xl ${
                    margin < 0 ? 'text-[#c8704d]' : 'text-[#3f6a2c]'
                  }`}
                >
                  {margin}%
                </strong>
              </article>
            </section>

            <section
              aria-labelledby="financial-movements-heading"
              className="order-3 lg:order-none"
            >
              <h2
                className="text-base font-bold sm:text-lg"
                id="financial-movements-heading"
              >
                Movimentações
              </h2>
              {movements.length ? (
                <ul className="mt-2 divide-y divide-[#e3dfd2] sm:mt-3 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#e3dfd2] sm:bg-white sm:px-4">
                  {movements.map((movement) => {
                    const isSale = movement.kind === 'sale'
                    return (
                      <li
                        className="flex items-center gap-3 py-3.5"
                        key={movement.id}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isSale
                              ? 'bg-[#e3e9db] text-[#3b4a2b]'
                              : 'bg-[#f6e2da] text-[#c8704d]'
                          }`}
                        >
                          {isSale ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold">
                            {movement.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[#6f6b60]">
                            {movement.subtitle}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-[15px] font-semibold ${
                              isSale ? 'text-[#4f7d3a]' : 'text-[#c8704d]'
                            }`}
                          >
                            {isSale ? '+' : '−'}{' '}
                            {formatCurrency(Math.abs(movement.amount))}
                          </p>
                          <p className="mt-0.5 text-xs text-[#8a8678]">
                            {movement.when}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="mt-3 rounded-2xl border border-dashed border-[#d6d1c0] bg-white px-4 py-6 text-center text-sm text-[#6f6b60]">
                  Sem movimentações para o período selecionado.
                </p>
              )}
            </section>
          </div>

          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-6">
            <section
              aria-labelledby="revenue-expenses-heading"
              className="order-5 min-w-0 sm:rounded-2xl sm:border sm:border-[#e3dfd2] sm:bg-white sm:p-5 lg:order-none"
            >
              <h2
                className="text-base font-bold sm:text-lg"
                id="revenue-expenses-heading"
              >
                Receita x Despesa (
                {pluralize(dailyTotals.length, 'dia', 'dias')})
              </h2>
              <p className="mt-2 flex gap-4 text-xs text-[#6f6b60]">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#5f8a4b]"
                  />
                  Receita
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#c8704d]"
                  />
                  Despesa
                </span>
              </p>
              <ul className="mt-4 flex items-end gap-1 sm:gap-2">
                {dailyTotals.map((day, index) => (
                  <li
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    key={`${day.label}-${index}`}
                  >
                    <span className="sr-only">
                      {`${day.label}: receita ${formatCurrency(day.revenue)}, despesa ${formatCurrency(day.expense)}`}
                    </span>
                    <div
                      aria-hidden="true"
                      className="flex h-28 w-full items-end justify-center gap-1 sm:h-36 lg:h-44"
                      title={`${day.label}: ${formatCurrency(day.revenue)} / ${formatCurrency(day.expense)}`}
                    >
                      <span
                        className="w-2.5 rounded-t-sm bg-[#5f8a4b] sm:w-3.5"
                        style={{ height: barHeight(day.revenue) }}
                      />
                      <span
                        className="w-2.5 rounded-t-sm bg-[#c8704d] sm:w-3.5"
                        style={{ height: barHeight(day.expense) }}
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-[10px] capitalize text-[#8a8678] sm:text-xs"
                    >
                      {day.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="expenses-category-heading"
              className="order-6 min-w-0 sm:rounded-2xl sm:border sm:border-[#e3dfd2] sm:bg-white sm:p-5 lg:order-none"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2
                  className="text-base font-bold sm:text-lg"
                  id="expenses-category-heading"
                >
                  Despesas por categoria · {periodLabel}
                </h2>
                <button
                  className={`rounded-lg text-sm text-[#4b4d42] underline-offset-4 hover:underline ${focusRing}`}
                  onClick={() => onNavigate('financeiro/despesas/relatorio')}
                  type="button"
                >
                  Relatório de despesas
                </button>
              </div>
              <p className="mt-1 text-xs text-[#6f6b60] sm:text-sm">
                Total {formatCurrency(expenseTotal)}
              </p>

              {categories.length ? (
                <ul className="mt-4 space-y-4">
                  {categories.map(({ category, amount, percent }) => (
                    <li key={category}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{category}</span>
                        <span className="shrink-0 tabular-nums text-[#4b4d42]">
                          {formatCurrency(amount)} · {percent}%
                        </span>
                      </div>
                      <div
                        aria-label={`${category}: ${percent}%`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={percent}
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ebe8dd]"
                        role="progressbar"
                      >
                        <div
                          className={`h-full rounded-full ${
                            /^outras/i.test(category)
                              ? 'bg-[#b4b0a3]'
                              : 'bg-[#3b4a2b]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-[#8a8678]">
                  Nenhuma despesa no período selecionado.
                </p>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FinancePage
