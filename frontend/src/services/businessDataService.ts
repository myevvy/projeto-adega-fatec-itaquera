import type { CardType, ExpenseRecord, Product, SaleRecord } from '../types'
import type {
  ExpenseCategoryOption,
  PurchasePaymentMethod,
  PurchaseRecord,
} from '../types/financeiro'
import type { Supplier, SupplierPurchase } from '../types/fornecedor'
import type { ProductCategory } from '../types/produto'
import { api, apiErrorMessage } from './api'

type ApiRecord = Record<string, unknown>

const purchasePaymentMethods: PurchasePaymentMethod[] = [
  'DINHEIRO',
  'PIX',
  'CARTAO',
  'BOLETO',
]

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  return String(value)
}

function requiredNumber(value: unknown, field: string): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  return parsed
}

function activeValue(value: unknown): boolean {
  return value === true || value === 1 || value === '1'
}

async function request(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
  body?: unknown,
  formData?: FormData,
): Promise<unknown> {
  try {
    const response = await api.request({
      url: path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: formData ?? body,
    })
    return response.data
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'Não foi possível concluir a solicitação.'), {
      cause: error,
    })
  }
}

function records(value: unknown, entity: string): ApiRecord[] {
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw new Error(`A API retornou uma lista inválida de ${entity}.`)
  }
  return value
}

function mapProduct(row: ApiRecord): Product {
  return {
    id: requiredNumber(row.id, 'id do produto'),
    name: requiredText(row.nome, 'nome do produto'),
    category: requiredText(row.categoria, 'categoria do produto'),
    variety:
      row.volume_ml == null || row.volume_ml === ''
        ? ''
        : `${requiredNumber(row.volume_ml, 'volume do produto')} ml`,
    price: requiredNumber(row.preco_venda, 'preço do produto'),
    cost: requiredNumber(row.custo_aquisicao, 'custo do produto'),
    stock: requiredNumber(row.quantidade_estoque, 'estoque do produto'),
    minimumStock: requiredNumber(row.quantidade_minima, 'estoque mínimo'),
    description: typeof row.descricao === 'string' ? row.descricao : '',
    active: activeValue(row.ativo),
  }
}

function mapSupplier(row: ApiRecord): Supplier {
  return {
    id: requiredText(row.id, 'id do fornecedor'),
    name: requiredText(row.nome, 'nome do fornecedor'),
    legalName: '',
    cnpj: '',
    phone: requiredText(row.telefone, 'telefone do fornecedor'),
    email: typeof row.email === 'string' ? row.email : '',
    address: typeof row.end === 'string' ? row.end : '',
    city: typeof row.cidade === 'string' ? row.cidade : '',
    state: typeof row.estado === 'string' ? row.estado : '',
    description: typeof row.descricao === 'string' ? row.descricao : '',
    active: activeValue(row.ativo),
    purchases: [],
  }
}

function mapSale(row: ApiRecord): SaleRecord {
  const method = String(row.forma_pagamento ?? '').toUpperCase()
  const paymentMethod =
    method === 'PIX'
      ? 'PIX'
      : method === 'CARTAO' || method === 'CARTÃO'
        ? 'Cartão'
        : method === 'DINHEIRO'
          ? 'Dinheiro'
          : 'Não informado'
  const cardType: CardType | undefined =
    row.tipo_cartao === 'CREDITO' || row.tipo_cartao === 'DEBITO'
        ? row.tipo_cartao
        : undefined
  return {
    id: requiredText(row.id, 'id da venda'),
    createdAt: requiredText(row.data_hora, 'data da venda'),
    items: [],
    paymentMethod,
    cardType,
    total: requiredNumber(row.total, 'total da venda'),
    status: typeof row.status === 'string' ? row.status : 'CONCLUIDA',
  }
}

function mapPurchase(row: ApiRecord): PurchaseRecord {
  const items = Array.isArray(row.itens) ? row.itens.filter(isRecord) : []
  const item = items[0]
  const paymentMethod = purchasePaymentMethods.find(
    (method) => method === row.forma_pagamento,
  )
  return {
    id: requiredText(row.id, 'id da compra'),
    supplierId: requiredText(row.fornecedor_id, 'fornecedor da compra'),
    supplierName: requiredText(row.fornecedor, 'nome do fornecedor'),
    productId: item ? requiredNumber(item.produto_id, 'produto da compra') : 0,
    productName: item ? requiredText(item.produto, 'nome do produto') : '',
    quantity: item ? requiredNumber(item.quantidade, 'quantidade comprada') : 0,
    unitCost: item ? requiredNumber(item.custo, 'custo da compra') : 0,
    date: requiredText(row.data, 'data da compra').slice(0, 10),
    total: requiredNumber(row.total, 'total da compra'),
    paymentMethod,
    paymentTermDays:
      row.prazo_dias == null || row.prazo_dias === ''
        ? undefined
        : requiredNumber(row.prazo_dias, 'prazo da compra'),
    freightAndTaxes: requiredNumber(row.frete, 'frete e impostos da compra'),
    status: typeof row.status === 'string' ? row.status : 'REGISTRADA',
  }
}

