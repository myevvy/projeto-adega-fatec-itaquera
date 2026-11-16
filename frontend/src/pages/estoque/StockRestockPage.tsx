import { useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, SetupData } from '../../types'
import type { PurchaseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'
import type { Supplier } from '../../types/fornecedor'

const LOW_STOCK_LIMIT = 10

type StockRestockPageProps = {
  onNavigate: (path: AppPath) => void
  onSavePurchase: (purchase: PurchaseRecord) => Promise<void>
  products: Product[]
  suppliers: Supplier[]
  setupData: SetupData
}

type Receipt = {
  productName: string
  category: string
  previousStock: number
  newStock: number
  minimumStock: number
  quantity: number
  supplierName: string
  date: string
  unitCost: number | null
  note: string
}

const formatDate = (iso: string) => iso.split('-').reverse().join('/')
const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const labelClass = 'block text-sm text-[#6f6b60]'
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px] text-[#26291f] placeholder:text-[#b4b0a3] outline-none transition focus:border-[#3b4a2b] focus:ring-2 focus:ring-[#3b4a2b]/20 disabled:bg-[#fbfaf6]'
const stepperButtonClass =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e3dfd2] bg-white text-2xl leading-none text-[#26291f] transition hover:bg-[#f1efe6] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  )
}

function CheckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function AlertIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5v.01" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function StatusBadge({ low }: { low: boolean }) {
  return low ? (
    <span className="shrink-0 rounded-md border border-[#e8743b] px-2 py-0.5 text-[11px] font-medium text-[#e8743b]">
      Estoque Baixo
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-[#dfe7d3] px-3 py-0.5 text-[11px] font-medium text-[#3b4a2b]">
      Regular
    </span>
  )
}

