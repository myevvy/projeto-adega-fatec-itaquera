import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, PaymentMethod, Product, SaleRecord, SetupData } from '../../types'

type NewSalePageProps = {
  onNavigate: (page: AppPath) => void
  onSaleCreated: (sale: SaleRecord) => void
  products: Product[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function NewSalePage({ onNavigate, onSaleCreated, products, setupData }: NewSalePageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [confirmation, setConfirmation] = useState('')

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR'))
        const matchesCategory = category === 'Todos' || product.category === category
        return product.active && matchesSearch && matchesCategory
      }),
    [category, products, search],
  )

  const saleItems = products.filter(
    (product) => product.active && quantities[product.id] > 0,
  )
  const total = saleItems.reduce(
    (sum, product) => sum + product.price * quantities[product.id],
    0,
  )
  const itemCount = saleItems.reduce(
    (sum, product) => sum + quantities[product.id],
    0,
  )

  const adjustQuantity = (productId: number, amount: number) => {
    setConfirmation('')
    setQuantities((current) => {
      const next = (current[productId] ?? 0) + amount
      const product = products.find((candidate) => candidate.id === productId)
      if (amount > 0 && (!product || next > product.stock)) {
        return current
      }
      if (next <= 0) {
        const updated = { ...current }
        delete updated[productId]
        return updated
      }
      return { ...current, [productId]: next }
    })
  }

  const confirmSale = () => {
    if (!paymentMethod || saleItems.length === 0) {
      return
    }

    onSaleCreated({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      items: saleItems.map((product) => ({
        productId: product.id,
        name: product.name,
        quantity: quantities[product.id],
        unitPrice: product.price,
      })),
      paymentMethod,
      total,
    })
    setConfirmation(`Venda registrada: ${formatCurrency(total)} via ${paymentMethod}.`)
    setQuantities({})
    setPaymentMethod('')
  }

  return (
    <main>
      <AppSidebar
        currentPage="vendas/nova-venda"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <button onClick={() => onNavigate('vendas')} type="button">
          ← Histórico de vendas
        </button>
        <h1>Nova Venda</h1>
        <div>
          <label>
            Buscar produto pelo nome
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto pelo nome..."
              type="search"
              value={search}
            />
          </label>
          <div aria-label="Filtrar por categoria">
            {['Todos', ...new Set(products.map((product) => product.category))].map((option) => (
              <button
                aria-pressed={category === option}
                key={option}
                onClick={() => setCategory(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <ul>
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>
                <p>{formatCurrency(product.price)} / un</p>
                {quantities[product.id] ? (
                  <div>
                    <button
                      aria-label={`Remover uma unidade de ${product.name}`}
                      onClick={() => adjustQuantity(product.id, -1)}
                      type="button"
                    >
                      −
                    </button>
                    <span>{quantities[product.id]}</span>
                    <button
                      aria-label={`Adicionar uma unidade de ${product.name}`}
                      onClick={() => adjustQuantity(product.id, 1)}
                      disabled={(quantities[product.id] ?? 0) >= product.stock}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => adjustQuantity(product.id, 1)}
                    disabled={product.stock === 0}
                    type="button"
                  >
                    + Adicionar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <aside>
          <section aria-labelledby="sale-summary">
            <h2 id="sale-summary">Resumo da venda</h2>
            <p>{itemCount} itens</p>
            <ul>
              {saleItems.map((product) => (
                <li key={product.id}>
                  {quantities[product.id]}× {product.name} —{' '}
                  {formatCurrency(product.price * quantities[product.id])}
                </li>
              ))}
            </ul>
            <p>Adicionar desconto: R$ 0,00</p>
            <p>
              <strong>Total: {formatCurrency(total)}</strong>
            </p>
          </section>
          <fieldset>
            <legend>Forma de pagamento</legend>
            {(['Dinheiro', 'PIX', 'Cartão'] as const).map((method) => (
              <button
                aria-pressed={paymentMethod === method}
                key={method}
                onClick={() => setPaymentMethod(method)}
                type="button"
              >
                {method}
              </button>
            ))}
          </fieldset>
          <button
            disabled={itemCount === 0 || !paymentMethod}
            onClick={confirmSale}
            type="button"
          >
            Confirmar venda · {formatCurrency(total)}
          </button>
          {confirmation && <p role="status">{confirmation}</p>}
        </aside>
      </section>
    </main>
  )
}

export default NewSalePage
