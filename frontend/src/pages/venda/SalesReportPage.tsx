import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getSalesReport } from '../../services/reportService'
import { downloadReportCsv } from '../../utils/reportExport'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { ReportPeriod, SalesReport } from '../../types/relatorios'
import {
  DonutChart,
  EmptyChart,
  ExportButton,
  HorizontalBars,
  LineChart,
  ReportCard,
  ReportDateRange,
  ReportFrame,
  ReportMetric,
  ReportNotice,
} from '../../components/reports/ReportComponents'

type SalesReportPageProps = {
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

const formatDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

function comparisonDetail(value: number | null) {
  if (value === null) return 'Sem vendas no período anterior para comparar'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}% vs. período anterior`
}

function SalesReportPage({ onNavigate, setupData }: SalesReportPageProps) {
  const { session } = useAuth()
  const [period, setPeriod] = useState(initialPeriod)
  const [result, setResult] = useState<
    | { key: string; report: SalesReport }
    | { key: string; error: string }
    | null
  >(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const requestKey = `${session?.token ?? ''}:${period.inicio}:${period.fim}:${refreshKey}`
  const currentResult = result?.key === requestKey ? result : null
  const report =
    currentResult && 'report' in currentResult ? currentResult.report : null
  const error =
    currentResult && 'error' in currentResult ? currentResult.error : ''
  const loading = Boolean(session?.token) && currentResult === null

  useEffect(() => {
    if (!session?.token) return
    let active = true
    getSalesReport(session.token, period)
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
                : 'Não foi possível carregar o relatório de vendas.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [period, requestKey, session?.token])

  const exportReport = () => {
    if (!report) return
    downloadReportCsv('relatorio-de-vendas.csv', [
      ['Resumo', 'Valor'],
      ['Período', `${report.periodo.inicio} a ${report.periodo.fim}`],
      ['Total de vendas', String(report.resumo.totalVendas)],
      ['Faturamento', report.resumo.faturamento.toFixed(2)],
      ['Produtos vendidos', String(report.resumo.produtosVendidos)],
      ['Ticket médio', report.resumo.ticketMedio.toFixed(2)],
      [],
      ['Vendas por dia', 'Vendas', 'Produtos', 'Faturamento'],
      ...report.graficos.vendasPorDia.map((item) => [
        item.data,
        String(item.totalVendas),
        String(item.produtosVendidos),
        item.faturamento.toFixed(2),
      ]),
      [],
      ['Produtos mais vendidos', 'Quantidade', 'Faturamento'],
      ...report.graficos.produtosMaisVendidos.map((item) => [
        item.produto,
        String(item.quantidadeVendida),
        item.faturamento.toFixed(2),
      ]),
      [],
      ['Forma de pagamento', 'Vendas', 'Faturamento'],
      ...report.graficos.vendasPorFormaPagamento.map((item) => [
        item.formaPagamento,
        String(item.totalVendas),
        item.faturamento.toFixed(2),
      ]),
    ])
  }

  const payments = report?.graficos.vendasPorFormaPagamento.map((item) => ({
    label: item.formaPagamento,
    value: item.totalVendas,
  }))

  return (
    <ReportFrame
      backPath="relatorios"
      currentPage="vendas"
      onNavigate={onNavigate}
      setupData={setupData}
      title="Relatório de vendas"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#747a6d]">
          Acompanhe faturamento, volume de vendas e produtos em destaque.
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
            aria-label="Indicadores de vendas"
            className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <ReportMetric
              detail={comparisonDetail(
                report.comparacao.totalVendas.variacaoPercentual,
              )}
              label="Vendas concluídas"
              value={report.resumo.totalVendas.toLocaleString('pt-BR')}
            />
            <ReportMetric
              detail={comparisonDetail(
                report.comparacao.faturamento.variacaoPercentual,
              )}
              label="Faturamento"
              value={currency(report.resumo.faturamento)}
            />
            <ReportMetric
              detail={comparisonDetail(
                report.comparacao.produtosVendidos.variacaoPercentual,
              )}
              label="Produtos vendidos"
              value={report.resumo.produtosVendidos.toLocaleString('pt-BR')}
            />
            <ReportMetric
              detail={`${report.periodo.quantidadeDias} dias selecionados`}
              label="Ticket médio"
              value={currency(report.resumo.ticketMedio)}
            />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <ReportCard
              description="Faturamento das vendas concluídas em cada dia"
              title="Histórico de vendas"
            >
              <LineChart
                data={report.graficos.vendasPorDia.map((item) => ({
                  label: formatDate(item.data).slice(0, 5),
                  value: item.faturamento,
                }))}
                formatValue={(value) =>
                  value.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  })
                }
              />
            </ReportCard>
            <ReportCard
              description="Participação por quantidade de vendas"
              title="Formas de pagamento"
            >
              {payments?.length ? (
                <DonutChart data={payments} formatValue={(value) => `${value} vendas`} />
              ) : (
                <EmptyChart />
              )}
            </ReportCard>
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-2">
            <ReportCard
              description="Produtos com maior quantidade vendida no período"
              title="Produtos mais vendidos"
            >
              <HorizontalBars
                data={report.graficos.produtosMaisVendidos.map((item) => ({
                  label: item.produto,
                  value: item.quantidadeVendida,
                }))}
                formatValue={(value) => `${value} un.`}
              />
            </ReportCard>
            <ReportCard
              description={`Comparação com ${formatDate(report.comparacao.periodoAnterior.inicio)} a ${formatDate(report.comparacao.periodoAnterior.fim)}`}
              title="Desempenho do período"
            >
              <div className="space-y-4">
                {[
                  {
                    label: 'Faturamento',
                    comparison: report.comparacao.faturamento,
                    format: currency,
                  },
                  {
                    label: 'Vendas',
                    comparison: report.comparacao.totalVendas,
                    format: (value: number) => value.toLocaleString('pt-BR'),
                  },
                  {
                    label: 'Produtos vendidos',
                    comparison: report.comparacao.produtosVendidos,
                    format: (value: number) => value.toLocaleString('pt-BR'),
                  },
                ].map(({ label, comparison, format }) => {
                  const amount = comparison.variacaoPercentual
                  const isPositive = comparison.diferenca >= 0
                  return (
                    <div
                      className="flex items-center justify-between gap-4 rounded-xl bg-[#f7f8f4] px-4 py-3"
                      key={label}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#41483a]">
                          {label}
                        </p>
                        <p className="mt-1 text-xs text-[#81877b]">
                          Atual: {format(comparison.atual)}
                          {' · '}Anterior:{' '}
                          {format(comparison.anterior)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isPositive
                            ? 'bg-[#e6eddd] text-[#3b5b2b]'
                            : 'bg-[#f6e5df] text-[#995338]'
                        }`}
                      >
                        {amount === null
                          ? 'Sem base'
                          : `${amount > 0 ? '+' : ''}${amount.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ReportCard>
          </section>
        </>
      )}
    </ReportFrame>
  )
}

export default SalesReportPage
