import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData, StockMovement } from '../../types'

type StockAdjustmentPageProps = {
  onNavigate: (path: AppPath) => void
  onUpdate: (product: Product, movement?: StockMovement) => Promise<void>
  products: Product[]
  setupData: SetupData
}

type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE'

const MOVEMENTS: { value: MovementType; label: string; hint: string }[] = [
  { value: 'ENTRADA', label: 'Entrada', hint: 'Adiciona unidades ao estoque.' },
  { value: 'SAIDA', label: 'Saída', hint: 'Retira unidades do estoque.' },
  { value: 'AJUSTE', label: 'Ajuste', hint: 'Define a quantidade exata contada.' },
]

const REASONS: Record<MovementType, string[]> = {
  ENTRADA: ['Devolução', 'Contagem', 'Outro'],
  SAIDA: ['Perda', 'Devolução', 'Outro'],
  AJUSTE: ['Contagem', 'Perda', 'Devolução', 'Outro'],
}

const QUANTITY_LABEL: Record<MovementType, string> = {
  ENTRADA: 'Quantidade a adicionar',
  SAIDA: 'Quantidade a retirar',
  AJUSTE: 'Nova quantidade em estoque',
}

const MOVEMENT_NAME: Record<MovementType, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  AJUSTE: 'Ajuste',
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]'
const peerFocus =
  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#39452d]'