function StockRestockPage({
  onNavigate,
  onSavePurchase,
  products,
  suppliers,
  setupData,
}: StockRestockPageProps) {
  const [searchParams] = useSearchParams()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [productId, setProductId] = useState(searchParams.get('produto') ?? '')
  const [quantity, setQuantity] = useState('')
  const [supplier, setSupplier] = useState('')
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  )

  const [unitCost, setUnitCost] = useState('')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedProduct = products.find(
    (product) => product.id === Number(productId) && product.active,
  )
  const selectedSupplier = suppliers.find(
    (item) => item.id === supplier && item.active,
  )

  const parsedQuantity = Number(quantity)
  const restockQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0
  const currentStock = selectedProduct?.stock ?? 0
  const resultingStock = currentStock + restockQuantity
  const reachesMinimum =
    !!selectedProduct && resultingStock >= selectedProduct.minimumStock
  const isLowStock = !!selectedProduct && currentStock <= LOW_STOCK_LIMIT

  const costIsValid =
    unitCost === '' ||
    (Number.isFinite(Number(unitCost)) && Number(unitCost) >= 0)
  const canSubmit =
    !!selectedProduct &&
    !!selectedSupplier &&
    restockQuantity >= 1 &&
    !!entryDate &&
    costIsValid &&
    !isSaving

  const openDatePicker = () => {
    try {
      dateInputRef.current?.showPicker?.()
    } catch {
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !selectedProduct || !selectedSupplier) return

    setError('')
    setIsSaving(true)
    const cost = unitCost === '' ? null : Number(unitCost)
    try {
      await onSavePurchase({
        id: crypto.randomUUID(),
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: restockQuantity,
        unitCost: cost ?? 0,
        date: entryDate,
        total: restockQuantity * (cost ?? 0),
      })

      setReceipt({
        productName: selectedProduct.name,
        category: selectedProduct.category,
        previousStock: selectedProduct.stock,
        newStock: resultingStock,
        minimumStock: selectedProduct.minimumStock,
        quantity: restockQuantity,
        supplierName: selectedSupplier.name,
        date: entryDate,
        unitCost: cost,
        note: note.trim(),
      })
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
    <main className="min-h-screen bg-[#faf8f2] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="estoque"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col lg:flex-1">
        <header className="flex items-center gap-3 border-b border-[#e3dfd2] px-5 py-5">
          <button
            aria-label="Voltar para estoque"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe8dd] text-[#26291f] transition hover:bg-[#e0dccf] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40"
            onClick={() => onNavigate('estoque')}
            type="button"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-lg font-semibold">Repor estoque</h1>
        </header>

        {receipt ? (
          <div className="flex flex-1 flex-col px-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{receipt.productName}</h2>
                <p className="text-sm text-[#6f6b60]">
                  Categoria: {receipt.category}
                </p>
              </div>
              <StatusBadge low={receipt.newStock < receipt.minimumStock} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-[#e3dfd2] pt-3 text-sm">
              <dt className="text-[#6f6b60]">Estoque atual</dt>
              <dt className="text-right text-[#6f6b60]">Estoque mínimo</dt>
              <dd className="font-semibold">{receipt.newStock} un.</dd>
              <dd className="text-right font-semibold">
                {receipt.minimumStock} un.
              </dd>
            </dl>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[#6f6b60]">Quantidade reposta</dt>
                <dd className="mt-1.5 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px]">
                  {receipt.quantity} un.
                </dd>
              </div>

              <div className="rounded-xl bg-[#dfe7d3] px-4 py-3.5 text-[#3b4a2b]">
                <p className="text-[15px] font-medium">
                  {receipt.newStock} un. (de {receipt.previousStock} para{' '}
                  {receipt.newStock})
                </p>
                <p className="mt-0.5 text-xs text-[#3b4a2b]/60">
                  {receipt.newStock >= receipt.minimumStock
                    ? 'Atende ao estoque mínimo'
                    : `Ainda faltam ${receipt.minimumStock - receipt.newStock} un. para o mínimo`}
                </p>
              </div>

              <div>
                <dt className="text-[#6f6b60]">Fornecedor</dt>
                <dd className="mt-1.5 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px]">
                  {receipt.supplierName}
                </dd>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[#6f6b60]">Data da entrada</dt>
                  <dd className="mt-1.5 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px]">
                    {formatDate(receipt.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6f6b60]">Custo unitário (opcional)</dt>
                  <dd className="mt-1.5 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px]">
                    {receipt.unitCost === null
                      ? 'Não informado'
                      : formatCurrency(receipt.unitCost)}
                  </dd>
                </div>
              </div>

              <div>
                <dt className="text-[#6f6b60]">Observação (opcional)</dt>
                <dd className="mt-1.5 rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px]">
                  {receipt.note || 'Não informada'}
                </dd>
              </div>
            </dl>

            <p
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#dfe7d3] px-4 py-3 text-sm font-medium text-[#3b4a2b]"
              role="status"
            >
              <CheckIcon className="h-5 w-5 shrink-0" />
              Reposição de {receipt.quantity} un. registrada.
            </p>

            <div className="mt-auto pb-6 pt-6">
              <button
                className="w-full rounded-xl bg-[#3b4a2b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/50 focus-visible:ring-offset-2"
                onClick={() => onNavigate('estoque')}
                type="button"
              >
                Voltar ao estoque
              </button>
            </div>
          </div>
        ) : (
          <form className="flex flex-1 flex-col" onSubmit={submit}>
            <div className="flex-1 space-y-5 px-5 pb-6 pt-6">
              <div>
                <label className={labelClass} htmlFor="restock-product">
                  Produto
                </label>
                <div className="relative">
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    id="restock-product"
                    onChange={(event) => {
                      setProductId(event.target.value)
                      setQuantity('')
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
                  <span className="pointer-events-none absolute right-4 top-1/2 mt-[3px] -translate-y-1/2 text-[#6f6b60]">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {selectedProduct && (
                <section
                  aria-label="Resumo do produto selecionado"
                  className="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(38,41,31,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-[17px] font-semibold">
                        {selectedProduct.name}
                      </strong>
                      <p className="text-sm text-[#6f6b60]">
                        Categoria: {selectedProduct.category}
                      </p>
                    </div>
                    <StatusBadge low={isLowStock} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 border-t border-[#e3dfd2] pt-3 text-xs text-[#6f6b60]">
                    <span>Estoque atual</span>
                    <span className="text-right">Estoque mínimo</span>
                    <strong
                      className={`text-base font-semibold ${
                        isLowStock ? 'text-[#e8743b]' : 'text-[#26291f]'
                      }`}
                    >
                      {selectedProduct.stock} un.
                    </strong>
                    <strong className="text-right text-base font-semibold text-[#26291f]">
                      {selectedProduct.minimumStock} un.
                    </strong>
                  </div>

                  {isLowStock && (
                    <p
                      className="mt-3 flex items-center gap-2 rounded-lg bg-[#fdeee6] px-3 py-2 text-xs text-[#b9531f]"
                      role="alert"
                    >
                      <AlertIcon className="h-4 w-4 shrink-0" />
                      Estoque baixo: {LOW_STOCK_LIMIT} unidades ou menos.
                    </p>
                  )}
                </section>
              )}

              <div>
                <label
                  className="block text-base font-medium text-[#26291f]"
                  htmlFor="restock-quantity"
                >
                  Quantidade a repor
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    aria-label="Diminuir quantidade a repor"
                    className={stepperButtonClass}
                    disabled={restockQuantity <= 1}
                    onClick={() => setQuantity(String(restockQuantity - 1))}
                    type="button"
                  >
                    −
                  </button>
                  <input
                    className="h-12 min-w-0 flex-1 rounded-xl border border-[#e3dfd2] bg-white text-center text-lg font-semibold outline-none transition [appearance:textfield] focus:border-[#3b4a2b] focus:ring-2 focus:ring-[#3b4a2b]/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    id="restock-quantity"
                    inputMode="numeric"
                    min="1"
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="0"
                    required
                    step="1"
                    type="number"
                    value={quantity}
                  />
                  <button
                    aria-label="Aumentar quantidade a repor"
                    className={stepperButtonClass}
                    onClick={() => setQuantity(String(restockQuantity + 1))}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              {selectedProduct && restockQuantity > 0 && (
                <div>
                  <p className="text-base font-medium">
                    Novo estoque após reposição
                  </p>
                  <p
                    className={`mt-2 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                      reachesMinimum
                        ? 'border-[#e3dfd2] bg-white'
                        : 'border-[#f3c9b2] bg-[#fdeee6] text-[#b9531f]'
                    }`}
                    role="status"
                  >
                    <span>
                      <strong>{resultingStock} un.</strong>{' '}
                      <span className="text-[#6f6b60]">
                        {reachesMinimum
                          ? '(Atende ao estoque mínimo)'
                          : `(Ainda faltam ${selectedProduct.minimumStock - resultingStock} un. para o mínimo)`}
                      </span>
                    </span>
                    {reachesMinimum ? (
                      <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#3b4a2b]" />
                    ) : (
                      <AlertIcon className="h-5 w-5 shrink-0 text-[#e8743b]" />
                    )}
                  </p>
                </div>
              )}

              {/* Fornecedor */}
              <div>
                <label className={labelClass} htmlFor="restock-supplier">
                  Fornecedor
                </label>
                <div className="relative">
                  <select
                    className={`${fieldClass} appearance-none pr-10`}
                    id="restock-supplier"
                    onChange={(event) => setSupplier(event.target.value)}
                    required
                    value={supplier}
                  >
                    <option value="">Selecionar fornecedor</option>
                    {suppliers
                      .filter((option) => option.active)
                      .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 mt-[3px] -translate-y-1/2 text-[#6f6b60]">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {/* Data + custo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} htmlFor="restock-date">
                    Data da entrada
                  </label>
                  <div className="relative">
                    <input
                      className={`${fieldClass} pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                      id="restock-date"
                      onChange={(event) => setEntryDate(event.target.value)}
                      onClick={openDatePicker}
                      ref={dateInputRef}
                      required
                      type="date"
                      value={entryDate}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-[#26291f]">
                      <CalendarIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="restock-cost">
                    Custo unitário (opcional)
                  </label>
                  <input
                    className={fieldClass}
                    id="restock-cost"
                    inputMode="decimal"
                    min="0"
                    onChange={(event) => setUnitCost(event.target.value)}
                    placeholder="R$ 0,00"
                    step="0.01"
                    type="number"
                    value={unitCost}
                  />
                </div>
              </div>

              {/* Observação */}
              <div>
                <label className={labelClass} htmlFor="restock-note">
                  Observação (opcional)
                </label>
                <textarea
                  className={`${fieldClass} resize-none`}
                  id="restock-note"
                  maxLength={200}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Adicione uma nota sobre esta reposição"
                  rows={3}
                  value={note}
                />
              </div>

              {error && (
                <p
                  className="rounded-xl bg-[#fdeee6] px-4 py-3 text-sm text-[#b9531f]"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Barra de ação fixa no rodapé */}
            <div className="sticky bottom-0 border-t border-[#e3dfd2] bg-[#faf8f2] px-5 py-4">
              <button
                className="w-full rounded-xl bg-[#3b4a2b] py-4 text-[15px] font-semibold text-white transition hover:bg-[#2f3b22] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#3b4a2b]/40 disabled:active:scale-100"
                disabled={!canSubmit}
                type="submit"
              >
                {isSaving ? 'Registrando entrada...' : 'Confirmar reposição'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

export default StockRestockPage