function mapExpense(row: ApiRecord): ExpenseRecord {
  return {
    id: requiredText(row.id, 'id da despesa'),
    description: requiredText(row.descricao, 'descrição da despesa'),
    category: requiredText(row.categoria, 'categoria da despesa'),
    categoryId: requiredNumber(row.categoria_id, 'id da categoria da despesa'),
    amount: requiredNumber(row.valor, 'valor da despesa'),
    paidAt: requiredText(row.data, 'data da despesa').slice(0, 10),
    observation: '',
    active: !activeValue(row.estornada),
  }
}

export async function listProducts(token: string): Promise<Product[]> {
  return records(await request('/produtos', 'GET', token), 'produtos').map(mapProduct)
}

function mapProductCategory(row: ApiRecord): ProductCategory {
  return {
    id: requiredNumber(row.id, 'id da categoria do produto'),
    name: requiredText(row.nome, 'nome da categoria do produto'),
  }
}

export async function listProductCategories(
  token: string,
): Promise<ProductCategory[]> {
  return records(
    await request('/categorias/produtos', 'GET', token),
    'categorias de produtos',
  ).map(mapProductCategory)
}

export async function createProductCategory(
  token: string,
  name: string,
): Promise<ProductCategory> {
  const result = await request(
    '/categorias/produtos',
    'POST',
    token,
    { nome: name },
  )
  if (!isRecord(result) || !isRecord(result.categoria)) {
    throw new Error('A API não retornou a categoria cadastrada.')
  }
  return mapProductCategory(result.categoria)
}

export async function createProduct(
  token: string,
  product: Product,
  image?: File,
): Promise<Product> {
  let productImage = image
  if (!productImage) {
    let response: Response
    try {
      response = await fetch(
        `${import.meta.env.BASE_URL}product-placeholder.svg`,
      )
    } catch (error) {
      throw new Error('Não foi possível carregar a imagem padrão do produto.', {
        cause: error,
      })
    }
    if (!response.ok) {
      throw new Error('Não foi possível carregar a imagem padrão do produto.')
    }
    productImage = new File(
      [await response.blob()],
      'product-placeholder.svg',
      { type: 'image/svg+xml' },
    )
  }

  const body = new FormData()
  body.set('nome', product.name)
  body.set('categoria', product.category)
  body.set('precoV', String(product.price))
  body.set('custo', String(product.cost))
  body.set('estoque', String(product.stock))
  body.set('qntMinima', String(product.minimumStock))
  body.set('desc', product.description)
  body.set('imagem', productImage)
  const result = await request('/produtos', 'POST', token, {}, body)
  if (!isRecord(result) || !isRecord(result.produto)) {
    throw new Error('A API não retornou o produto cadastrado.')
  }
  return mapProduct(result.produto)
}

export async function updateProduct(
  token: string,
  product: Product,
): Promise<void> {
  await request(`/produtos/${product.id}`, 'PUT', token, {
    nome: product.name,
    categoria: product.category,
    precoV: product.price,
    custo: product.cost,
    qntMinima: product.minimumStock,
    desc: product.description,
  })
}

export async function deactivateProduct(
  token: string,
  productId: number,
): Promise<void> {
  await request(`/produtos/${productId}`, 'DELETE', token)
}

export async function adjustProductStock(
  token: string,
  productId: number,
  quantity: number,
): Promise<void> {
  await request(`/produtos/quantidade/${productId}`, 'PUT', token, {
    quantidade: quantity,
  })
}

export async function listSuppliers(token: string): Promise<Supplier[]> {
  return records(
    await request('/fornecedores', 'GET', token),
    'fornecedores',
  ).map(mapSupplier)
}

export async function saveSupplier(
  token: string,
  supplier: Supplier,
  isNew: boolean,
): Promise<Supplier> {
  const body = {
    nome: supplier.name,
    descricao: supplier.description,
    telefone: supplier.phone,
    email: supplier.email,
    end: supplier.address,
    cidade: supplier.city,
    estado: supplier.state,
  }
  const path = isNew ? '/fornecedores' : `/fornecedores/${supplier.id}`
  const result = await request(
    path,
    isNew ? 'POST' : 'PUT',
    token,
    body,
  )
  if (!isNew) return supplier
  if (!isRecord(result) || !isRecord(result.fornecedor)) {
    throw new Error('A API não retornou o fornecedor cadastrado.')
  }
  return mapSupplier(result.fornecedor)
}

export async function deactivateSupplier(
  token: string,
  supplierId: string,
): Promise<void> {
  await request(`/fornecedores/${supplierId}`, 'DELETE', token)
}

export async function listSales(token: string): Promise<SaleRecord[]> {
  return records(await request('/vendas', 'GET', token), 'vendas').map(mapSale)
}

