import { BrowserRouter } from 'react-router-dom'
import PwaInstallPrompt from './components/pwa-install-prompt/PwaInstallPrompt'
import { AuthProvider } from './contexts/AuthProvider'
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
} from './types/usuario'

const initialSetupData: SetupData = {
  businessName: '',
  category: '',
  phone: '',
  adminName: '',
  email: '',
}

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
    ['Dinheiro', 'PIX', 'Cartão', 'Não informado'].includes(
      String(sale.paymentMethod),
    ) &&
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
    typeof expense.category === 'string' &&
    (expense.categoryId === undefined ||
      typeof expense.categoryId === 'number') &&
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
    purchase.quantity >= 0 &&
    purchase.productId >= 0 &&
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
    'adega.db.sales',
    [],
    (value): value is SaleRecord[] =>
      Array.isArray(value) && value.every(isSaleRecord),
  )
  const [products, setProducts] = useLocalStorage<Product[]>(
    'adega.db.products',
    [],
    (value): value is Product[] =>
      Array.isArray(value) && value.every(isProduct),
  )
  const [expenses, setExpenses] = useLocalStorage<ExpenseRecord[]>(
    'adega.db.expenses',
    [],
    (value): value is ExpenseRecord[] =>
      Array.isArray(value) && value.every(isExpenseRecord),
  )
  const [purchases, setPurchases] = useLocalStorage<PurchaseRecord[]>(
    'adega.db.purchases',
    [],
    (value): value is PurchaseRecord[] =>
      Array.isArray(value) && value.every(isPurchaseRecord),
  )
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>(
    'adega.db.suppliers',
    [],
    (value): value is Supplier[] =>
      Array.isArray(value) && value.every(isSupplier),
  )
  const [notifications, setNotifications] = useLocalStorage<NotificationPreferences>(
    'adega.notifications',
    initialNotifications,
    isNotificationPreferences,
  )
  const saveSale = (sale: SaleRecord) => {
    setSales((currentSales) => [sale, ...currentSales])
  }
  const savePurchase = (purchase: PurchaseRecord) => {
    setPurchases((currentPurchases) => [purchase, ...currentPurchases])
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <PwaInstallPrompt />
        <AppRoutes
          setupData={setupData}
          onSetupDataChange={setSetupData}
          sales={sales}
          products={products}
          onProductsChange={setProducts}
          onSalesChange={setSales}
          onPurchasesChange={setPurchases}
          onExpensesChange={setExpenses}
          onSaleCreated={saveSale}
          purchases={purchases}
          onPurchaseCreated={savePurchase}
          expenses={expenses}
          onExpenseCreated={(expense) =>
            setExpenses((currentExpenses) => [expense, ...currentExpenses])
          }
          suppliers={suppliers}
          onSuppliersChange={setSuppliers}
          notifications={notifications}
          onNotificationsChange={setNotifications}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
