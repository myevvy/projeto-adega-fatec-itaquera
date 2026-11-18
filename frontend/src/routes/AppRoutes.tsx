import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAdministratorProfile } from '../services/authService'
import {
  adjustProductStock,
  cancelExpense,
  cancelPurchase,
  cancelSale,
  createExpense,
  createProduct,
  createPurchase,
  createSale,
  deactivateProduct,
  deactivateSupplier,
  getExpenseCategoryId,
  listExpenses,
  listProducts,
  listPurchases,
  listSales,
  listSuppliers,
  saveSupplier as saveSupplierRequest,
  supplierPurchasesFromRecords,
  updateProduct as updateProductRequest,
} from '../services/businessDataService'
import InventoryPage from '../pages/estoque/InventoryPage'
import StockAdjustmentPage from '../pages/estoque/StockAdjustmentPage'
import StockReportPage from '../pages/estoque/StockReportPage'
import StockRestockPage from '../pages/estoque/StockRestockPage'
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
import UsersPage from '../pages/usuarios/UsersPage'
import type { Supplier } from '../types/fornecedor'
import type { ExpenseRecord, PurchaseRecord, SaleRecord } from '../types/financeiro'
import type { Product } from '../types/produto'
import type { AppPath } from '../types/sistema'
import type {
  NotificationPreferences,
  SetupData,
} from '../types/usuario'

type AppRoutesProps = {
  onProductsChange: (products: Product[] | ((currentProducts: Product[]) => Product[])) => void
  onSalesChange: (sales: SaleRecord[]) => void
  onPurchasesChange: (purchases: PurchaseRecord[]) => void
  onExpensesChange: (expenses: ExpenseRecord[]) => void
  onExpenseCreated: (expense: ExpenseRecord) => void
  onSaleCreated: (sale: SaleRecord) => void
  onPurchaseCreated: (purchase: PurchaseRecord) => void
  onSetupDataChange: (setupData: SetupData) => void
  onSuppliersChange: (
    suppliers: Supplier[] | ((currentSuppliers: Supplier[]) => Supplier[]),
  ) => void
  onNotificationsChange: (preferences: NotificationPreferences) => void
  expenses: ExpenseRecord[]
  purchases: PurchaseRecord[]
  products: Product[]
  sales: SaleRecord[]
  setupData: SetupData
  suppliers: Supplier[]
  notifications: NotificationPreferences
}