export async function createSale(
  token: string,
  sale: SaleRecord,
): Promise<SaleRecord> {
  const subtotal = sale.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const result = await request('/vendas', 'POST', token, {
    data: sale.createdAt,
    subtotal,
    desconto: 0,
    total: sale.total,
    frete: 0,
    forma_pagamento:
      sale.paymentMethod === 'Cartão'
        ? 'CARTAO'
        : sale.paymentMethod.toUpperCase(),
    tipo_cartao: sale.paymentMethod === 'Cartão' ? sale.cardType ?? null : null,
    itens: sale.items.map((item) => ({
      produto_id: item.productId,
      quantidade: item.quantity,
      preco_unitario: item.unitPrice,
    })),
  })
  if (!isRecord(result) || !isRecord(result.venda)) {
    throw new Error('A API não retornou a venda cadastrada.')
  }
  const created = mapSale(result.venda)
  const items = Array.isArray(result.venda.itens)
    ? result.venda.itens.filter(isRecord)
    : []
  created.items = items.map((item) => ({
    productId: requiredNumber(item.produto_id, 'produto da venda'),
    name: requiredText(item.produto, 'nome do produto vendido'),
    quantity: requiredNumber(item.quantidade, 'quantidade vendida'),
    unitPrice: requiredNumber(item.preco_unitario, 'preço unitário'),
  }))
  return created
}

export async function cancelSale(token: string, saleId: string): Promise<void> {
  await request(`/vendas/${saleId}`, 'DELETE', token)
}

export async function listPurchases(token: string): Promise<PurchaseRecord[]> {
  return records(
    await request('/compras', 'GET', token),
    'compras',
  ).map(mapPurchase)
}

export async function createPurchase(
  token: string,
  purchase: PurchaseRecord,
): Promise<PurchaseRecord> {
  const subtotal = purchase.quantity * purchase.unitCost
  const freightAndTaxes =
    purchase.freightAndTaxes ?? purchase.total - subtotal
  const result = await request('/compras', 'POST', token, {
    fornecedor_id: Number(purchase.supplierId),
    data: purchase.date,
    subtotal,
    total: purchase.total,
    frete: freightAndTaxes,
    forma_pagamento: purchase.paymentMethod,
    prazo_dias: purchase.paymentTermDays,
    itens: [
      {
        produto_id: purchase.productId,
        quantidade: purchase.quantity,
        custo: purchase.unitCost,
      },
    ],
  })
  if (!isRecord(result) || !isRecord(result.compra)) {
    throw new Error('A API não retornou a compra cadastrada.')
  }
  return mapPurchase(result.compra)
}

export async function cancelPurchase(
  token: string,
  purchaseId: string,
): Promise<void> {
  await request(`/compras/${purchaseId}`, 'DELETE', token)
}

export async function listExpenses(token: string): Promise<ExpenseRecord[]> {
  return records(
    await request('/despesas', 'GET', token),
    'despesas',
  ).map(mapExpense)
}

function mapExpenseCategory(row: ApiRecord): ExpenseCategoryOption {
  return {
    id: requiredNumber(row.id, 'id da categoria da despesa'),
    name: requiredText(row.nome, 'nome da categoria da despesa'),
    type: requiredText(row.tipo, 'tipo da categoria da despesa'),
  }
}

export async function listExpenseCategories(
  token: string,
): Promise<ExpenseCategoryOption[]> {
  return records(
    await request('/categorias/despesas', 'GET', token),
    'categorias de despesas',
  ).map(mapExpenseCategory)
}

export async function createExpenseCategory(
  token: string,
  name: string,
  type: string,
): Promise<ExpenseCategoryOption> {
  const result = await request(
    '/categorias/despesas',
    'POST',
    token,
    { nome: name, tipo: type },
  )
  if (!isRecord(result) || !isRecord(result.categoria)) {
    throw new Error('A API não retornou a categoria cadastrada.')
  }
  return mapExpenseCategory(result.categoria)
}

export async function createExpense(
  token: string,
  expense: ExpenseRecord,
  categoryId: number,
): Promise<ExpenseRecord> {
  const result = await request('/despesas', 'POST', token, {
    categoria_id: categoryId,
    descricao: expense.description,
    valor: expense.amount,
    data: expense.paidAt,
  })
  if (!isRecord(result) || !isRecord(result.despesa)) {
    throw new Error('A API não retornou a despesa cadastrada.')
  }
  return mapExpense(result.despesa)
}

export async function cancelExpense(
  token: string,
  expenseId: string,
): Promise<void> {
  await request(`/despesas/${expenseId}`, 'DELETE', token)
}

export function supplierPurchasesFromRecords(
  purchases: PurchaseRecord[],
): Map<string, SupplierPurchase[]> {
  const grouped = new Map<string, SupplierPurchase[]>()
  for (const purchase of purchases) {
    const current = grouped.get(purchase.supplierId) ?? []
    current.push({
      id: purchase.id,
      date: purchase.date,
      itemCount: purchase.quantity,
      total: purchase.total,
    })
    grouped.set(purchase.supplierId, current)
  }
  return grouped
}
