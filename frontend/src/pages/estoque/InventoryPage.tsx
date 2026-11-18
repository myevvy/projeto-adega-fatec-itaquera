import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type InventoryPageProps = {
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const sectionTitle = 'flex items-center gap-2 text-base font-bold sm:text-lg'
const list = 'mt-1 flex flex-col'
const emptyText = 'mt-2 text-sm text-[#8a8678]'
const restockButton = `shrink-0 cursor-pointer rounded-lg bg-[#e3e9db] px-4 py-2.5 text-xs font-semibold text-[#3b4a2b] transition hover:bg-[#d5ddca] active:scale-[0.98] ${focusRing}`

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const getPrice = (product: Product): number | undefined => {
  const data = product as unknown as { price?: number; salePrice?: number }
  const value = data.price ?? data.salePrice
  return typeof value === 'number' ? value : undefined
}

const iconProps = {
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
}

function AlertIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={
        filled
          ? 'h-5 w-5 shrink-0 text-[#b5683c]'
          : 'h-4 w-4 shrink-0 text-[#b5683c]'
      }
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3l10 18H2L12 3z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6 shrink-0 text-[#b4b0a3]">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5 shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5 shrink-0" strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function StockChip({ product }: { product: Product }) {
  const empty = product.stock === 0
  const low = !empty && product.stock <= product.minimumStock
  const tone = empty
    ? 'bg-[#f6e2da] text-[#c8704d]'
    : low
      ? 'bg-[#3b4a2b] text-white'
      : 'bg-[#e3e9db] text-[#3b4a2b]'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}
    >
      {empty ? 'Zerado' : `${product.stock} un.`}
      {low && <span className="sr-only"> (estoque baixo)</span>}
    </span>
  )
}

type ProductRowProps = {
  detail: string
  onOpen: () => void
  onRestock?: () => void
  product: Product
}

