import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import InventoryPage from '../pages/estoque/InventoryPage'
import StockAdjustmentPage from '../pages/estoque/StockAdjustmentPage'
import StockReportPage from '../pages/estoque/StockReportPage'
import StockRestockPage from '../pages/estoque/StockRestockPage'
import SignupPage from '../pages/cadastro/SignupPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import ExpenseFormPage from '../pages/financeiro/ExpenseFormPage'
import ExpenseReportPage from '../pages/financeiro/ExpenseReportPage'
import FinancePage from '../pages/financeiro/FinancePage'
import LoginPage from '../pages/login/LoginPage'
import SalesHistoryPage from '../pages/venda/SalesHistoryPage'
import SalesReportPage from '../pages/venda/SalesReportPage'
import SalePage from '../pages/venda/SalePage'
import ProductDetailPage from '../pages/produtos/ProductDetailPage'
import ProductFormPage from '../pages/produtos/ProductFormPage'
import ProductsPage from '../pages/produtos/ProductsPage'
import type {
  AppPath,
  ExpenseRecord,
  Product,
  SaleRecord,
  SetupData,
} from '../types'

type AppRoutesProps = {
  onProductsChange: (products: Product[] | ((currentProducts: Product[]) => Product[])) => void
  onExpenseCreated: (expense: ExpenseRecord) => void
  onSaleCreated: (sale: SaleRecord) => void
  onSetupDataChange: (setupData: SetupData) => void
  expenses: ExpenseRecord[]
  products: Product[]
  sales: SaleRecord[]
  setupData: SetupData
}

function AppRoutes({
  onProductsChange,
  onExpenseCreated,
  onSaleCreated,
  onSetupDataChange,
  expenses,
  products,
  sales,
  setupData,
}: AppRoutesProps) {
  const navigate = useNavigate()
  const navigateTo = (page: AppPath) => navigate(`/${page}`)
  const saveProduct = (product: Product) =>
    onProductsChange((currentProducts) => {
      const exists = currentProducts.some((current) => current.id === product.id)
      return exists
        ? currentProducts.map((current) =>
            current.id === product.id ? product : current,
          )
        : [...currentProducts, product]
    })
  const updateProduct = (product: Product) =>
    onProductsChange((currentProducts) =>
      currentProducts.map((current) =>
        current.id === product.id ? product : current,
      ),
    )
  const productById = (id: string) =>
    products.find((product) => product.id === Number(id))

  return (
    <Routes>
      <Route
        path="/cadastro"
        element={
          <SignupPage
            setupData={setupData}
            onChange={onSetupDataChange}
            onLogin={() => navigateTo('login')}
            onComplete={() => navigateTo('dashboard')}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={() => navigateTo('dashboard')}
            onCreateAccount={() => navigateTo('cadastro')}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            setupData={setupData}
            sales={sales}
            onNavigate={navigateTo}
          />
        }
      />
      <Route
        path="/financeiro"
        element={
          <FinancePage
            expenses={expenses}
            onNavigate={navigateTo}
            sales={sales}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/financeiro/despesas/nova"
        element={
          <ExpenseFormPage
            onNavigate={navigateTo}
            onSave={onExpenseCreated}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/financeiro/despesas/relatorio"
        element={
          <ExpenseReportPage
            expenses={expenses}
            onNavigate={navigateTo}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/vendas"
        element={
          <SalesHistoryPage
            onNavigate={navigateTo}
            sales={sales}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/vendas/relatorio"
        element={
          <SalesReportPage
            onNavigate={navigateTo}
            sales={sales}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/nova-venda"
        element={
          <SalePage
            setupData={setupData}
            onNavigate={navigateTo}
            onSaleCreated={onSaleCreated}
            products={products}
          />
        }
      />
      <Route
        path="/estoque"
        element={
          <InventoryPage
            onNavigate={navigateTo}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/estoque/ajustar"
        element={
          <StockAdjustmentPage
            onNavigate={navigateTo}
            onUpdate={updateProduct}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/estoque/repor"
        element={
          <StockRestockPage
            onNavigate={navigateTo}
            onUpdate={updateProduct}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/estoque/relatorio"
        element={
          <StockReportPage
            onNavigate={navigateTo}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/produtos"
        element={
          <ProductsPage
            onNavigate={navigateTo}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/produtos/novo"
        element={
          <ProductFormPage
            onNavigate={navigateTo}
            onSave={saveProduct}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/produtos/:productId/editar"
        element={
          <ProductEditRoute
            onNavigate={navigateTo}
            onSave={saveProduct}
            productById={productById}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/produtos/:productId"
        element={
          <ProductDetailRoute
            onNavigate={navigateTo}
            onUpdate={updateProduct}
            productById={productById}
            setupData={setupData}
          />
        }
      />
      <Route path="/" element={<Navigate replace to="/cadastro" />} />
      <Route path="*" element={<Navigate replace to="/cadastro" />} />
    </Routes>
  )
}

type ProductRouteProps = {
  onNavigate: (path: AppPath) => void
  onSave?: (product: Product) => void
  onUpdate?: (product: Product) => void
  productById: (id: string) => Product | undefined
  setupData: SetupData
}

function ProductEditRoute({
  onNavigate,
  onSave,
  productById,
  setupData,
}: ProductRouteProps) {
  const { productId } = useParams()
  const product = productId ? productById(productId) : undefined
  if (!product || !onSave) return <Navigate replace to="/produtos" />
  return (
    <ProductFormPage
      onNavigate={onNavigate}
      onSave={onSave}
      product={product}
      setupData={setupData}
    />
  )
}

function ProductDetailRoute({
  onNavigate,
  onUpdate,
  productById,
  setupData,
}: ProductRouteProps) {
  const { productId } = useParams()
  const product = productId ? productById(productId) : undefined
  if (!product || !onUpdate) return <Navigate replace to="/produtos" />
  return (
    <ProductDetailPage
      onNavigate={onNavigate}
      onUpdate={onUpdate}
      product={product}
      setupData={setupData}
    />
  )
}

export default AppRoutes
