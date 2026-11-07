import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { PurchaseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'
import type { Supplier } from '../../types/fornecedor'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type PurchaseFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (purchase: PurchaseRecord) => void
  products: Product[]
  setupData: SetupData
  suppliers: Supplier[]
}

function PurchaseFormPage({
  onNavigate,
  onSave,
  products,
  setupData,
  suppliers,
}: PurchaseFormPageProps) {
  const [supplierId, setSupplierId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)
  const selectedProduct = products.find(
    (product) => product.id === Number(productId) && product.active,
  )
  const total = Number(quantity) * Number(unitCost)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const supplier = suppliers.find((item) => item.id === supplierId && item.active)
    if (
      !supplier ||
      !selectedProduct ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0 ||
      !Number.isFinite(Number(unitCost)) ||
      Number(unitCost) < 0
    ) {
      return
    }

    onSave({
      id: crypto.randomUUID(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      date,
      total,
    })
    setSaved(true)
    setSupplierId('')
    setProductId('')
    setQuantity('')
    setUnitCost('')
  }

  return (
    <main>
      <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <button onClick={() => onNavigate('compras')} type="button">← Voltar para compras</button>
        <h1>Registrar compra</h1>
        <p>A compra e a atualização do estoque serão salvas localmente.</p>
        <form onSubmit={submit}>
          <label>
            Fornecedor
            <select
              onChange={(event) => setSupplierId(event.target.value)}
              required
              value={supplierId}
            >
              <option value="">Selecionar fornecedor</option>
              {suppliers.filter((supplier) => supplier.active).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </label>
          <label>
            Produto
            <select
              onChange={(event) => setProductId(event.target.value)}
              required
              value={productId}
            >
              <option value="">Selecionar produto</option>
              {products.filter((product) => product.active).map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantidade
            <input
              min="1"
              onChange={(event) => setQuantity(event.target.value)}
              required
              type="number"
              value={quantity}
            />
          </label>
          <label>
            Custo de aquisição (unitário)
            <input
              min="0"
              onChange={(event) => setUnitCost(event.target.value)}
              required
              step="0.01"
              type="number"
              value={unitCost}
            />
          </label>
          <label>
            Data da compra
            <input
              onChange={(event) => setDate(event.target.value)}
              required
              type="date"
              value={date}
            />
          </label>
          {quantity && unitCost && (
            <p>Total da compra: <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
          )}
          <button
            disabled={!supplierId || !selectedProduct || Number(quantity) <= 0 || !unitCost}
            type="submit"
          >
            Registrar compra
          </button>
        </form>
        {saved && (
          <StatusToast
            message="A compra foi adicionada ao histórico e o estoque atualizado."
            onClose={() => setSaved(false)}
            title="Nova compra registrada com sucesso"
          />
        )}
      </section>
    </main>
  )
}

export default PurchaseFormPage
