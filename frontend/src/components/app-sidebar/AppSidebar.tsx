import type { AppPath } from '../../types'
import { useAuth } from '../../hooks/useAuth'

type AppSidebarProps = {
  currentPage: string
  onNavigate: (page: AppPath) => void
  userName: string
}

const navigationItems: {
  label: string
  page: AppPath
  adminOnly?: boolean
}[] = [
  { label: 'Início', page: 'dashboard' as const },
  { label: 'Vendas', page: 'vendas' as const },
  { label: 'Estoque', page: 'estoque' as const },
  { label: 'Financeiro', page: 'financeiro' as const },
  { label: 'Fornecedores', page: 'fornecedores' as const },
  { label: 'Compras', page: 'compras' as const },
  { label: 'Relatórios', page: 'relatorios' as const },
  { label: 'Usuários', page: 'usuarios' as const, adminOnly: true },
]

function AppSidebar({
  currentPage,
  onNavigate,
  userName,
}: AppSidebarProps) {
  const { session } = useAuth()
  const isAdministrator =
    session?.usuario.perfil.trim().toUpperCase() === 'ADMINISTRADOR'

  return (
    <aside>
      <p>
        <strong aria-hidden="true">■ </strong>
        Adega Bom Sabor
      </p>
      {isAdministrator && (
        <button
          aria-current={currentPage === 'configuracoes' ? 'page' : undefined}
          onClick={() => onNavigate('configuracoes')}
          type="button"
        >
          Configurações
        </button>
      )}
      <nav aria-label="Navegação principal">
        <ul>
          {navigationItems
            .filter((item) => !item.adminOnly || isAdministrator)
            .map((item) => (
              <li key={item.label}>
                <button
                  aria-current={
                    (currentPage === item.page ||
                      (item.page === 'vendas' &&
                        currentPage.startsWith('vendas')) ||
                      (item.page === 'financeiro' &&
                        currentPage.startsWith('financeiro')) ||
                      (item.page === 'fornecedores' &&
                        currentPage.startsWith('fornecedores')) ||
                      (item.page === 'compras' &&
                        currentPage.startsWith('compras')) ||
                      (item.page === 'estoque' &&
                        (currentPage.startsWith('estoque') ||
                          currentPage.startsWith('produtos')))
                    )
                      ? 'page'
                      : undefined
                  }
                  onClick={() => onNavigate(item.page)}
                  type="button"
                >
                  {item.label}
                </button>
              </li>
            ))}
        </ul>
      </nav>
      <footer>
        <button
          aria-current={currentPage === 'perfil' ? 'page' : undefined}
          onClick={() => onNavigate('perfil')}
          type="button"
        >
          {userName || 'Marcos Almeida'}
        </button>
        <p>
          {isAdministrator ? 'Administrador' : 'Colaborador'}
        </p>
      </footer>
    </aside>
  )
}

export default AppSidebar
