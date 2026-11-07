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
}
