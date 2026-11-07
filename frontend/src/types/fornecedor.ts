export type SupplierPurchase = {
  id: string
  date: string
  itemCount: number
  total: number
}

export type Supplier = {
  id: string
  name: string
  legalName: string
  cnpj: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  description: string
  active: boolean
  purchases: SupplierPurchase[]
}
