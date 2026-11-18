import { useEffect, useState } from 'react'
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
import { useAuth } from '../../hooks/useAuth'
import { getSalesReport } from '../../services/reportService'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { ReportPeriod, SalesReport } from '../../types/relatorios'
import { downloadReportCsv } from '../../utils/reportExport'

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

const formatVariation = (variation: number | null) => {
  if (variation === null) return 'Sem período anterior'
  const prefix = variation > 0 ? '+' : ''
  return `${prefix}${variation.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`
}

function SalesReportPage({
  onNavigate,
  setupData,
}: SalesReportPageProps) {
  const { session } = useAuth()
  const [period, setPeriod] = useState(initialPeriod)
  const [result, setResult] = useState<
    | { key: string; report: SalesReport }
    | { key: string; error: string }
    | null
  >(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const requestKey =
    `${session?.token ?? ''}:${period.inicio}:${period.fim}:${refreshKey}`
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
      ['Data', 'Vendas', 'Faturamento', 'Produtos vendidos'],
      ...report.graficos.vendasPorDia.map((point) => [
        point.data,
        String(point.totalVendas),
        point.faturamento.toFixed(2),
        String(point.produtosVendidos),
      ]),
    ])
  }

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
          Vendas realizadas, faturamento e produtos mais vendidos no período.
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
            aria-label="Resumo de vendas"
            className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <ReportMetric
              detail={formatVariation(report.comparacao.totalVendas.variacaoPercentual)}
              label="Total de vendas"
              value={report.resumo.totalVendas.toLocaleString('pt-BR')}
            />
            <ReportMetric
              detail={formatVariation(report.comparacao.faturamento.variacaoPercentual)}
              label="Faturamento"
              value={currency(report.resumo.faturamento)}
            />
            <ReportMetric
              detail={formatVariation(
                report.comparacao.produtosVendidos.variacaoPercentual,
              )}
              label="Produtos vendidos"
              value={report.resumo.produtosVendidos.toLocaleString('pt-BR')}
            />
            <ReportMetric
              detail={`${report.periodo.quantidadeDias} dia(s) no período`}
              label="Ticket médio"
              value={currency(report.resumo.ticketMedio)}
            />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-2">
            <ReportCard
              description="Faturamento diário no período selecionado"
              title="Evolução das vendas"
            >
              {report.graficos.vendasPorDia.length ? (
                <LineChart
                  data={report.graficos.vendasPorDia.map((point) => ({
                    label: new Date(`${point.data}T12:00:00`).toLocaleDateString(
                      'pt-BR',
                      { day: '2-digit', month: '2-digit' },
                    ),
                    value: point.faturamento,
                  }))}
                  formatValue={currency}
                />
              ) : (
                <EmptyChart />
              )}
            </ReportCard>

            <ReportCard
              description="Participação de cada forma de pagamento no faturamento"
              title="Vendas por pagamento"
            >
              {report.graficos.vendasPorFormaPagamento.length ? (
                <DonutChart
                  data={report.graficos.vendasPorFormaPagamento.map((item) => ({
                    label: item.formaPagamento,
                    value: item.faturamento,
                  }))}
                  formatValue={currency}
                />
              ) : (
                <EmptyChart />
              )}
            </ReportCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ReportCard
              description="Produtos com maior quantidade vendida"
              title="Produtos mais vendidos"
            >
              {report.graficos.produtosMaisVendidos.length ? (
                <HorizontalBars
                  data={report.graficos.produtosMaisVendidos.map((item) => ({
                    label: item.produto,
                    value: item.quantidadeVendida,
                  }))}
                  formatValue={(value) =>
                    `${value.toLocaleString('pt-BR')} unidade(s)`
                  }
                />
              ) : (
                <EmptyChart />
              )}
            </ReportCard>

            <ReportCard
              description="Totais por forma de pagamento"
              title="Resumo por pagamento"
            >
              {report.graficos.vendasPorFormaPagamento.length ? (
                <ul className="divide-y divide-[#eff0eb]">
                  {report.graficos.vendasPorFormaPagamento.map((item) => (
                    <li
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      key={item.formaPagamento}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#343a2f]">
                          {item.formaPagamento}
                        </p>
                        <p className="mt-1 text-xs text-[#858a80]">
                          {item.totalVendas.toLocaleString('pt-BR')} venda(s)
                        </p>
                      </div>
                      <strong className="shrink-0 text-sm text-[#39452d]">
                        {currency(item.faturamento)}
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyChart />
              )}
            </ReportCard>
          </section>
        </>
      )}
    </ReportFrame>
  )
}

export default SalesReportPage
