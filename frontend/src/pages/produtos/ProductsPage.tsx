import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type ProductsPageProps = {
  canManageProducts: boolean
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

const iconProps = {
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
}

function ArrowLeftIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <path d="M19 12H5M11 6l-6 6 6 6" />
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

function ChevronIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6 shrink-0 text-[#b4b0a3]">
      <path d="m9 6 6 6-6 6" />
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

function ProductsPage({
  canManageProducts,
  onNavigate,
  products,
  setupData,
}: ProductsPageProps) {
  const [search, setSearch] = useState('')

  const query = normalize(search.trim())
  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) => product.active && normalize(product.name).includes(query),
      ),
    [products, query],
  )

  const goNewProduct = () => onNavigate('produtos/novo')

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="produtos"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto flex w-full min-w-0 max-w-md flex-col px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-6 min-[380px]:px-5 min-[380px]:pt-8 sm:max-w-2xl sm:px-6 md:pt-10 lg:max-w-5xl lg:flex-1 lg:px-8 lg:pb-10 xl:px-12">
        <header className="flex items-center gap-3">
          <button
            aria-label="Voltar"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#26291f] transition hover:bg-[#ebe8dd] ${focusRing}`}
            onClick={() => onNavigate('estoque')}
            type="button"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold sm:text-xl lg:text-2xl">
            Produtos
          </h1>
          <span
            aria-live="polite"
            className="shrink-0 rounded-full bg-[#e3e9db] px-3 py-1 text-xs font-semibold text-[#3b4a2b]"
          >
            {pluralize(visibleProducts.length, 'item', 'itens')}
          </span>
          {canManageProducts && (
            <button
              className={`hidden shrink-0 items-center gap-2 rounded-2xl bg-[#3b4a2b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.98] lg:flex ${focusRing}`}
              onClick={goNewProduct}
              type="button"
            >
              <PlusIcon />
              Novo produto
            </button>
          )}
        </header>

        <div className="mt-5 lg:max-w-xl">
          <label className="sr-only" htmlFor="products-search">
            Pesquisar por nome
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-[#e3dfd2] bg-white px-4 py-3 text-[#6f6b60] transition focus-within:ring-2 focus-within:ring-[#3b4a2b]/30">
            <SearchIcon />
            <input
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-base text-[#26291f] outline-none placeholder:text-[#8a8678] sm:text-[15px]"
              id="products-search"
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

        {visibleProducts.length > 0 ? (
          <ul className="mt-5 divide-y divide-[#e3dfd2] border-y border-[#e3dfd2] lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-y-0 lg:border-y-0">
            {visibleProducts.map((product) => (
              <li
                className="lg:overflow-hidden lg:rounded-2xl lg:border lg:border-[#e3dfd2] lg:bg-white"
                key={product.id}
              >
                <button
                  className={`flex w-full cursor-pointer items-center gap-3 py-3.5 text-left transition sm:gap-4 lg:px-4 lg:hover:bg-[#fdfcf8] ${focusRing}`}
                  onClick={() => onNavigate(`produtos/${product.id}`)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="h-12 w-12 shrink-0 rounded-xl bg-[#e3e9db] sm:h-14 sm:w-14"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[15px] font-semibold">
                      {product.name}
                    </strong>
                    <span className="mt-0.5 block truncate text-xs text-[#6f6b60]">
                      {product.category}
                      {product.variety ? ` · ${product.variety}` : ''}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-bold">
                        {formatCurrency(product.price)}
                      </span>
                      <StockChip product={product} />
                    </span>
                  </span>
                  <ChevronIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="mt-6 rounded-2xl border border-dashed border-[#d6d1c0] bg-white px-4 py-8 text-center text-sm text-[#6f6b60]"
            role="status"
          >
            {query
              ? `Nenhum produto encontrado para “${search.trim()}”.`
              : canManageProducts
                ? 'Nenhum produto cadastrado. Toque em “Novo produto” para começar.'
                : 'Nenhum produto cadastrado.'}
          </p>
        )}
      </section>

      {canManageProducts && (
        <button
          className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-20 flex items-center gap-2 rounded-full bg-[#3b4a2b] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(38,41,31,0.25)] transition hover:bg-[#2f3b22] active:scale-[0.98] sm:right-6 lg:hidden ${focusRing}`}
          onClick={goNewProduct}
          type="button"
        >
          <PlusIcon />
          Novo produto
        </button>
      )}
    </main>
  )
}

export default ProductsPage
