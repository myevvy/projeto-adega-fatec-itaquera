import { BrowserRouter } from 'react-router-dom'
import PwaInstallPrompt from './components/pwa-install-prompt/PwaInstallPrompt'
import AppRoutes from './routes/AppRoutes'
import useLocalStorage from './hooks/useLocalStorage'
import type {
  ExpenseRecord,
  Product,
  SaleRecord,
  SetupData,
} from './types'
import type { PurchaseRecord } from './types/financeiro'
import type { Supplier } from './types/fornecedor'
import type {
  NotificationPreferences,
  WorkspaceUser,
} from './types/usuario'

const initialSetupData: SetupData = {
  businessName: '',
  category: '',
  phone: '',
  adminName: '',
  email: '',
}

const initialProducts: Product[] = [
  { id: 1, name: 'Vinho Tinto Reserva', category: 'Tintos', variety: 'Cabernet Sauvignon', price: 48, cost: 27, stock: 24, minimumStock: 8, description: 'Vinho encorpado com notas de frutas vermelhas.', active: true },
  { id: 2, name: 'Vinho Branco Seco', category: 'Brancos', variety: 'Sauvignon Blanc', price: 39.9, cost: 22, stock: 6, minimumStock: 10, description: 'Branco leve, ideal para harmonizar com frutos do mar.', active: true },
  { id: 3, name: 'Espumante Brut', category: 'Espumantes', variety: 'Método tradicional', price: 65, cost: 38, stock: 15, minimumStock: 6, description: 'Espumante brut para celebrações.', active: true },
  { id: 4, name: 'Vinho Tinto Suave', category: 'Tintos', variety: 'Bordô', price: 29.9, cost: 16, stock: 3, minimumStock: 12, description: 'Vinho suave e frutado.', active: true },
  { id: 5, name: 'Whisky 12 anos', category: 'Destilados', variety: 'Single Malt', price: 189.9, cost: 125, stock: 9, minimumStock: 4, description: 'Whisky envelhecido por 12 anos.', active: true },
  { id: 6, name: 'Vinho Rosé', category: 'Rosés', variety: 'Rosé seco', price: 42, cost: 25, stock: 0, minimumStock: 8, description: 'Vinho rosé refrescante.', active: true },
]

const initialPurchases: PurchaseRecord[] = [
  {
    id: 'compra-demo-1',
    supplierId: 'fornecedor-1',
    supplierName: 'Vinícola Vale do Sol',
    productId: 1,
    productName: 'Vinho Tinto Reserva',
    quantity: 12,
    unitCost: 40,
    date: '2026-11-05',
    total: 480,
  },
  {
    id: 'compra-demo-2',
    supplierId: 'fornecedor-2',
    supplierName: 'Adega Serra Alta',
    productId: 3,
    productName: 'Espumante Brut',
    quantity: 24,
    unitCost: 30,
    date: '2026-11-02',
    total: 720,
  },
  {
    id: 'compra-demo-3',
    supplierId: 'fornecedor-3',
    supplierName: 'Importadora Monte Bello',
    productId: 5,
    productName: 'Whisky 12 anos',
    quantity: 6,
    unitCost: 190,
    date: '2026-10-28',
    total: 1140,
  },
]

const initialSuppliers: Supplier[] = [
  {
    id: 'fornecedor-1',
    name: 'Vinícola Vale do Sol',
    legalName: 'Vale do Sol Vinhos Ltda.',
    cnpj: '12.345.678/0001-90',
    phone: '(11) 3456-7890',
    email: 'contato@valedosol.example',
    address: 'Rua das Videiras, 120',
    city: 'São Roque',
    state: 'SP',
    description: 'Distribuidora demonstrativa de vinhos nacionais.',
    active: true,
    purchases: [
      { id: 'compra-demo-1', date: '2025-03-12', itemCount: 24, total: 1860 },
      { id: 'compra-demo-2', date: '2025-02-20', itemCount: 12, total: 940 },
    ],
  },
  {
    id: 'fornecedor-2',
    name: 'Adega Serra Alta',
    legalName: 'Serra Alta Distribuidora de Bebidas Ltda.',
    cnpj: '23.456.789/0001-01',
    phone: '(11) 2345-6789',
    email: 'vendas@serraalta.example',
    address: 'Avenida Central, 450',
    city: 'Jundiaí',
    state: 'SP',
    description: 'Fornecedor demonstrativo.',
    active: true,
    purchases: [],
  },
  {
    id: 'fornecedor-3',
    name: 'Importadora Monte Bello',
    legalName: 'Monte Bello Importações Ltda.',
    cnpj: '34.567.890/0001-12',
    phone: '(19) 3234-5678',
    email: 'atendimento@montebello.example',
    address: 'Rua do Comércio, 85',
    city: 'Campinas',
    state: 'SP',
    description: 'Fornecedor demonstrativo.',
    active: true,
    purchases: [],
  },
  {
    id: 'fornecedor-4',
    name: 'Destilaria Horizonte',
    legalName: 'Horizonte Bebidas Artesanais Ltda.',
    cnpj: '45.678.901/0001-23',
    phone: '(11) 4567-8901',
    email: 'comercial@horizonte.example',
    address: 'Estrada do Engenho, 30',
    city: 'Atibaia',
    state: 'SP',
    description: 'Fornecedor demonstrativo.',
    active: true,
    purchases: [],
  },
  {
    id: 'fornecedor-5',
    name: 'Distribuidora Bom Gosto',
    legalName: 'Bom Gosto Comércio de Bebidas Ltda.',
    cnpj: '56.789.012/0001-34',
    phone: '(11) 5678-9012',
    email: 'pedidos@bomgosto.example',
    address: 'Rua dos Armazéns, 210',
    city: 'São Paulo',
    state: 'SP',
    description: 'Fornecedor demonstrativo.',
    active: false,
    purchases: [],
  },
]

