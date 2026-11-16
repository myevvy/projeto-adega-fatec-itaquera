import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
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

/* ---------- Classes reutilizáveis ---------- */
const labelClass = 'block text-sm text-[#6f6b60]'
const fieldClass =
  'mt-1.5 w-full rounded-xl border border-[#e3dfd2] bg-white px-4 py-3 text-[15px] text-[#26291f] placeholder:text-[#b4b0a3] outline-none transition focus:border-[#3b4a2b] focus:ring-2 focus:ring-[#3b4a2b]/20 disabled:bg-[#fbfaf6]'
const stepperButtonClass =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e3dfd2] bg-white text-2xl leading-none text-[#26291f] transition hover:bg-[#f1efe6] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

/* ---------- Ícones ---------- */
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

/* ---------- Selo de status ---------- */
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
  const isLowStock = !!selectedProduct && resultingStock < LOW_STOCK_LIMIT

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
