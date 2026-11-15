import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, SetupData } from '../../types'
import type { PurchaseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'
import type { Supplier } from '../../types/fornecedor'

type StockRestockPageProps = {
  onNavigate: (path: AppPath) => void
  onSavePurchase: (purchase: PurchaseRecord) => Promise<void>
  products: Product[]
  suppliers: Supplier[]
  setupData: SetupData
}

function StockRestockPage({
  onNavigate,
  onSavePurchase,
  products,
  suppliers,
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
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const selectedProduct = products.find(
    (product) => product.id === Number(productId) && product.active,
  )
  const selectedSupplier = suppliers.find(
    (item) => item.id === supplier && item.active,
  )
  const restockQuantity = Number(quantity)
  const resultingStock = (selectedProduct?.stock ?? 0) + restockQuantity
  const reachesMinimum =
    !!selectedProduct && resultingStock >= selectedProduct.minimumStock

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !selectedProduct ||
      !selectedSupplier ||
      !Number.isInteger(restockQuantity) ||
      restockQuantity <= 0 ||
      unitCost === '' ||
      !Number.isFinite(Number(unitCost)) ||
      Number(unitCost) < 0
    ) {
      return
    }
    setError('')
    setIsSaving(true)
    const cost = Number(unitCost)
    try {
      await onSavePurchase({
        id: crypto.randomUUID(),
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: restockQuantity,
        unitCost: cost,
        date: entryDate,
        total: restockQuantity * cost,
      })
      setSaved(true)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível registrar a entrada de estoque.',
      )
    } finally {
      setIsSaving(false)
    }
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
              required
              value={supplier}
            >
              <option value="">Selecionar fornecedor</option>
              {suppliers.filter((option) => option.active).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
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
            Custo unitário
            <input
              min="0"
              onChange={(event) => setUnitCost(event.target.value)}
              placeholder="R$ 0,00"
              required
              step="0.01"
              type="number"
              value={unitCost}
            />
          </label>
          <button
            disabled={!selectedProduct || !selectedSupplier || restockQuantity < 1 || isSaving}
            type="submit"
          >
            {isSaving ? 'Registrando entrada...' : 'Confirmar reposição'}
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
        {saved && selectedProduct && (
          <StatusToast
            message={`${restockQuantity} unidades de ${selectedProduct.name} adicionadas em ${entryDate} pelo fornecedor ${selectedSupplier?.name}.`}
            onClose={() => setSaved(false)}
            title="Reposição confirmada com sucesso!"
          />
        )}
      </section>
    </main>
  )
}

export default StockRestockPage