const initialUsers: WorkspaceUser[] = [
  {
    id: 'operador-1',
    name: 'Bianca Santos',
    email: 'bianca@example.com',
    role: 'Operador',
    active: true,
  },
  {
    id: 'operador-2',
    name: 'Diego Oliveira',
    email: 'diego@example.com',
    role: 'Operador',
    active: true,
  },
]

const initialNotifications: NotificationPreferences = {
  lowStock: true,
  emptyStock: true,
  salesSummary: true,
  email: false,
  push: false,
}

function isSetupData(value: unknown): value is SetupData {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return ['businessName', 'category', 'phone', 'adminName', 'email'].every(
    (key) => typeof (value as Record<string, unknown>)[key] === 'string',
  )
}

function isSaleRecord(value: unknown): value is SaleRecord {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const sale = value as Record<string, unknown>
  return (
    typeof sale.id === 'string' &&
    typeof sale.createdAt === 'string' &&
    typeof sale.total === 'number' &&
    Number.isFinite(sale.total) &&
    ['Dinheiro', 'PIX', 'Cartão'].includes(String(sale.paymentMethod)) &&
    Array.isArray(sale.items) &&
    sale.items.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).productId === 'number' &&
        typeof (item as Record<string, unknown>).name === 'string' &&
        typeof (item as Record<string, unknown>).quantity === 'number' &&
        typeof (item as Record<string, unknown>).unitPrice === 'number',
    )
  )
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) return false
  const product = value as Record<string, unknown>
  return (
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    typeof product.variety === 'string' &&
    typeof product.price === 'number' &&
    typeof product.cost === 'number' &&
    typeof product.stock === 'number' &&
    typeof product.minimumStock === 'number' &&
    typeof product.description === 'string' &&
    typeof product.active === 'boolean'
  )
}

function isExpenseRecord(value: unknown): value is ExpenseRecord {
  if (typeof value !== 'object' || value === null) return false
  const expense = value as Record<string, unknown>
  return (
    typeof expense.id === 'string' &&
    typeof expense.description === 'string' &&
    ['Fixa (contas, aluguel)', 'Compras de fornecedores', 'Outras despesas'].includes(
      String(expense.category),
    ) &&
    typeof expense.amount === 'number' &&
    Number.isFinite(expense.amount) &&
    typeof expense.paidAt === 'string' &&
    typeof expense.observation === 'string'
  )
}

function isPurchaseRecord(value: unknown): value is PurchaseRecord {
  if (typeof value !== 'object' || value === null) return false
  const purchase = value as Record<string, unknown>
  return (
    typeof purchase.id === 'string' &&
    typeof purchase.supplierId === 'string' &&
    typeof purchase.supplierName === 'string' &&
    typeof purchase.productId === 'number' &&
    typeof purchase.productName === 'string' &&
    typeof purchase.quantity === 'number' &&
    Number.isInteger(purchase.quantity) &&
    purchase.quantity > 0 &&
    typeof purchase.unitCost === 'number' &&
    Number.isFinite(purchase.unitCost) &&
    purchase.unitCost >= 0 &&
    typeof purchase.date === 'string' &&
    typeof purchase.total === 'number' &&
    Number.isFinite(purchase.total)
  )
}

