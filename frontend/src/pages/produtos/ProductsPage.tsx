import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type ProductsPageProps = {
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ProductsPage({ onNavigate, products, setupData }: ProductsPageProps) {
  const [search, setSearch] = useState('')
  const visibleProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active &&
          product.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
      ),
    [products, search],
  )

  return (
    <main>
      <AppSidebar currentPage="produtos" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <header>
          <div>
            <h1>Produtos</h1>
            <p>{visibleProducts.length} itens cadastrados</p>
          </div>
          <label>
            Pesquisar por nome
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por nome..."
              type="search"
              value={search}
            />
          </label>
          <button onClick={() => onNavigate('produtos/novo')} type="button">
            + Novo produto
          </button>
        </header>
        {visibleProducts.length ? (
          <ul>
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <button onClick={() => onNavigate(`produtos/${product.id}`)} type="button">
                  <span aria-hidden="true">▧</span>
                  <strong>{product.name}</strong>
                  <span>{product.category} · {product.variety}</span>
                  <span>{formatCurrency(product.price)}</span>
                  <span>{product.stock} un.</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </section>
    </main>
  )
}

export default ProductsPage
