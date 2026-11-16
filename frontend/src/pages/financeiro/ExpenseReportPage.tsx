import { useEffect, useState } from 'react'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import {
  DonutChart,
  EmptyChart,
  ExportButton,
  HorizontalBars,
  ReportCard,
  ReportDateRange,
  ReportFrame,
  ReportMetric,
  ReportNotice,
} from '../../components/reports/ReportComponents'
import { useAuth } from '../../hooks/useAuth'
import { getExpenseReport } from '../../services/reportService'
import { downloadReportCsv } from '../../utils/reportExport'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { ExpenseReport, ReportPeriod } from '../../types/relatorios'

type ExpenseReportPageProps = {
  onCancelExpense: (expenseId: string) => Promise<void>
  onNavigate: (path: AppPath) => void
  setupData: SetupData
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const localDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialPeriod = (): ReportPeriod => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  return { inicio: localDate(start), fim: localDate(end) }
}

function ExpenseReportPage({
  onCancelExpense,
  onNavigate,
  setupData,
}: ExpenseReportPageProps) {
  const { session } = useAuth()
  const [period, setPeriod] = useState(initialPeriod)
  const [result, setResult] = useState<
    | { key: string; report: ExpenseReport }
    | { key: string; error: string }
    | null
  >(null)
  const [cancelError, setCancelError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [expenseToCancel, setExpenseToCancel] = useState<number | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const requestKey = `${session?.token ?? ''}:${period.inicio}:${period.fim}:${refreshKey}`
  const currentResult = result?.key === requestKey ? result : null
  const report =
    currentResult && 'report' in currentResult ? currentResult.report : null
  const error =
    cancelError ||
    (currentResult && 'error' in currentResult ? currentResult.error : '')
  const loading = Boolean(session?.token) && currentResult === null

  useEffect(() => {
    if (!session?.token) return
    let active = true
    getExpenseReport(session.token, period)
      .then((reportResult) => {
        if (active) setResult({ key: requestKey, report: reportResult })
      })
      .catch((requestError: unknown) => {
        if (active) {
          setResult({
            key: requestKey,
            error:
              requestError instanceof Error
                ? requestError.message
                : 'Não foi possível carregar o relatório de despesas.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [period, requestKey, session?.token])

  const handleCancel = async () => {
    if (expenseToCancel === null || isCancelling) return
    setIsCancelling(true)
    setCancelError('')
    try {
      await onCancelExpense(String(expenseToCancel))
      setExpenseToCancel(null)
      setRefreshKey((key) => key + 1)
    } catch (cancelError) {
      setCancelError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Não foi possível estornar a despesa.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const exportReport = () => {
    if (!report) return
    downloadReportCsv('relatorio-de-despesas.csv', [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Forma de pagamento', 'Compra', 'Responsável'],
      ...report.historico.map((expense) => [
        expense.data,
        expense.descricao,
        expense.categoria,
        expense.valor.toFixed(2),
        expense.formaPagamento ?? 'Não informado',
        expense.compraId === null ? '' : String(expense.compraId),
        expense.usuario,
      ]),
    ])
  }

  return (
    <ReportFrame
      backPath="relatorios"
      currentPage="financeiro"
      onNavigate={onNavigate}
      setupData={setupData}
      title="Relatório de despesas"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#747a6d]">
          Despesas ativas agrupadas por categoria e período.
        </p>
        <ExportButton disabled={!report || loading} onClick={exportReport} />
      </div>
      <div className="mb-6">
        <ReportDateRange
          initialPeriod={period}
          loading={loading}
          onApply={setPeriod}
        />
      </div>
      <div className="mb-6">
        <ReportNotice
          error={error}
          loading={loading}
          onRetry={() => setRefreshKey((key) => key + 1)}
        />
      </div>

      {report && !loading && (
        <>
          <section
            aria-label="Resumo de despesas"
            className="mb-6 grid gap-4 sm:grid-cols-2"
          >
            <ReportMetric
              label="Total de despesas no período"
              value={currency(report.resumo.totalDespesas)}
              detail="Despesas estornadas não são contabilizadas"
            />
            <ReportMetric
              label="Lançamentos"
              value={report.resumo.totalLancamentos.toLocaleString('pt-BR')}
              detail={`${report.periodo.inicio.split('-').reverse().join('/')} a ${report.periodo.fim.split('-').reverse().join('/')}`}
            />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-2">
            <ReportCard
              description="Participação de cada categoria no valor total"
              title="Despesas por categoria"
            >
              {report.graficos.despesasPorCategoria.length ? (
                <DonutChart
                  data={report.graficos.despesasPorCategoria.map((item) => ({
                    label: item.categoria,
                    value: item.totalDespesas,
                  }))}
                  formatValue={currency}
                />
              ) : (
                <EmptyChart />
              )}
            </ReportCard>
            <ReportCard
              description="Valores totais e percentual no período selecionado"
              title="Distribuição por categoria"
            >
              {report.graficos.despesasPorCategoria.length ? (
                <div className="space-y-5">
                  <HorizontalBars
                    data={report.graficos.despesasPorCategoria.map((item) => ({
                      label: item.categoria,
                      value: item.totalDespesas,
                    }))}
                    formatValue={currency}
                  />
                  <ul className="divide-y divide-[#eff0eb]">
                    {report.graficos.despesasPorCategoria.map((item) => (
                      <li
                        className="flex items-center justify-between gap-4 py-2.5 text-xs"
                        key={item.categoriaId}
                      >
                        <span className="text-[#68705e]">
                          {item.totalLancamentos} lançamento(s)
                        </span>
                        <strong className="text-[#39452d]">
                          {item.percentual.toLocaleString('pt-BR', {
                            maximumFractionDigits: 1,
                          })}
                          %
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyChart />
              )}
            </ReportCard>
          </section>

          <ReportCard
            description="Somente despesas não estornadas no intervalo escolhido"
            title="Histórico detalhado"
          >
            {report.historico.length ? (
              <ul className="divide-y divide-[#eff0eb]">
                {report.historico.map((expense) => (
                  <li
                    className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0 sm:flex-nowrap"
                    key={expense.id}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f7ebe6] text-[#b66d50]"
                    >
                      ↓
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#343a2f]">
                        {expense.descricao}
                      </p>
                      <p className="mt-1 text-xs text-[#858a80]">
                        {expense.categoria} ·{' '}
                        {new Date(`${expense.data}T12:00:00`).toLocaleDateString(
                          'pt-BR',
                        )}
                        {expense.compraId !== null &&
                          ` · Compra #${expense.compraId}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong className="whitespace-nowrap text-sm text-[#ad6047]">
                        − {currency(expense.valor)}
                      </strong>
                      <button
                        className="rounded-lg border border-[#e5e3db] px-3 py-2 text-xs font-semibold text-[#68705e] transition hover:bg-[#f7f6f1] disabled:opacity-50"
                        disabled={isCancelling}
                        onClick={() => setExpenseToCancel(expense.id)}
                        type="button"
                      >
                        Estornar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyChart message="Nenhuma despesa registrada no período selecionado." />
            )}
          </ReportCard>
        </>
      )}
      {expenseToCancel !== null && (
        <ConfirmDialog
          description="O estorno ficará registrado no banco e removerá esta despesa dos totais do relatório."
          onCancel={() => {
            if (!isCancelling) setExpenseToCancel(null)
          }}
          onConfirm={() => void handleCancel()}
          title={isCancelling ? 'Estornando despesa…' : 'Estornar despesa?'}
        />
      )}
    </ReportFrame>
  )
}

export default ExpenseReportPage