const BackIcon = () => (
  <svg
    aria-hidden
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

function stockStatus(product: Product) {
  if (product.stock <= 0)
    return { label: 'Sem estoque', card: 'bg-[#f6e0dc]', text: 'text-[#a8402e]' }
  if (product.stock <= product.minimumStock)
    return { label: 'Estoque baixo', card: 'bg-[#f6ead3]', text: 'text-[#8a5a12]' }
  return { label: 'Em dia', card: 'bg-[#e4e8dc]', text: 'text-[#4f6139]' }
}

function StockAdjustmentPage({
  onNavigate,
  onUpdate,
  products,
  setupData,
}: StockAdjustmentPageProps) {
  const [searchParams] = useSearchParams()
  const [productId, setProductId] = useState(searchParams.get('produto') ?? '')
  const [movement, setMovement] = useState<MovementType>('AJUSTE')
  const [newQuantity, setNewQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [observation, setObservation] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  )

  const activeProducts = products.filter((product) => product.active)
  const selectedProduct = activeProducts.find(
    (product) => product.id === Number(productId),
  )

  const quantity = newQuantity === '' ? null : Number(newQuantity)

  let quantityError = ''
  if (selectedProduct && quantity !== null) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      quantityError = 'Informe um número inteiro maior ou igual a zero.'
    } else if (movement !== 'AJUSTE' && quantity === 0) {
      quantityError = 'Informe ao menos 1 unidade.'
    } else if (movement === 'SAIDA' && quantity > selectedProduct.stock) {
      quantityError = `A saída não pode passar do estoque atual (${selectedProduct.stock} un.).`
    } else if (movement === 'AJUSTE' && quantity === selectedProduct.stock) {
      quantityError = 'A quantidade é igual ao estoque atual.'
    }
  }

  const resultingStock =
    selectedProduct && quantity !== null && !quantityError
      ? movement === 'ENTRADA'
        ? selectedProduct.stock + quantity
        : movement === 'SAIDA'
          ? selectedProduct.stock - quantity
          : quantity
      : null
  const difference =
    selectedProduct && resultingStock !== null
      ? resultingStock - selectedProduct.stock
      : 0

  const canSubmit =
    !!selectedProduct &&
    resultingStock !== null &&
    reason !== '' &&
    !isSaving

  const resetForm = () => {
    setNewQuantity('')
    setReason('')
    setObservation('')
    setError('')
  }

  const changeMovement = (next: MovementType) => {
    setMovement(next)
    setNewQuantity('')
    setError('')
    if (!REASONS[next].includes(reason)) setReason('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !canSubmit ||
      !selectedProduct ||
      quantity === null ||
      resultingStock === null
    ) {
      return
    }
    setError('')
    setIsSaving(true)
    try {
      await onUpdate(
        { ...selectedProduct, stock: resultingStock },
        {
          tipo:
            movement === 'ENTRADA'
              ? 'entrada'
              : movement === 'SAIDA'
                ? 'saida'
                : 'ajuste',
          quantidadeMovimentada: quantity,
          motivo: reason,
          observacao: observation,
        },
      )
      setToast({
        title: `${MOVEMENT_NAME[movement]} registrada com sucesso!`,
        message: `${selectedProduct.name}: estoque atualizado para ${resultingStock} un. Motivo: ${reason}.${observation ? ` ${observation}` : ''}`,
      })
      resetForm()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível registrar a movimentação de estoque.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const status = selectedProduct ? stockStatus(selectedProduct) : null

  return (
    <div className="min-h-dvh bg-[#fbfaf5] text-[#2b3025] lg:flex">
      <AppSidebar
        currentPage="estoque"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <main className="min-w-0 flex-1 px-5 pb-12 pt-6 sm:px-8 lg:px-10 lg:pt-12">
        <div className="mx-auto w-full max-w-[1000px]">
          <header className="flex items-center gap-4">
            <button
              aria-label="Voltar para estoque"
              className={`grid size-11 shrink-0 place-items-center rounded-full border border-[#e8e8e0] bg-white transition hover:border-[#39452d] sm:size-12 ${focusRing}`}
              onClick={() => onNavigate('estoque')}
              type="button"
            >
              <BackIcon />
            </button>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              Movimentar estoque
            </h1>
          </header>

          <form
            className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8"
            onSubmit={submit}
          >
            <section aria-label="Produto" className="space-y-4">
              <label className="block text-sm font-semibold">
                Produto
                <select
                  className={`mt-2 h-12 w-full rounded-xl border border-[#e8e8e0] bg-white px-3 text-sm font-normal text-[#343a2f] outline-none focus:border-[#39452d] focus:ring-2 focus:ring-[#39452d]/20`}
                  onChange={(event) => {
                    setProductId(event.target.value)
                    resetForm()
                  }}
                  required
                  value={productId}
                >
                  <option value="">Selecionar produto</option>
                  {activeProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedProduct && status ? (
                <div
                  aria-label="Produto selecionado"
                  className="rounded-2xl border border-[#e8e8e0] bg-white p-4"
                  role="group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden
                      className="size-16 shrink-0 rounded-2xl bg-[#dfe6d3]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold">
                        {selectedProduct.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-[#747a6d]">
                        {selectedProduct.variety || selectedProduct.category}
                      </p>
                    </div>
                    <button
                      className={`shrink-0 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#747a6d] transition hover:text-[#39452d] ${focusRing}`}
                      onClick={() => {
                        setProductId('')
                        resetForm()
                      }}
                      type="button"
                    >
                      Trocar
                    </button>
                  </div>

                  <div className={`mt-4 rounded-2xl p-4 ${status.card}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span>Estoque atual</span>
                      <span className={`font-medium ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-3xl font-bold tracking-tight">
                      {selectedProduct.stock} un.
                    </p>
                    <p className="mt-1 text-sm text-[#4b5143]">
                      Mínimo cadastrado: {selectedProduct.minimumStock} un.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-[#d9dbd2] p-4 text-sm text-[#858a80]">
                  Escolha um produto para ver o estoque atual e registrar a
                  movimentação.
                </p>
              )}
            </section>

            <section
              aria-label="Movimentação"
              className="space-y-6 rounded-2xl border border-[#e8e8e0] bg-white p-5"
            >
              <fieldset>
                <legend className="text-sm font-semibold">Tipo de movimentação</legend>
                <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
                  {MOVEMENTS.map((option) => (
                    <label className="relative block" key={option.value}>
                      <input
                        checked={movement === option.value}
                        className="peer sr-only"
                        name="movement"
                        onChange={() => changeMovement(option.value)}
                        type="radio"
                        value={option.value}
                      />
                      <span
                        className={`grid h-12 cursor-pointer place-items-center rounded-xl border border-[#e8e8e0] bg-white text-sm font-medium text-[#343a2f] transition hover:border-[#c9cfbf] peer-checked:border-[#39452d] peer-checked:bg-[#39452d] peer-checked:text-white ${peerFocus}`}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[#747a6d]">
                  {MOVEMENTS.find((option) => option.value === movement)?.hint}
                </p>
              </fieldset>

              <div>
                <label className="block text-sm font-semibold" htmlFor="quantidade">
                  {QUANTITY_LABEL[movement]}
                </label>
                <input
                  aria-describedby="quantidade-ajuda"
                  aria-invalid={quantityError !== ''}
                  className="mt-2 h-12 w-full rounded-xl border border-[#e8e8e0] bg-white px-3 text-sm outline-none placeholder:text-[#8a8f82] focus:border-[#39452d] focus:ring-2 focus:ring-[#39452d]/20 disabled:cursor-not-allowed disabled:bg-[#f4f4ee]"
                  disabled={!selectedProduct}
                  id="quantidade"
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => setNewQuantity(event.target.value)}
                  placeholder="Ex: 20"
                  required
                  step="1"
                  type="number"
                  value={newQuantity}
                />
                <p
                  className={`mt-2 text-xs ${quantityError ? 'text-red-700' : 'text-[#747a6d]'}`}
                  id="quantidade-ajuda"
                  role={quantityError ? 'alert' : undefined}
                >
                  {quantityError ||
                    (selectedProduct
                      ? 'Use números inteiros.'
                      : 'Selecione um produto primeiro.')}
                </p>

                {selectedProduct && resultingStock !== null && (
                  <div
                    className="mt-3 flex items-center justify-between rounded-xl bg-[#efefe9] px-4 py-3 text-sm"
                    role="status"
                  >
                    <span className="text-[#4b5143]">
                      {difference < 0 ? '⚠ ' : ''}
                      {selectedProduct.stock} → {resultingStock} un.
                    </span>
                    <strong
                      className={difference < 0 ? 'text-[#a8402e]' : 'text-[#4f6139]'}
                    >
                      {difference > 0 ? '+' : '−'}
                      {Math.abs(difference)} un.
                    </strong>
                  </div>
                )}
              </div>

              <fieldset>
                <legend className="text-sm font-semibold">Motivo</legend>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
                  {REASONS[movement].map((option) => (
                    <label className="relative block" key={option}>
                      <input
                        checked={reason === option}
                        className="peer sr-only"
                        name="reason"
                        onChange={() => setReason(option)}
                        type="radio"
                        value={option}
                      />
                      <span
                        className={`grid h-9 cursor-pointer place-items-center rounded-full bg-white px-4 text-sm font-medium text-[#4b5143] ring-1 ring-[#e8e8e0] transition hover:ring-[#c9cfbf] peer-checked:bg-[#39452d] peer-checked:text-white peer-checked:ring-[#39452d] ${peerFocus}`}
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm font-semibold">
                Observação (opcional)
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-[#e8e8e0] bg-white px-3 py-3 text-sm font-normal outline-none placeholder:text-[#8a8f82] focus:border-[#39452d] focus:ring-2 focus:ring-[#39452d]/20"
                  onChange={(event) => setObservation(event.target.value)}
                  placeholder="Detalhe o motivo, se quiser"
                  value={observation}
                />
              </label>

              {error && (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="space-y-3">
                <button
                  className={`h-14 w-full rounded-2xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] disabled:cursor-not-allowed disabled:bg-[#d9dbd2] disabled:text-[#7c8176] ${focusRing}`}
                  disabled={!canSubmit}
                  type="submit"
                >
                  {isSaving
                    ? 'Salvando...'
                    : `Confirmar ${MOVEMENT_NAME[movement].toLowerCase()}`}
                </button>
                <button
                  className={`h-14 w-full rounded-2xl border border-[#e8e8e0] bg-white text-sm font-semibold transition hover:border-[#39452d] ${focusRing}`}
                  onClick={() => onNavigate('estoque')}
                  type="button"
                >
                  Voltar para estoque
                </button>
              </div>
            </section>
          </form>
        </div>
      </main>

      {toast && (
        <StatusToast
          message={toast.message}
          onClose={() => setToast(null)}
          title={toast.title}
        />
      )}
    </div>
  )
}

export default StockAdjustmentPage
