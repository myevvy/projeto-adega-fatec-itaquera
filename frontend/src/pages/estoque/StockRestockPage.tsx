import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type StockRestockPageProps = {
  onNavigate: (path: AppPath) => void
  onUpdate: (product: Product) => void
  products: Product[]
  setupData: SetupData
}

const suppliers = ['Distribuidora Central', 'Adega Atacado', 'Fornecedor local']

function StockRestockPage({
  onNavigate,
  onUpdate,
  products,
  setupData,
}: StockRestockPageProps) {
  const [searchParams] = useSearchParams()
  const [productId, setProductId] = useState(searchParams.get('produto') ?? '')
  const [quantity, setQuantity] = useState('')
  const [supplier, setSupplier] = useState('')
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  )
  const [unitCost, setUnitCost] = useState('')
  const [observation, setObservation] = useState('')
  const [saved, setSaved] = useState(false)
  const selectedProduct = products.find(
    (product) => product.id === Number(productId) && product.active,
  )
  const restockQuantity = Number(quantity)
  const resultingStock = (selectedProduct?.stock ?? 0) + restockQuantity
  const reachesMinimum =
    !!selectedProduct && resultingStock >= selectedProduct.minimumStock

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !selectedProduct ||
      !Number.isInteger(restockQuantity) ||
      restockQuantity <= 0
    ) {
      return
    }
    onUpdate({
      ...selectedProduct,
      stock: resultingStock,
      cost: unitCost === '' ? selectedProduct.cost : Number(unitCost),
    })
    setSaved(true)
  }

  return (
    <main>
      <AppSidebar
        currentPage="estoque"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <button onClick={() => onNavigate('estoque')} type="button">
          ← Voltar para estoque
        </button>
        <h1>Repor estoque</h1>
        <form onSubmit={submit}>
          <label>
            Produto
            <select
              onChange={(event) => {
                setProductId(event.target.value)
                setQuantity('')
                setSaved(false)
              }}
              required
              value={productId}
            >
              <option value="">Selecionar produto</option>
              {products
                .filter((product) => product.active)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
            </select>
          </label>
          {selectedProduct && (
            <section aria-label="Resumo do produto selecionado">
              <strong>{selectedProduct.name}</strong>
              <p>Categoria: {selectedProduct.category}</p>
              <p>
                Estoque atual: <strong>{selectedProduct.stock} un.</strong>
              </p>
              <p>
                Estoque mínimo:{' '}
                <strong>{selectedProduct.minimumStock} un.</strong>
              </p>
            </section>
          )}
          <label>
            Quantidade a repor
            <span>
              <button
                aria-label="Diminuir quantidade a repor"
                disabled={restockQuantity <= 1}
                onClick={() =>
                  setQuantity(String(Math.max(1, restockQuantity - 1)))
                }
                type="button"
              >
                −
              </button>
              <input
                min="1"
                onChange={(event) => {
                  setQuantity(event.target.value)
                  setSaved(false)
                }}
                required
                type="number"
                value={quantity}
              />
              <button
                aria-label="Aumentar quantidade a repor"
                onClick={() => setQuantity(String(restockQuantity + 1))}
                type="button"
              >
                +
              </button>
            </span>
          </label>
          {selectedProduct && restockQuantity > 0 && (
            <p role="status">
              Novo estoque após reposição: <strong>{resultingStock} un.</strong>
              {reachesMinimum
                ? ' (Atende ao estoque mínimo)'
                : ` (Ainda faltam ${selectedProduct.minimumStock - resultingStock} un. para o mínimo)`}
            </p>
          )}
          <label>
            Fornecedor
            <select
              onChange={(event) => setSupplier(event.target.value)}
              value={supplier}
            >
              <option value="">Selecionar fornecedor</option>
              {suppliers.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data da entrada
            <input
              onChange={(event) => setEntryDate(event.target.value)}
              required
              type="date"
              value={entryDate}
            />
          </label>
          <label>
            Custo unitário (opcional)
            <input
              min="0"
              onChange={(event) => setUnitCost(event.target.value)}
              placeholder="R$ 0,00"
              step="0.01"
              type="number"
              value={unitCost}
            />
          </label>
          <label>
            Observação (opcional)
            <textarea
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Adicione uma nota sobre esta reposição"
              value={observation}
            />
          </label>
          <button disabled={!selectedProduct || restockQuantity < 1} type="submit">
            Confirmar reposição
          </button>
        </form>
        {saved && selectedProduct && (
          <StatusToast
            message={`${restockQuantity} unidades de ${selectedProduct.name} adicionadas em ${entryDate}.${supplier ? ` Fornecedor: ${supplier}.` : ''}${observation ? ` ${observation}` : ''}`}
            onClose={() => setSaved(false)}
            title="Reposição confirmada com sucesso!"
          />
        )}
      </section>
    </main>
  )
}

export default StockRestockPage
