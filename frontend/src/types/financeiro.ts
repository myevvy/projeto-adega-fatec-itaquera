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
  paymentMethod: PaymentMethod | 'Não informado'
  total: number
  status?: string
}

export type ExpenseCategory =
  | 'Fixa (contas, aluguel)'
  | 'Compras de fornecedores'
  | 'Outras despesas'

export type ExpenseRecord = {
  id: string
  description: string
  category: string
  categoryId?: number
  amount: number
  paidAt: string
  observation: string
  active?: boolean
}

export type PurchaseRecord = {
  id: string
  supplierId: string
  supplierName: string
  productId: number
  productName: string
  quantity: number
  unitCost: number
  date: string
  total: number
  status?: string
}
