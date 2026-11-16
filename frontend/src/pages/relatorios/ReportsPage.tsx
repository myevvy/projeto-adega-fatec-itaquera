import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type ReportsPageProps = {
  onNavigate: (path: AppPath) => void
  setupData: SetupData
}

const reports: {
  title: string
  description: string
  destination: AppPath
  icon: string
  accent: string
}[] = [
  {
    title: 'Relatório de vendas',
    description: 'Vendas realizadas e faturamento por período',
    destination: 'vendas/relatorio',
    icon: '↗',
    accent: 'bg-[#e7eedf] text-[#526c3c]',
  },
  {
    title: 'Relatório de estoque',
    description: 'Produtos, quantidades atuais e alertas de nível',
    destination: 'estoque/relatorio',
    icon: '□',
    accent: 'bg-[#e7eedf] text-[#526c3c]',
  },
  {
    title: 'Relatório de despesas',
    description: 'Despesas registradas, categorias e histórico',
    destination: 'financeiro/despesas/relatorio',
    icon: '↓',
    accent: 'bg-[#f4e9e3] text-[#ad684d]',
  },
]

function ReportsPage({ onNavigate, setupData }: ReportsPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f6f1] lg:flex">
      <AppSidebar
        currentPage="relatorios"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-7 lg:px-10 lg:pb-10 lg:pt-12">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold text-[#728060]">
            VISÃO ADMINISTRATIVA
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#252a20]">
            Relatórios
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#747a6d]">
            Consulte os dados do negócio por área e acompanhe os principais
            indicadores da adega.
          </p>
        </header>
        <ul className="grid gap-4">
          {reports.map((report) => (
            <li key={report.title}>
              <article className="flex flex-col gap-4 rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm transition hover:border-[#cbd3bf] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${report.accent}`}
                  >
                    {report.icon}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#30372b]">
                      {report.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#858a80]">
                      {report.description}
                    </p>
                  </div>
                </div>
                <button
                  className="flex shrink-0 items-center justify-between gap-5 rounded-xl border border-[#e8e9e2] px-4 py-3 text-sm font-semibold text-[#465337] transition hover:bg-[#f5f6f1] sm:justify-center"
                  onClick={() => onNavigate(report.destination)}
                  type="button"
                >
                  Ver relatório <span aria-hidden="true">→</span>
                </button>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default ReportsPage
