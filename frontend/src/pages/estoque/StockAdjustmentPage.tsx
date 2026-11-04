import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type StockAdjustmentPageProps = {
  onNavigate: (path: AppPath) => void
  onUpdate: (product: Product) => void
  products: Product[]
  setupData: SetupData
}

const reasons = ['Perda', 'Contagem', 'Devolução', 'Outro']

function StockAdjustmentPage({
  onNavigate,
  onUpdate,
  products,
  setupData,
}: StockAdjustmentPageProps) {
  const [searchParams] = useSearchParams()
  const [productId, setProductId] = useState(searchParams.get('produto') ?? '')
  const [newQuantity, setNewQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [observation, setObservation] = useState('')
  const [saved, setSaved] = useState(false)
  const selectedProduct = products.find(
    (product) => product.id === Number(productId) && product.active,
  )
  const parsedQuantity = Number(newQuantity)
  const difference = selectedProduct
    ? parsedQuantity - selectedProduct.stock
    : 0

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedProduct || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return
    }
    onUpdate({ ...selectedProduct, stock: parsedQuantity })
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
        <h1>Ajustar estoque</h1>
        <form onSubmit={submit}>
          <label>
            Produto
            <select
              onChange={(event) => {
                setProductId(event.target.value)
                setNewQuantity('')
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
            <section aria-label="Produto selecionado">
              <strong>{selectedProduct.name}</strong>
              <p>Estoque atual: {selectedProduct.stock} un.</p>
              <button
                onClick={() => onNavigate('estoque/ajustar')}
                type="button"
              >
                Trocar
              </button>
            </section>
          )}
          <label>
            Nova quantidade
            <input
              min="0"
              onChange={(event) => {
                setNewQuantity(event.target.value)
                setSaved(false)
              }}
              placeholder="Ex: 20"
              required
              type="number"
              value={newQuantity}
            />
          </label>
          {selectedProduct && newQuantity !== '' && difference !== 0 && (
            <p role="status">
              {difference < 0
                ? `⚠ Isso registra uma perda de ${Math.abs(difference)} un. (de ${selectedProduct.stock} para ${parsedQuantity})`
                : `O ajuste adicionará ${difference} un. ao estoque (de ${selectedProduct.stock} para ${parsedQuantity}).`}
            </p>
          )}
          <fieldset>
            <legend>Motivo</legend>
            {reasons.map((option) => (
              <label key={option}>
                <input
                  checked={reason === option}
                  name="reason"
                  onChange={() => setReason(option)}
                  required
                  type="radio"
                  value={option}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <label>
            Observação (opcional)
            <textarea
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Detalhe o motivo, se quiser"
              value={observation}
            />
          </label>
          <button disabled={!selectedProduct} type="submit">
            Confirmar ajuste
          </button>
        </form>
        {saved && selectedProduct && (
          <StatusToast
            message={`${selectedProduct.name}: estoque atualizado para ${parsedQuantity} un. Motivo: ${reason}.${observation ? ` ${observation}` : ''}`}
            onClose={() => setSaved(false)}
            title="Ajuste confirmado com sucesso!"
          />
        )}
      </section>
    </main>
  )
}

export default StockAdjustmentPage