function AppRoutes({
  onProductsChange,
  onSalesChange,
  onPurchasesChange,
  onExpensesChange,
  onExpenseCreated,
  onSaleCreated,
  onPurchaseCreated,
  onSetupDataChange,
  onSuppliersChange,
  onNotificationsChange,
  expenses,
  purchases,
  products,
  sales,
  setupData,
  suppliers,
  notifications,
}: AppRoutesProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout, session } = useAuth()
  const [dataLoadError, setDataLoadError] = useState('')
  const publicPaths = ['/', '/login', '/esqueci-senha']

  useEffect(() => {
    let active = true
    if (!session) {
      onProductsChange([])
      onSalesChange([])
      onPurchasesChange([])
      onExpensesChange([])
      onSuppliersChange([])
      return () => {
        active = false
      }
    }

    onProductsChange([])
    onSalesChange([])
    onPurchasesChange([])
    onExpensesChange([])
    onSuppliersChange([])
    const loadData = async () => {
      const results = await Promise.allSettled([
        listProducts(session.token),
        listSales(session.token),
        listPurchases(session.token),
        listExpenses(session.token),
        listSuppliers(session.token),
      ])
      if (!active) return

      const errors: string[] = []
      const [productsResult, salesResult, purchasesResult, expensesResult, suppliersResult] =
        results
      if (productsResult.status === 'fulfilled') {
        onProductsChange(productsResult.value)
      } else {
        errors.push(`produtos: ${productsResult.reason instanceof Error ? productsResult.reason.message : 'falha ao carregar'}`)
      }
      if (salesResult.status === 'fulfilled') {
        onSalesChange(salesResult.value)
      } else {
        errors.push(`vendas: ${salesResult.reason instanceof Error ? salesResult.reason.message : 'falha ao carregar'}`)
      }
      if (purchasesResult.status === 'fulfilled') {
        onPurchasesChange(purchasesResult.value)
      } else {
        errors.push(`compras: ${purchasesResult.reason instanceof Error ? purchasesResult.reason.message : 'falha ao carregar'}`)
      }
      if (expensesResult.status === 'fulfilled') {
        onExpensesChange(expensesResult.value)
      } else {
        errors.push(`despesas: ${expensesResult.reason instanceof Error ? expensesResult.reason.message : 'falha ao carregar'}`)
      }
      if (suppliersResult.status === 'fulfilled') {
        const purchasesBySupplier = supplierPurchasesFromRecords(
          purchasesResult.status === 'fulfilled' ? purchasesResult.value : [],
        )
        onSuppliersChange(
          suppliersResult.value.map((supplier) => ({
            ...supplier,
            purchases: purchasesBySupplier.get(supplier.id) ?? [],
          })),
        )
      } else {
        errors.push(`fornecedores: ${suppliersResult.reason instanceof Error ? suppliersResult.reason.message : 'falha ao carregar'}`)
      }
      setDataLoadError(errors.join(' · '))
    }
    void loadData()
    return () => {
      active = false
    }
  }, [
    session,
    onProductsChange,
    onSalesChange,
    onPurchasesChange,
    onExpensesChange,
    onSuppliersChange,
  ])

  if (!session && !publicPaths.includes(location.pathname)) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  const isAdministrator = isAdministratorProfile(session?.usuario.perfil)
  const navigateTo = (page: AppPath) => navigate(`/${page}`)
  const handleLogin = async (email: string, password: string) => {
    const authenticatedSession = await login(email, password)
    onSetupDataChange({
      ...setupData,
      adminName: authenticatedSession.usuario.nome,
      email: authenticatedSession.usuario.email,
    })

    const routeState = location.state as
      | { from?: { pathname?: unknown } }
      | null
    const destination =
      typeof routeState?.from?.pathname === 'string' &&
      routeState.from.pathname.startsWith('/')
        ? routeState.from.pathname
        : '/dashboard'
    navigate(destination, { replace: true })
  }
  const refreshProducts = async () => {
    if (!session) return
    try {
      onProductsChange(await listProducts(session.token))
    } catch (error) {
      setDataLoadError(
        `produto salvo, mas a atualização do estoque falhou: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )
    }
  }
  const saveProduct = async (product: Product, image?: File) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const existing = products.some((current) => current.id === product.id)
    if (existing) {
      await updateProductRequest(session.token, product)
      onProductsChange((currentProducts) =>
        currentProducts.map((current) =>
          current.id === product.id ? product : current,
        ),
      )
    } else {
      const created = await createProduct(session.token, product, image)
      onProductsChange((currentProducts) => [...currentProducts, created])
    }
  }
  const updateProduct = async (product: Product) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const current = products.find((item) => item.id === product.id)
    if (current?.active && !product.active) {
      await deactivateProduct(session.token, product.id)
      onProductsChange((currentProducts) =>
        currentProducts.filter((currentProduct) => currentProduct.id !== product.id),
      )
      return
    } else if (current && current.stock !== product.stock) {
      await adjustProductStock(session.token, product.id, product.stock)
    } else {
      await updateProductRequest(session.token, product)
    }
    onProductsChange((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === product.id ? product : currentProduct,
      ),
    )
  }
  const saveSale = async (sale: SaleRecord) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const created = await createSale(session.token, sale)
    onSaleCreated(created)
    await refreshProducts()
  }
  const savePurchase = async (purchase: PurchaseRecord) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const created = await createPurchase(session.token, purchase)
    onPurchaseCreated(created)
    await refreshProducts()
    onSuppliersChange((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === created.supplierId
          ? {
              ...supplier,
              purchases: [
                {
                  id: created.id,
                  date: created.date,
                  itemCount: created.quantity,
                  total: created.total,
                },
                ...supplier.purchases,
              ],
            }
          : supplier,
      ),
    )
  }
  const saveExpense = async (expense: ExpenseRecord) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const categoryId = getExpenseCategoryId(expenses, expense.category)
    if (!categoryId) {
      throw new Error(
        'O backend não disponibiliza a lista de categorias. Não é possível identificar o ID desta categoria para salvar a despesa.',
      )
    }
    const created = await createExpense(session.token, expense, categoryId)
    onExpenseCreated(created)
  }
  const handleCancelSale = async (saleId: string) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    await cancelSale(session.token, saleId)
    try {
      onSalesChange(await listSales(session.token))
    } catch (error) {
      setDataLoadError(
        `venda cancelada, mas o histórico não atualizou: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )
    }
    await refreshProducts()
  }
  const handleCancelPurchase = async (purchaseId: string) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    await cancelPurchase(session.token, purchaseId)
    try {
      onPurchasesChange(await listPurchases(session.token))
    } catch (error) {
      setDataLoadError(
        `compra cancelada, mas o histórico não atualizou: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )
    }
    await refreshProducts()
  }
  const handleCancelExpense = async (expenseId: string) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    await cancelExpense(session.token, expenseId)
    try {
      onExpensesChange(await listExpenses(session.token))
    } catch (error) {
      setDataLoadError(
        `despesa estornada, mas o histórico não atualizou: ${
          error instanceof Error ? error.message : 'erro desconhecido'
        }`,
      )
    }
  }
  const productById = (id: string) =>
    products.find((product) => product.id === Number(id))
  const supplierById = (id: string) =>
    suppliers.find((supplier) => supplier.id === id)
  const saveSupplier = async (supplier: Supplier): Promise<Supplier> => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    const isNew = !suppliers.some((current) => current.id === supplier.id)
    const saved = await saveSupplierRequest(session.token, supplier, isNew)
    onSuppliersChange((currentSuppliers) =>
      isNew
        ? [...currentSuppliers, saved]
        : currentSuppliers.map((current) =>
            current.id === saved.id ? saved : current,
          ),
    )
    return saved
  }
  const deleteSupplier = async (supplierId: string) => {
    if (!session) throw new Error('Sua sessão expirou. Entre novamente.')
    await deactivateSupplier(session.token, supplierId)
    onSuppliersChange((currentSuppliers) =>
      currentSuppliers.filter((supplier) => supplier.id !== supplierId),
    )
  }
  const expenseCategories = expenses.reduce<{ id: number; name: string }[]>(
    (categories, expense) => {
      if (
        typeof expense.categoryId === 'number' &&
        !categories.some((category) => category.id === expense.categoryId)
      ) {
        categories.push({
          id: expense.categoryId,
          name: expense.category,
        })
      }
      return categories
    },
    [],
  )

  return (
    <>
    {session && dataLoadError && (
      <p
        aria-live="polite"
        className="fixed inset-x-4 top-4 z-50 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow"
        role="alert"
      >
        Alguns dados não puderam ser sincronizados com o backend: {dataLoadError}
      </p>
    )}
    <Routes>
      <Route
        path="/cadastro"
        element={
          <Navigate
            replace
            to={
              session
                ? isAdministrator
                  ? '/configuracoes/usuarios'
                  : '/dashboard'
                : '/login'
            }
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={handleLogin}
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
            expenses={expenses}
            products={products}
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
            categories={expenseCategories}
            onNavigate={navigateTo}
            onSave={saveExpense}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/financeiro/despesas/relatorio"
        element={
          isAdministrator ? (
            <ExpenseReportPage
              onCancelExpense={handleCancelExpense}
              onNavigate={navigateTo}
              setupData={setupData}
            />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/vendas"
        element={
          <SalesHistoryPage
            onNavigate={navigateTo}
            onCancelSale={handleCancelSale}
            sales={sales}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/vendas/relatorio"
        element={
          isAdministrator ? (
            <SalesReportPage onNavigate={navigateTo} setupData={setupData} />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/nova-venda"
        element={
          <SalePage
            setupData={setupData}
            onNavigate={navigateTo}
            onSaleCreated={saveSale}
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
          isAdministrator ? (
            <StockAdjustmentPage
              onNavigate={navigateTo}
              onUpdate={updateProduct}
              products={products}
              setupData={setupData}
            />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/estoque/repor"
        element={
          <StockRestockPage
            onNavigate={navigateTo}
            onSavePurchase={savePurchase}
            products={products}
            suppliers={suppliers}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/estoque/relatorio"
        element={
          isAdministrator ? (
            <StockReportPage onNavigate={navigateTo} setupData={setupData} />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/produtos"
        element={
          <ProductsPage
            canManageProducts={isAdministrator}
            onNavigate={navigateTo}
            products={products}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/produtos/novo"
        element={
          isAdministrator ? (
            <ProductFormPage
              categories={[...new Set(products.map((product) => product.category))]}
              onNavigate={navigateTo}
              onSave={saveProduct}
              setupData={setupData}
            />
          ) : (
            <Navigate replace to="/produtos" />
          )
        }
      />
      <Route
        path="/produtos/:productId/editar"
        element={
          isAdministrator ? (
            <ProductEditRoute
              categories={[...new Set(products.map((product) => product.category))]}
              onNavigate={navigateTo}
              onSave={saveProduct}
              productById={productById}
              setupData={setupData}
            />
          ) : (
            <Navigate replace to="/produtos" />
          )
        }
      />
      <Route
        path="/produtos/:productId"
        element={
          <ProductDetailRoute
            canManageProducts={isAdministrator}
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
            onDelete={deleteSupplier}
            onNavigate={navigateTo}
            setupData={setupData}
            supplierById={supplierById}
          />
        }
      />
      <Route
        path="/configuracoes"
        element={
          isAdministrator ? (
            <SettingsPage
              onNavigate={navigateTo}
              onSetupDataChange={onSetupDataChange}
              setupData={setupData}
            />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/configuracoes/usuarios"
        element={
          isAdministrator ? (
            <UsersPage onNavigate={navigateTo} />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/usuarios"
        element={
          <Navigate
            replace
            to={isAdministrator ? '/configuracoes/usuarios' : '/dashboard'}
          />
        }
      />
      <Route
        path="/perfil"
        element={
          <ProfilePage
            notifications={notifications}
            onLogout={logout}
            onNavigate={navigateTo}
            onNotificationsChange={onNotificationsChange}
            onSetupDataChange={onSetupDataChange}
            setupData={setupData}
          />
        }
      />
      <Route
        path="/relatorios"
        element={
          isAdministrator ? (
            <ReportsPage onNavigate={navigateTo} setupData={setupData} />
          ) : (
            <Navigate replace to="/dashboard" />
          )
        }
      />
      <Route
        path="/compras"
        element={
          <PurchasesPage
            onNavigate={navigateTo}
            onCancelPurchase={handleCancelPurchase}
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
            onSave={savePurchase}
            products={products}
            setupData={setupData}
            suppliers={suppliers}
          />
        }
      />
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="*" element={<Navigate replace to="/dashboard" />} />
    </Routes>
    </>
  )
}

type SupplierRouteProps = {
  onDelete?: (supplierId: string) => Promise<void>
  onNavigate: (path: AppPath) => void
  onSave?: (supplier: Supplier) => Promise<Supplier>
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
  setupData,
  supplierById,
}: SupplierRouteProps) {
  const { supplierId } = useParams()
  const supplier = supplierId ? supplierById(supplierId) : undefined
  if (!supplier || !onDelete) {
    return <Navigate replace to="/fornecedores" />
  }
  return (
    <SupplierDetailPage
      onDelete={onDelete}
      onNavigate={onNavigate}
      setupData={setupData}
      supplier={supplier}
    />
  )
}

type ProductRouteProps = {
  categories?: string[]
  canManageProducts?: boolean
  onNavigate: (path: AppPath) => void
  onSave?: (product: Product, image?: File) => Promise<void>
  onUpdate?: (product: Product) => Promise<void>
  productById: (id: string) => Product | undefined
  setupData: SetupData
}

function ProductEditRoute({
  categories,
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
      categories={categories ?? []}
      onNavigate={onNavigate}
      onSave={onSave}
      product={product}
      setupData={setupData}
    />
  )
}

function ProductDetailRoute({
  canManageProducts = false,
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
      canManageProducts={canManageProducts}
      onNavigate={onNavigate}
      onUpdate={onUpdate}
      product={product}
      setupData={setupData}
    />
  )
}

export default AppRoutes
