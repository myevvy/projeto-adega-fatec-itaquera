export type PageKey = 'cadastro' | 'login' | 'dashboard' | 'nova-venda'

export type AppPath =
  | PageKey
  | 'estoque'
  | 'produtos'
  | 'produtos/novo'
  | `produtos/${string}`
  | `produtos/${string}/editar`
  | 'estoque/ajustar'
  | `estoque/ajustar?produto=${string}`
  | 'estoque/repor'
  | `estoque/repor?produto=${string}`
  | 'estoque/relatorio'
  | 'vendas'
  | 'vendas/relatorio'
  | 'financeiro'
  | 'financeiro/despesas/nova'
  | 'financeiro/despesas/relatorio'
  | 'relatorios'
  | 'compras'
  | 'compras/nova'
  | 'esqueci-senha'
  | 'fornecedores'
  | 'fornecedores/novo'
  | `fornecedores/${string}`
  | `fornecedores/${string}/editar`
  | 'configuracoes'
  | 'perfil'

export type SalesPeriod = 'today' | '7' | '30' | '90' | '180' | '365' | 'all'
