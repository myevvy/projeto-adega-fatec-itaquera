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
import SuppliersPage from '../pages/fornecedores/SuppliersPage'
import SupplierFormPage from '../pages/fornecedores/SupplierFormPage'
import SupplierDetailPage from '../pages/fornecedores/SupplierDetailPage'
import SettingsPage from '../pages/configuracoes/SettingsPage'
import ProfilePage from '../pages/perfil/ProfilePage'
import ReportsPage from '../pages/relatorios/ReportsPage'
import PurchasesPage from '../pages/compras/PurchasesPage'
import PurchaseFormPage from '../pages/compras/PurchaseFormPage'
import ForgotPasswordPage from '../pages/esqueci-senha/ForgotPasswordPage'
import type { Supplier } from '../types/fornecedor'
import type { ExpenseRecord, PurchaseRecord, SaleRecord } from '../types/financeiro'
import type { Product } from '../types/produto'
import type { AppPath } from '../types/sistema'
import type {
  NotificationPreferences,
  SetupData,
  WorkspaceUser,
} from '../types/usuario'

type AppRoutesProps = {
  onProductsChange: (products: Product[] | ((currentProducts: Product[]) => Product[])) => void
  onExpenseCreated: (expense: ExpenseRecord) => void
  onSaleCreated: (sale: SaleRecord) => void
  onPurchaseCreated: (purchase: PurchaseRecord) => void
  onSetupDataChange: (setupData: SetupData) => void
  onSuppliersChange: (
    suppliers: Supplier[] | ((currentSuppliers: Supplier[]) => Supplier[]),
  ) => void
  onUsersChange: (
    users: WorkspaceUser[] | ((currentUsers: WorkspaceUser[]) => WorkspaceUser[]),
  ) => void
  onNotificationsChange: (preferences: NotificationPreferences) => void
  expenses: ExpenseRecord[]
  purchases: PurchaseRecord[]
  products: Product[]
  sales: SaleRecord[]
  setupData: SetupData
  suppliers: Supplier[]
  users: WorkspaceUser[]
  notifications: NotificationPreferences
}

function AppRoutes({
  onProductsChange,
  onExpenseCreated,
  onSaleCreated,
  onPurchaseCreated,
  onSetupDataChange,
  onSuppliersChange,
  onUsersChange,
  onNotificationsChange,
  expenses,
  purchases,
  products,
  sales,
  setupData,
  suppliers,
  users,
  notifications,
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
  const supplierById = (id: string) =>
    suppliers.find((supplier) => supplier.id === id)
  const saveSupplier = (supplier: Supplier) =>
    onSuppliersChange((currentSuppliers) => {
      const exists = currentSuppliers.some((current) => current.id === supplier.id)
      return exists
        ? currentSuppliers.map((current) =>
            current.id === supplier.id ? supplier : current,
          )
        : [...currentSuppliers, supplier]
    })

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
            onForgotPassword={() => navigateTo('esqueci-senha')}
          />
        }
      />
      <Route
        path="/esqueci-senha"
        element={<ForgotPasswordPage onBackToLogin={() => navigateTo('login')} />}
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
      <Route
        path="/fornecedores"
        element={
          <SuppliersPage
            onNavigate={navigateTo}
            setupData={setupData}
            suppliers={suppliers}
          />
        }
      />
      <Route
        path="/fornecedores/novo"
        element={
          <SupplierFormPage
            onNavigate={navigateTo}
            onSave={saveSupplier}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/fornecedores/:supplierId/editar"
        element={
          <SupplierEditRoute
            onNavigate={navigateTo}
            onSave={saveSupplier}
            setupData={setupData}
            supplierById={supplierById}
          />
        }
      />
      <Route
        path="/fornecedores/:supplierId"
        element={
          <SupplierDetailRoute
            onDelete={(supplierId) =>
              onSuppliersChange((currentSuppliers) =>
                currentSuppliers.filter((supplier) => supplier.id !== supplierId),
              )
            }
            onNavigate={navigateTo}
            onUpdate={saveSupplier}
            setupData={setupData}
            supplierById={supplierById}
          />
        }
      />
      <Route
        path="/configuracoes"
        element={
          <SettingsPage
            onNavigate={navigateTo}
            onSetupDataChange={onSetupDataChange}
            onUsersChange={onUsersChange}
            setupData={setupData}
            users={users}
          />
        }
      />
      <Route
        path="/perfil"
        element={
          <ProfilePage
            notifications={notifications}
            onNavigate={navigateTo}
            onNotificationsChange={onNotificationsChange}
            onSetupDataChange={onSetupDataChange}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/relatorios"
        element={<ReportsPage onNavigate={navigateTo} setupData={setupData} />}
      />
      <Route
        path="/compras"
        element={
          <PurchasesPage
            onNavigate={navigateTo}
            purchases={purchases}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/compras/nova"
        element={
          <PurchaseFormPage
            onNavigate={navigateTo}
            onSave={onPurchaseCreated}
            products={products}
            setupData={setupData}
            suppliers={suppliers}
          />
        }
      />
      <Route path="/" element={<Navigate replace to="/cadastro" />} />
      <Route path="*" element={<Navigate replace to="/cadastro" />} />
    </Routes>
  )
}

type SupplierRouteProps = {
  onDelete?: (supplierId: string) => void
  onNavigate: (path: AppPath) => void
  onSave?: (supplier: Supplier) => void
  onUpdate?: (supplier: Supplier) => void
  setupData: SetupData
  supplierById: (id: string) => Supplier | undefined
}

function SupplierEditRoute({
  onNavigate,
  onSave,
  setupData,
  supplierById,
}: SupplierRouteProps) {
  const { supplierId } = useParams()
  const supplier = supplierId ? supplierById(supplierId) : undefined
  if (!supplier || !onSave) return <Navigate replace to="/fornecedores" />
  return (
    <SupplierFormPage
      onNavigate={onNavigate}
      onSave={onSave}
      setupData={setupData}
      supplier={supplier}
    />
  )
}

function SupplierDetailRoute({
  onDelete,
  onNavigate,
  onUpdate,
  setupData,
  supplierById,
}: SupplierRouteProps) {
  const { supplierId } = useParams()
  const supplier = supplierId ? supplierById(supplierId) : undefined
  if (!supplier || !onDelete || !onUpdate) {
    return <Navigate replace to="/fornecedores" />
  }
  return (
    <SupplierDetailPage
      onDelete={onDelete}
      onNavigate={onNavigate}
      onUpdate={onUpdate}
      setupData={setupData}
      supplier={supplier}
    />
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
