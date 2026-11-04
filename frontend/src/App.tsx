import { BrowserRouter } from 'react-router-dom'
import PwaInstallPrompt from './components/pwa-install-prompt/PwaInstallPrompt'
import AppRoutes from './routes/AppRoutes'
import useLocalStorage from './hooks/useLocalStorage'
import type { ExpenseRecord, Product, SaleRecord, SetupData } from './types'

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
          expenses={expenses}
          onExpenseCreated={(expense) =>
            setExpenses((currentExpenses) => [expense, ...currentExpenses])
          }
        />
      </>
    </BrowserRouter>
  )
}

export default App
