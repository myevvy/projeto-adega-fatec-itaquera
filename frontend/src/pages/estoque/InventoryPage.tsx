import { useMemo } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type InventoryPageProps = {
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

const sectionTitle = 'flex items-center gap-2 text-base font-bold'
const list = 'mt-1 flex flex-col'
const row =
  'flex items-center justify-between gap-3 border-b border-[#e3dfd2] py-3 last:border-b-0'
const productButton = `flex min-w-0 flex-1 cursor-pointer flex-col rounded-lg text-left ${focusRing}`
const productName = 'truncate text-sm font-semibold'
const productInfo = 'mt-0.5 text-xs text-[#6f6b60]'
const restockButton = `shrink-0 cursor-pointer rounded-lg bg-[#e3e9db] px-4 py-2 text-xs font-semibold text-[#3b4a2b] transition hover:bg-[#d5ddca] active:scale-[0.98] ${focusRing}`
const emptyText = 'mt-2 text-sm text-[#8a8678]'

function AlertIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={filled ? 'h-5 w-5 text-[#b5683c]' : 'h-4 w-4 text-[#b5683c]'}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24">
      <path d="M12 3l10 18H2L12 3z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function InventoryPage({ onNavigate, products, setupData }: InventoryPageProps) {
  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  )
  const outOfStock = activeProducts.filter((product) => product.stock === 0)
  const lowStock = activeProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.minimumStock,
  )
  const healthyStock = activeProducts.filter(
    (product) => product.stock > product.minimumStock,
  )
  const openProduct = (id: number) => onNavigate(`produtos/${id}`)

  return (
    <main className="min-h-screen bg-[#faf8f4] pb-24 md:pb-8">
      <AppSidebar currentPage="estoque" onNavigate={onNavigate} userName={setupData.adminName} />
      
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1f1a]">Estoque</h1>
            <p className="mt-1 text-xs text-[#6f6b60]">
                {activeProducts.length}{' '}
                {activeProducts.length === 1
                  ? 'produto cadastrado'
                  : 'produtos cadastrados'}</p>
          </div>
          <button 
          className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#3d4d35] px-4 py-3 text-sm font-medium text-white hover:bg-[#33412c]"
          onClick={() => onNavigate('estoque/repor')} 
          type="button">
             <span aria-hidden="true">+</span> Entrada
          </button>
          </div>
          <button 
          className="w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-[#1c1f1a] hover:bg-gray-50"
          onClick={() => onNavigate('estoque/relatorio')} 
          type="button">
            Relatório de estoque
          </button>
        </header>

        <section aria-labelledby="out-of-stock-heading">
          <h2 className={sectionTitle} id="out-of-stock-heading">
            <AlertIcon filled />
            Zerado ({outOfStock.length})</h2>
          {outOfStock.length ? (
            <ul className={list}>
              {outOfStock.map((product) => (
                <li className={row} key={product.id}>
                  <button 
                   className={productButton}
                  onClick={() => openProduct(product.id)} 
                  type="button">
                    <strong className={productName}>{product.name}</strong>
                    <span className={productInfo}>
                      {product.category} · Esgotado (mínimo {' '})
                      {product.minimumStock})
                    </span>
                  </button>
                  <button
                  className={restockButton}
                    onClick={() =>
                      onNavigate(`estoque/repor?produto=${product.id}`)
                    }
                    type="button">
                    Repor
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyText}>Nenhum produto zerado.</p>
          )}
        </section>

        <section aria-labelledby="low-stock-heading">
          <h2 className={sectionTitle} id="low-stock-heading">
            <AlertIcon />
            Precisa de atenção ({lowStock.length})</h2>
          {lowStock.length ? (
            <ul className={list}>
              {lowStock.map((product) => (
                <li className={row} key={product.id}>
                  <button 
                   className={productButton}
                  onClick={() => openProduct(product.id)} 
                  type="button">
                    <strong className={productName}>{product.name}</strong>
                    <span className={productInfo}>
                      {product.category} · Só restam {product.stock} un.
                      (mínimo {product.minimumStock})
                    </span>
                  </button>
                  <button
                   className={restockButton}
                    onClick={() =>
                      onNavigate(`estoque/repor?produto=${product.id}`)}
                    type="button">
                    Repor
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyText}>Nenhum produto com estoque baixo.</p>
          )}
        </section>

        <section aria-labelledby="healthy-stock-heading">
          <h2 className="text-base font-bold" id="healthy-stock-heading">
            Em dia</h2>
          {healthyStock.length ? (
            <ul className={list}>
              {healthyStock.map((product) => (
                <li className="border-b border-gray-200 last:border-b-0" 
                key={product.id}>
                  <button 
                  className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left"
                  onClick={() => openProduct(product.id)} 
                  type="button">
                     <span className="flex min-w-0 flex-col">
                      <strong className={productName}>{product.name}</strong>
                      <span className={productInfo}>
                        {product.category} · {product.variety}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#1c1f1a]">
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#5f8a4b]" />
                      {product.stock} un.
                      <ChevronIcon />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyText}>Nenhum produto com estoque em dia.</p>
          )}
        </section>

        <button
          className={`cursor-pointer self-center rounded-lg px-2 py-1 text-sm font-medium underline-offset-4 hover:underline ${focusRing}`}
          onClick={() => onNavigate('produtos')}
          type="button">
          Ver todos os produtos →
        </button>
      </section>
    </main>
  )
}

export default InventoryPage
