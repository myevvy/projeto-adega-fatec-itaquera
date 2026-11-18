import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type ProductDetailPageProps = {
  onNavigate: (path: AppPath) => void
  onUpdate: (product: Product) => Promise<void>
  product: Product
  setupData: SetupData
}

type Pending = 'deactivating' | 'reactivating' | null
type ToastKind = 'deactivated' | 'reactivated' | null

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const primaryButton = `w-full rounded-2xl bg-[#3b4a2b] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`
const secondaryButton = `w-full rounded-2xl border border-[#e3dfd2] bg-white py-3.5 text-[15px] font-medium text-[#26291f] transition hover:bg-[#fdfcf8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`
const dangerButton = `w-full rounded-2xl border border-[#e3dfd2] bg-white py-3.5 text-[15px] font-medium text-[#c8704d] transition hover:bg-[#fdf6f2] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

function ProductDetailPage({
  onNavigate,
  onUpdate,
  product,
  setupData,
}: ProductDetailPageProps) {
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false)
  const [toast, setToast] = useState<ToastKind>(null)
  const [pending, setPending] = useState<Pending>(null)
  const [actionError, setActionError] = useState('')

  const isBusy = pending !== null
  const isLowStock = product.stock <= product.minimumStock
  const stockBadge = product.stock === 0 ? 'Zerado' : 'Atenção'

  const changeActive = async (active: boolean) => {
    setActionError('')
    setPending(active ? 'reactivating' : 'deactivating')
    try {
      await onUpdate({ ...product, active })
      setConfirmingDeactivation(false)
      setToast(active ? 'reactivated' : 'deactivated')
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : active
            ? 'Não foi possível reativar o produto.'
            : 'Não foi possível inativar o produto.',
      )
    } finally {
      setPending(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="produtos"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto w-full min-w-0 max-w-md px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-5 min-[380px]:pt-8 sm:max-w-2xl sm:px-6 md:pt-10 lg:max-w-4xl lg:flex-1 lg:px-8 lg:pb-10 xl:px-12">
        <header className="flex items-center gap-3">
          <button
            aria-label="Voltar para produtos"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3dfd2] bg-white text-[#26291f] transition hover:bg-[#ebe8dd] ${focusRing}`}
            onClick={() => onNavigate('produtos')}
            type="button"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="min-w-0 truncate text-lg font-bold sm:text-xl lg:text-2xl">
            Detalhes do produto
          </h1>
        </header>

        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-4">
            <div
              aria-hidden="true"
              className="mx-auto h-24 w-24 rounded-3xl bg-[#e3e9db] sm:h-28 sm:w-28 lg:h-36 lg:w-36"
            />

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold sm:text-xl">
                {product.name}
              </h2>
              <p className="mt-1 text-xs text-[#6f6b60] sm:text-sm">
                {product.category}
                {product.variety ? ` · ${product.variety}` : ''}
              </p>
              {!product.active && (
                <span className="mt-2 inline-flex rounded-full bg-[#ebe8dd] px-2.5 py-0.5 text-xs font-medium text-[#6f6b60]">
                  Inativo
                </span>
              )}
            </div>

            <dl className="divide-y divide-[#e3dfd2] overflow-hidden rounded-2xl border border-[#e3dfd2] bg-white">
              <div className="px-4 py-3">
                <dt className="text-xs text-[#6f6b60]">Preço de venda</dt>
                <dd className="mt-0.5 text-[15px] font-bold">
                  {formatCurrency(product.price)}
                </dd>
              </div>
              <div className="px-4 py-3">
                <dt className="text-xs text-[#6f6b60]">Custo</dt>
                <dd className="mt-0.5 text-[15px] font-bold">
                  {formatCurrency(product.cost)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Estoque e ações */}
          <div className="min-w-0 space-y-4">
            <section
              aria-label="Estoque atual"
              className={`rounded-2xl px-4 py-4 sm:px-5 ${
                isLowStock ? 'bg-[#f5e6d3]' : 'bg-[#e3e9db]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[#4b4d42] sm:text-sm">
                  Estoque atual
                </p>
                <p
                  className={`text-xs font-medium sm:text-sm ${
                    isLowStock ? 'text-[#c8704d]' : 'text-[#3f6a2c]'
                  }`}
                >
                  {isLowStock ? stockBadge : 'Em dia'}
                </p>
              </div>
              <p className="mt-2 text-3xl font-bold">{product.stock} un.</p>
              <p className="mt-2 text-xs text-[#4b4d42] sm:text-sm">
                Mínimo cadastrado: {product.minimumStock} un.
              </p>
            </section>

            {actionError && (
              <p
                className="rounded-xl bg-[#f6e2da] px-4 py-3 text-sm text-[#a4502f]"
                role="alert"
              >
                {actionError}
              </p>
            )}
            {isBusy && (
              <p
                className="rounded-xl bg-[#ebe8dd] px-4 py-3 text-sm text-[#3b4a2b]"
                role="status"
              >
                {pending === 'deactivating'
                  ? 'Inativando produto...'
                  : 'Reativando produto...'}
              </p>
            )}

            <div className="space-y-3">
              {product.active && (
                <button
                  className={primaryButton}
                  disabled={isBusy}
                  onClick={() =>
                    onNavigate(`estoque/ajustar?produto=${product.id}`)
                  }
                  type="button"
                >
                  Movimentar estoque
                </button>
              )}
              <button
                className={secondaryButton}
                disabled={isBusy}
                onClick={() => onNavigate(`produtos/${product.id}/editar`)}
                type="button"
              >
                Editar produto
              </button>
              {product.active ? (
                <button
                  className={dangerButton}
                  disabled={isBusy}
                  onClick={() => setConfirmingDeactivation(true)}
                  type="button"
                >
                  Inativar produto
                </button>
              ) : (
                <button
                  className={secondaryButton}
                  disabled={isBusy}
                  onClick={() => void changeActive(true)}
                  type="button"
                >
                  Reativar produto
                </button>
              )}
            </div>
          </div>
        </div>

        {confirmingDeactivation && (
          <ConfirmDialog
            description={`O produto "${product.name}" deixará de aparecer nas vendas e listagens ativas.`}
            onCancel={() => setConfirmingDeactivation(false)}
            onConfirm={() => void changeActive(false)}
            title="Inativar produto?"
          />
        )}
        {toast === 'deactivated' && (
          <StatusToast
            message="Removido do catálogo de vendas ativos."
            onClose={() => setToast(null)}
            title="Produto inativado com sucesso."
          />
        )}
        {toast === 'reactivated' && (
          <StatusToast
            message="Disponível novamente no catálogo de vendas."
            onClose={() => setToast(null)}
            title="Produto reativado com sucesso."
          />
        )}
      </section>
    </main>
  )
}

export default ProductDetailPage
