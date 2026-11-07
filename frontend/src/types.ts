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

export type ExpenseCategory =
  | 'Fixa (contas, aluguel)'
  | 'Compras de fornecedores'
  | 'Outras despesas'

export type ExpenseRecord = {
  id: string
  description: string
  category: ExpenseCategory
  amount: number
  paidAt: string
  observation: string
}

export type SetupData = {
  businessName: string
  category: string
  phone: string
  adminName: string
  email: string
}

export type PaymentMethod = 'Dinheiro' | 'PIX' | 'Cartão'

export type SaleRecord = {
  id: string
  createdAt: string
  items: {
    productId: number
    name: string
    quantity: number
    unitPrice: number
  }[]
  paymentMethod: PaymentMethod
  total: number
}

export type Product = {
  id: number
  name: string
  category: string
  variety: string
  price: number
  cost: number
  stock: number
  minimumStock: number
  description: string
  active: boolean
}
