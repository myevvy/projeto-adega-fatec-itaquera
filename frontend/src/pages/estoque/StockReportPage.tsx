import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getStockReport } from '../../services/reportService'
import { downloadReportCsv } from '../../utils/reportExport'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { StockReport } from '../../types/relatorios'
import {
  EmptyChart,
  ExportButton,
  HorizontalBars,
  ReportCard,
  ReportFrame,
  ReportMetric,
  ReportNotice,
} from '../../components/reports/ReportComponents'

type StockReportPageProps = {
  onNavigate: (path: AppPath) => void
  setupData: SetupData
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function StockReportPage({ onNavigate, setupData }: StockReportPageProps) {
  const { session } = useAuth()
  const [result, setResult] = useState<
    | { key: string; report: StockReport }
    | { key: string; error: string }
    | null
  >(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const requestKey = `${session?.token ?? ''}:${refreshKey}`
  const currentResult = result?.key === requestKey ? result : null
  const report =
    currentResult && 'report' in currentResult ? currentResult.report : null
  const error =
    currentResult && 'error' in currentResult ? currentResult.error : ''
  const loading = Boolean(session?.token) && currentResult === null

  useEffect(() => {
    if (!session?.token) return
    let active = true
    getStockReport(session.token)
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
                : 'Não foi possível carregar o relatório de estoque.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [requestKey, session?.token])

  const exportReport = () => {
    if (!report) return
    downloadReportCsv('relatorio-de-estoque.csv', [
      ['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Custo unitário', 'Custo total', 'Situação'],
      ...report.produtos.map((product) => [
        product.produto,
        product.categoria,
        String(product.quantidadeEmEstoque),
        String(product.quantidadeMinima),
        product.custoUnitario.toFixed(2),
        product.valorEmEstoque.toFixed(2),
        product.statusEstoque,
      ]),
    ])
  }

  return (
    <ReportFrame
      backPath="relatorios"
      currentPage="estoque"
      onNavigate={onNavigate}
      setupData={setupData}
      title="Relatório de estoque"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#747a6d]">
          Posição atual, custo dos produtos e níveis que precisam de atenção.
        </p>
        <ExportButton disabled={!report || loading} onClick={exportReport} />
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
            aria-label="Resumo do estoque"
            className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <ReportMetric
              label="Produtos cadastrados"
              value={report.resumo.produtosCadastrados.toLocaleString('pt-BR')}
              detail="Produtos ativos no catálogo"
            />
            <ReportMetric
              label="Unidades em estoque"
              value={report.resumo.unidadesEmEstoque.toLocaleString('pt-BR')}
              detail="Quantidade disponível atualmente"
            />
            <ReportMetric
              label="Valor em estoque (custo)"
              value={currency(report.resumo.valorTotalEmEstoque)}
              detail="Calculado pelo custo de aquisição"
            />
            <ReportMetric
              label="Alertas de estoque"
              value={report.resumo.produtosEmAlerta.toLocaleString('pt-BR')}
              detail="Produtos zerados ou abaixo do mínimo"
            />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
            <ReportCard
              description="Produtos zerados ou abaixo da quantidade mínima"
              title="Alertas de níveis"
            >
              {report.alertas.length ? (
                <ul className="divide-y divide-[#eff0eb]">
                  {report.alertas.map((product) => (
                    <li
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      key={product.produtoId}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            product.statusEstoque === 'ZERADO'
                              ? 'bg-[#c66f51]'
                              : 'bg-[#7d9a5c]'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#343a2f]">
                            {product.produto}
                          </p>
                          <p className="text-xs text-[#858a80]">
                            Mínimo: {product.quantidadeMinima} un.
                          </p>
                        </div>
                      </div>
                      <strong className="shrink-0 text-sm text-[#4c5543]">
                        {product.quantidadeEmEstoque} un.
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyChart message="Nenhum produto precisa de reposição." />
              )}
            </ReportCard>

            <ReportCard
              description="Valor do estoque atual, calculado pelo custo de aquisição"
              title="Estoque por categoria"
            >
              <HorizontalBars
                data={report.estoquePorCategoria.map((item) => ({
                  label: item.categoria,
                  value: item.valorEmEstoque,
                }))}
                formatValue={currency}
              />
            </ReportCard>
          </section>

          <ReportCard
            description={`Atualizado em ${new Date(report.geradoEm).toLocaleString('pt-BR')}`}
            title="Produtos no estoque"
          >
            {report.produtos.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e9ebe4] text-xs uppercase tracking-wide text-[#858a80]">
                      <th className="px-3 py-3 font-semibold">Produto</th>
                      <th className="px-3 py-3 font-semibold">Categoria</th>
                      <th className="px-3 py-3 text-right font-semibold">Estoque</th>
                      <th className="px-3 py-3 text-right font-semibold">Mínimo</th>
                      <th className="px-3 py-3 text-right font-semibold">Custo unitário</th>
                      <th className="px-3 py-3 text-right font-semibold">Valor em estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.produtos.map((product) => (
                      <tr
                        className="border-b border-[#f0f1ec] last:border-0"
                        key={product.produtoId}
                      >
                        <td className="px-3 py-3 font-semibold text-[#41483a]">
                          {product.produto}
                        </td>
                        <td className="px-3 py-3 text-[#747a6d]">
                          {product.categoria}
                        </td>
                        <td className="px-3 py-3 text-right text-[#41483a]">
                          {product.quantidadeEmEstoque}
                        </td>
                        <td className="px-3 py-3 text-right text-[#747a6d]">
                          {product.quantidadeMinima}
                        </td>
                        <td className="px-3 py-3 text-right text-[#747a6d]">
                          {currency(product.custoUnitario)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-[#41483a]">
                          {currency(product.valorEmEstoque)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyChart message="Nenhum produto ativo cadastrado." />
            )}
          </ReportCard>
        </>
      )}
    </ReportFrame>
  )
}

export default StockReportPage