function ProductRow({ detail, onOpen, onRestock, product }: ProductRowProps) {
  const price = getPrice(product)
  return (
    <li className="flex items-center gap-3 border-b border-[#e3dfd2] last:border-b-0">
      <button
        className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg py-3 text-left sm:gap-4 ${focusRing}`}
        onClick={onOpen}
        type="button"
      >
        <span
          aria-hidden="true"
          className="h-12 w-12 shrink-0 rounded-xl bg-[#e3e9db] sm:h-14 sm:w-14"
        />
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-semibold sm:text-[15px]">
            {product.name}
          </strong>
          <span className="mt-0.5 block truncate text-xs text-[#6f6b60]">
            {detail}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {price !== undefined && (
              <span className="text-sm font-bold">{formatCurrency(price)}</span>
            )}
            <StockChip product={product} />
          </span>
        </span>
        {!onRestock && <ChevronIcon />}
      </button>
      {onRestock && (
        <button className={restockButton} onClick={onRestock} type="button">
          Repor
        </button>
      )}
    </li>
  )
}

function InventoryPage({ onNavigate, products, setupData }: InventoryPageProps) {
  const [search, setSearch] = useState('')

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  )

  const query = normalize(search.trim())
  const visibleProducts = useMemo(
    () =>
      query
        ? activeProducts.filter((product) =>
            normalize(
              `${product.name} ${product.category} ${product.variety ?? ''}`,
            ).includes(query),
          )
        : activeProducts,
    [activeProducts, query],
  )

  const outOfStock = visibleProducts.filter((product) => product.stock === 0)
  const lowStock = visibleProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.minimumStock,
  )
  const healthyStock = visibleProducts.filter(
    (product) => product.stock > product.minimumStock,
  )

  const openProduct = (id: number) => onNavigate(`produtos/${id}`)
  const restockProduct = (id: number) =>
    onNavigate(`estoque/repor?produto=${id}`)

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="estoque"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-6 px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-5 min-[380px]:pt-8 sm:max-w-2xl sm:px-6 md:pt-10 lg:max-w-6xl lg:flex-1 lg:px-8 lg:pb-10 xl:px-12">
        <header className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[#1c1f1a] lg:text-3xl">
              Estoque
            </h1>
            <p className="mt-1 text-xs text-[#6f6b60] sm:text-sm">
              {activeProducts.length}{' '}
              {activeProducts.length === 1
                ? 'produto cadastrado'
                : 'produtos cadastrados'}
            </p>
          </div>
          <button
            className={`order-2 flex shrink-0 cursor-pointer items-center gap-1.5 rounded-2xl bg-[#3d4d35] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#33412c] active:scale-[0.98] ${focusRing}`}
            onClick={() => onNavigate('estoque/repor')}
            type="button"
          >
            <span aria-hidden="true">+</span> Entrada
          </button>
          <button
            className={`order-3 w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-[#1c1f1a] transition hover:bg-gray-50 sm:order-1 sm:w-auto sm:py-3 ${focusRing}`}
            onClick={() => onNavigate('estoque/relatorio')}
            type="button"
          >
            Relatório de estoque
          </button>
        </header>

        <div className="lg:max-w-xl">
          <label className="sr-only" htmlFor="inventory-search">
            Pesquisar produto
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-[#e3dfd2] bg-white px-4 py-3 text-[#6f6b60] transition focus-within:ring-2 focus-within:ring-[#3b4a2b]/30">
            <SearchIcon />
            <input
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-base text-[#26291f] outline-none placeholder:text-[#8a8678] sm:text-[15px]"
              id="inventory-search"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearch('')
              }}
              placeholder="Pesquisar por nome..."
              type="search"
              value={search}
            />
          </div>
        </div>

        {query && visibleProducts.length === 0 ? (
          <p
            className="rounded-2xl border border-dashed border-[#d6d1c0] bg-white px-4 py-8 text-center text-sm text-[#6f6b60]"
            role="status"
          >
            Nenhum produto encontrado para “{search.trim()}”.
          </p>
        ) : (
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
            <div className="flex min-w-0 flex-col gap-6">
              <section aria-labelledby="out-of-stock-heading">
                <h2 className={sectionTitle} id="out-of-stock-heading">
                  <AlertIcon filled />
                  Zerado ({outOfStock.length})
                </h2>
                {outOfStock.length ? (
                  <ul className={list}>
                    {outOfStock.map((product) => (
                      <ProductRow
                        detail={`${product.category} · Esgotado (mínimo ${product.minimumStock})`}
                        key={product.id}
                        onOpen={() => openProduct(product.id)}
                        onRestock={() => restockProduct(product.id)}
                        product={product}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className={emptyText}>Nenhum produto zerado.</p>
                )}
              </section>

              <section aria-labelledby="low-stock-heading">
                <h2 className={sectionTitle} id="low-stock-heading">
                  <AlertIcon />
                  Precisa de atenção ({lowStock.length})
                </h2>
                {lowStock.length ? (
                  <ul className={list}>
                    {lowStock.map((product) => (
                      <ProductRow
                        detail={`${product.category} · Só restam ${product.stock} un. (mínimo ${product.minimumStock})`}
                        key={product.id}
                        onOpen={() => openProduct(product.id)}
                        onRestock={() => restockProduct(product.id)}
                        product={product}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className={emptyText}>Nenhum produto com estoque baixo.</p>
                )}
              </section>
            </div>

            <section
              aria-labelledby="healthy-stock-heading"
              className="min-w-0"
            >
              <h2
                className="text-base font-bold sm:text-lg"
                id="healthy-stock-heading"
              >
                Em dia
              </h2>
              {healthyStock.length ? (
                <ul className={list}>
                  {healthyStock.map((product) => (
                    <ProductRow
                      detail={`${product.category} · ${product.variety}`}
                      key={product.id}
                      onOpen={() => openProduct(product.id)}
                      product={product}
                    />
                  ))}
                </ul>
              ) : (
                <p className={emptyText}>Nenhum produto com estoque em dia.</p>
              )}
            </section>
          </div>
        )}

        <button
          className={`cursor-pointer self-center rounded-lg px-2 py-1 text-sm font-medium underline-offset-4 hover:underline ${focusRing}`}
          onClick={() => onNavigate('produtos')}
          type="button"
        >
          Ver todos os produtos →
        </button>
      </section>

      <button
        className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-[#3b4a2b] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(38,41,31,0.25)] transition hover:bg-[#2f3b22] active:scale-[0.98] sm:right-6 lg:bottom-8 lg:right-8 ${focusRing}`}
        onClick={() => onNavigate('produtos/novo' as AppPath)}
        type="button"
      >
        <PlusIcon />
        Novo produto
      </button>
    </main>
  )
}

export default InventoryPage