function isSupplier(value: unknown): value is Supplier {
  if (typeof value !== 'object' || value === null) return false
  const supplier = value as Record<string, unknown>
  return (
    typeof supplier.id === 'string' &&
    typeof supplier.name === 'string' &&
    typeof supplier.legalName === 'string' &&
    typeof supplier.cnpj === 'string' &&
    typeof supplier.phone === 'string' &&
    typeof supplier.email === 'string' &&
    typeof supplier.address === 'string' &&
    typeof supplier.city === 'string' &&
    typeof supplier.state === 'string' &&
    typeof supplier.description === 'string' &&
    typeof supplier.active === 'boolean' &&
    Array.isArray(supplier.purchases) &&
    supplier.purchases.every((purchase: unknown) => {
      if (typeof purchase !== 'object' || purchase === null) return false
      const record = purchase as Record<string, unknown>
      return (
        typeof record.id === 'string' &&
        typeof record.date === 'string' &&
        typeof record.itemCount === 'number' &&
        typeof record.total === 'number'
      )
    })
  )
}

function isWorkspaceUser(value: unknown): value is WorkspaceUser {
  if (typeof value !== 'object' || value === null) return false
  const user = value as Record<string, unknown>
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    ['Administrador', 'Operador'].includes(String(user.role)) &&
    typeof user.active === 'boolean'
  )
}

function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  if (typeof value !== 'object' || value === null) return false
  const preferences = value as Record<string, unknown>
  return ['lowStock', 'emptyStock', 'salesSummary', 'email', 'push'].every(
    (key) => typeof preferences[key] === 'boolean',
  )
}

function App() {
  const [setupData, setSetupData] = useLocalStorage(
    'adega.setup-data',
    initialSetupData,
    isSetupData,
  )
  const [sales, setSales] = useLocalStorage<SaleRecord[]>(
    'adega.sales',
    [],
    (value): value is SaleRecord[] =>
      Array.isArray(value) && value.every(isSaleRecord),
  )
  const [products, setProducts] = useLocalStorage<Product[]>(
    'adega.products',
    initialProducts,
    (value): value is Product[] =>
      Array.isArray(value) && value.every(isProduct),
  )
  const [expenses, setExpenses] = useLocalStorage<ExpenseRecord[]>(
    'adega.expenses',
    [],
    (value): value is ExpenseRecord[] =>
      Array.isArray(value) && value.every(isExpenseRecord),
  )
  const [purchases, setPurchases] = useLocalStorage<PurchaseRecord[]>(
    'adega.purchases',
    initialPurchases,
    (value): value is PurchaseRecord[] =>
      Array.isArray(value) && value.every(isPurchaseRecord),
  )
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(
    'adega.suppliers',
    initialSuppliers,
    (value): value is Supplier[] =>
      Array.isArray(value) && value.every(isSupplier),
  )
  const [users, setUsers] = useLocalStorage<WorkspaceUser[]>(
    'adega.users',
    initialUsers,
    (value): value is WorkspaceUser[] =>
      Array.isArray(value) && value.every(isWorkspaceUser),
  )
  const [notifications, setNotifications] = useLocalStorage<NotificationPreferences>(
    'adega.notifications',
    initialNotifications,
    isNotificationPreferences,
  )
  const saveSale = (sale: SaleRecord) => {
    setSales((currentSales) => [sale, ...currentSales])
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const soldQuantity =
          sale.items.find((item) => item.productId === product.id)?.quantity ?? 0
        return { ...product, stock: Math.max(0, product.stock - soldQuantity) }
      }),
    )
  }
  const savePurchase = (purchase: PurchaseRecord) => {
    setPurchases((currentPurchases) => [purchase, ...currentPurchases])
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === purchase.productId
          ? {
              ...product,
              stock: product.stock + purchase.quantity,
              cost: purchase.unitCost,
            }
          : product,
      ),
    )
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === purchase.supplierId
          ? {
              ...supplier,
              purchases: [
                {
                  id: purchase.id,
                  date: purchase.date,
                  itemCount: purchase.quantity,
                  total: purchase.total,
                },
                ...supplier.purchases,
              ],
            }
          : supplier,
      ),
    )
  }

  return (
    <BrowserRouter>
      <>
        <PwaInstallPrompt />
        <AppRoutes
          setupData={setupData}
          onSetupDataChange={setSetupData}
          sales={sales}
          products={products}
          onProductsChange={setProducts}
          onSaleCreated={saveSale}
          purchases={purchases}
          onPurchaseCreated={savePurchase}
          expenses={expenses}
          onExpenseCreated={(expense) =>
            setExpenses((currentExpenses) => [expense, ...currentExpenses])
          }
          suppliers={suppliers}
          onSuppliersChange={setSuppliers}
          users={users}
          onUsersChange={setUsers}
          notifications={notifications}
          onNotificationsChange={setNotifications}
        />
      </>
    </BrowserRouter>
  )
}

export default App
