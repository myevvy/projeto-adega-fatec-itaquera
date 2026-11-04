import { useMemo } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type InventoryPageProps = {
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
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
    <main>
      <AppSidebar currentPage="estoque" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <header>
          <div>
            <h1>Estoque</h1>
            <p>{activeProducts.length} produtos cadastrados</p>
          </div>
          <button onClick={() => onNavigate('estoque/repor')} type="button">
            + Entrada de estoque
          </button>
          <button onClick={() => onNavigate('estoque/relatorio')} type="button">
            Relatório de estoque
          </button>
        </header>
        <section aria-labelledby="out-of-stock-heading">
          <h2 id="out-of-stock-heading">Zerado ({outOfStock.length})</h2>
          {outOfStock.length ? (
            <ul>
              {outOfStock.map((product) => (
                <li key={product.id}>
                  <button onClick={() => openProduct(product.id)} type="button">
                    <strong>{product.name}</strong>
                    <span>{product.category} · Esgotado (mínimo {product.minimumStock})</span>
                  </button>
                  <button
                    onClick={() =>
                      onNavigate(`estoque/repor?produto=${product.id}`)
                    }
                    type="button"
                  >
                    Repor
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum produto zerado.</p>
          )}
        </section>
        <section aria-labelledby="low-stock-heading">
          <h2 id="low-stock-heading">Estoque baixo ({lowStock.length})</h2>
          {lowStock.length ? (
            <ul>
              {lowStock.map((product) => (
                <li key={product.id}>
                  <button onClick={() => openProduct(product.id)} type="button">
                    <strong>{product.name}</strong>
                    <span>
                      {product.category} · Só restam {product.stock} un. (mínimo{' '}
                      {product.minimumStock})
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      onNavigate(`estoque/repor?produto=${product.id}`)
                    }
                    type="button"
                  >
                    Repor
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum produto com estoque baixo.</p>
          )}
        </section>
        <section aria-labelledby="healthy-stock-heading">
          <h2 id="healthy-stock-heading">Em dia</h2>
          {healthyStock.length ? (
            <ul>
              {healthyStock.map((product) => (
                <li key={product.id}>
                  <button onClick={() => openProduct(product.id)} type="button">
                    <strong>{product.name}</strong>
                    <span>{product.category} · {product.variety}</span>
                    <span>{product.stock} un.</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum produto com estoque em dia.</p>
          )}
        </section>
        <button onClick={() => onNavigate('produtos')} type="button">
          Ver todos os produtos →
        </button>
      </section>
    </main>
  )
}

export default InventoryPage
