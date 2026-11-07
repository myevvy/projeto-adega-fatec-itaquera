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
}[] = [
  {
    title: 'Relatório de vendas',
    description: 'Vendas realizadas por período',
    destination: 'vendas/relatorio',
  },
  {
    title: 'Relatório de estoque',
    description: 'Produtos e quantidades atuais',
    destination: 'estoque/relatorio',
  },
  {
    title: 'Relatório de despesas',
    description: 'Despesas registradas por período',
    destination: 'financeiro/despesas/relatorio',
  },
]

function ReportsPage({ onNavigate, setupData }: ReportsPageProps) {
  return (
    <main>
      <AppSidebar currentPage="relatorios" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <h1>Relatórios</h1>
        <ul>
          {reports.map((report) => (
            <li key={report.title}>
              <article>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
                <button onClick={() => onNavigate(report.destination)} type="button">
                  Ver relatório →
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
