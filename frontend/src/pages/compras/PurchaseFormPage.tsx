import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import VoiceSearchButton from '../../components/voice-search/VoiceSearchButton'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { PurchaseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'
import type { Supplier } from '../../types/fornecedor'

export type PurchaseDetail = {
  number?: string
  status: 'RECEBIDA' | 'PENDENTE' | 'CANCELADA'
  supplierName: string
  dateTime: string
  paymentMethod?: string
  items: { id: string; name: string; quantity: number; unitCost: number }[]
  taxesAndFreight: number
}

type PurchaseFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (purchase: PurchaseRecord) => Promise<void>
  products: Product[]
  setupData: SetupData
  suppliers: Supplier[]
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_STYLE: Record<PurchaseDetail['status'], { label: string; className: string }> = {
  RECEBIDA: { label: 'Recebida', className: 'bg-[#dfe6d3] text-[#4f6139]' },
  PENDENTE: { label: 'Pendente', className: 'bg-[#f4ead0] text-[#8a6a1f]' },
  CANCELADA: { label: 'Cancelada', className: 'bg-[#efefe9] text-[#747a6d]' },
}

const inputClass =
  'h-12 w-full rounded-xl border border-[#e0e1d8] bg-white px-3.5 text-sm text-[#2b3025] outline-none transition placeholder:text-[#a0a498] focus:border-[#39452d] focus:ring-2 focus:ring-[#39452d]/20'

const primaryButton =
  'h-12 w-full rounded-xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] disabled:cursor-not-allowed disabled:bg-[#d9dbd2] disabled:text-[#7c8176]'

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#747a6d]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="flex items-center gap-3">
      <button
        aria-label="Voltar para compras"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#efefe9] transition hover:bg-[#e4e8dc]"
        onClick={onBack}
        type="button"
      >
        <svg
          aria-hidden
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <h1 className="text-lg font-bold sm:text-2xl">Registrar compra</h1>
    </header>
  )
}

function PurchaseFormPage({
  onNavigate,
  onSave,
  products,
  setupData,
  suppliers,
}: PurchaseFormPageProps) {
  const activeSuppliers = suppliers.filter((supplier) => supplier.active)
  const activeProducts = products.filter((product) => product.active)
  const [supplierId, setSupplierId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<PurchaseDetail | null>(null)

  const supplier = activeSuppliers.find((item) => item.id === supplierId)
  const product = activeProducts.find((item) => String(item.id) === productId)
  const qty = Number(quantity)
  const cost = Number(unitCost.replace(',', '.'))
  const estimatedTotal = qty > 0 && cost >= 0 ? qty * cost : 0
  const valid = Boolean(
    supplier && product && qty > 0 && unitCost && cost >= 0 && date,
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!valid || submitting || !supplier || !product) return
    setError('')
    setSubmitting(true)

    const purchase: PurchaseRecord = {
      id: crypto.randomUUID(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitCost: cost,
      date,
      total: estimatedTotal,
    }

    try {
      await onSave(purchase)
      setCreated({
        status: 'RECEBIDA',
        supplierName: supplier.name,
        dateTime: `${date}T${new Date().toTimeString().slice(0, 5)}`,
        items: [
          {
            id: String(product.id),
            name: product.name,
            quantity: qty,
            unitCost: cost,
          },
        ],
        taxesAndFreight: 0,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível registrar a compra.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    const units = created.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = created.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
    const total = subtotal + created.taxesAndFreight
    const status = STATUS_STYLE[created.status]
    const when = new Date(created.dateTime)

    const info: [string, string][] = [
      ['Fornecedor', created.supplierName],
      [
        'Data da Compra',
        `${when.toLocaleDateString('pt-BR')} às ${when.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      ],
    ]
    if (created.paymentMethod) info.push(['Pagamento', created.paymentMethod])

    return (
      <main className="min-h-dvh bg-[#fbfaf5] text-[#2b3025] lg:flex">
        <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />

        <section className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10 pt-6 sm:px-8 sm:pt-8 lg:pt-10">
          <PageHeader onBack={() => onNavigate('compras')} />

          <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold sm:text-xl">
                  Compra{created.number ? ` #${created.number}` : ''}
                </h2>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <dl className="mt-4 divide-y divide-[#ecece4] rounded-2xl border border-[#e8e8e0] bg-white px-4 text-xs sm:text-sm">
                {info.map(([label, value]) => (
                  <div className="flex justify-between gap-4 py-2.5" key={label}>
                    <dt className="text-[#747a6d]">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mb-3 mt-7 text-base font-bold">Itens da Compra ({units} un.)</h3>
              <ul className="divide-y divide-[#ecece4] rounded-2xl border border-[#e8e8e0] bg-white px-4">
                {created.items.map((item) => (
                  <li className="flex items-center gap-3 py-4" key={item.id}>
                    <div aria-hidden className="size-10 shrink-0 rounded-lg bg-[#dfe6d3]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#858a80]">
                        {item.quantity} un. × {formatCurrency(item.unitCost)}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm">
                      {formatCurrency(item.quantity * item.unitCost)}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="mt-7 space-y-5 lg:sticky lg:top-8 lg:mt-0">
              <dl className="space-y-2 px-1 text-sm lg:rounded-2xl lg:border lg:border-[#e8e8e0] lg:bg-white lg:p-5">
                <div className="flex justify-between text-[#747a6d]">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-[#747a6d]">
                  <dt>Impostos / Frete</dt>
                  <dd>{formatCurrency(created.taxesAndFreight)}</dd>
                </div>
                <div className="flex items-end justify-between border-t border-[#ecece4] pt-3">
                  <dt className="text-sm font-bold">Total</dt>
                  <dd className="text-2xl font-bold tracking-tight text-[#5f7a45] sm:text-3xl">
                    {formatCurrency(total)}
                  </dd>
                </div>
              </dl>

              <div
                className="flex items-start gap-3 rounded-xl bg-[#dfe6d3] px-4 py-3 text-[#39452d]"
                role="status"
              >
                <svg
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <p className="text-xs leading-relaxed">
                  <strong className="block text-sm">Compra registrada com sucesso.</strong>
                  {units} unidades adicionadas. Estoque atualizado.
                </p>
              </div>

              <button
                className={primaryButton}
                onClick={() => onNavigate('compras')}
                type="button"
              >
                Voltar às compras
              </button>
            </aside>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#fbfaf5] text-[#2b3025] lg:flex">
      <AppSidebar currentPage="compras" onNavigate={onNavigate} userName={setupData.adminName} />

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6 pt-6 sm:px-8 sm:pt-8 lg:pt-10">
        <PageHeader onBack={() => onNavigate('compras')} />

        <form className="mt-8 flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <Field htmlFor="fornecedor" label="Fornecedor">
              <select
                className={inputClass}
                id="fornecedor"
                onChange={(event) => setSupplierId(event.target.value)}
                required
                value={supplierId}
              >
                <option value="">Selecionar fornecedor</option>
                {activeSuppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {activeSuppliers.length === 0 && (
                <p className="mt-2 text-xs text-[#a14a3a]" role="status">
                  Não há fornecedores ativos disponíveis.
                </p>
              )}
            </Field>

            <Field htmlFor="produto" label="Produto">
              <div className="flex gap-2">
                <select
                  className={inputClass}
                  id="produto"
                  onChange={(event) => setProductId(event.target.value)}
                  required
                  value={productId}
                >
                  <option value="">Selecionar produto</option>
                  {activeProducts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · estoque: {item.stock}
                    </option>
                  ))}
                </select>
                <VoiceSearchButton
                  buttonClassName="grid size-12 shrink-0 place-items-center rounded-full bg-[#1d1f1a] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
                  label="Buscar produto por voz"
                  onTranscript={(transcript) => {
                    const query = transcript.toLocaleLowerCase('pt-BR')
                    const matches = activeProducts.filter((item) =>
                      item.name.toLocaleLowerCase('pt-BR').includes(query),
                    )
                    if (matches.length === 1) {
                      setProductId(String(matches[0].id))
                      setError('')
                    } else {
                      setError(
                        matches.length
                          ? 'A busca por voz encontrou vários produtos. Selecione um produto na lista.'
                          : 'Nenhum produto corresponde à busca por voz.',
                      )
                    }
                  }}
                >
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
                    <rect height="12" rx="3" width="6" x="9" y="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </VoiceSearchButton>
              </div>
              {activeProducts.length === 0 && (
                <p className="mt-2 text-xs text-[#a14a3a]" role="status">
                  Não há produtos ativos disponíveis.
                </p>
              )}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field htmlFor="quantidade" label="Quantidade">
                <input
                  className={inputClass}
                  id="quantidade"
                  inputMode="numeric"
                  min={1}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ex: 12"
                  type="number"
                  value={quantity}
                />
              </Field>
              <Field htmlFor="custo" label="Custo de aquisição (unitário)">
                <input
                  className={inputClass}
                  id="custo"
                  inputMode="decimal"
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="R$ 0,00"
                  value={unitCost}
                />
              </Field>
            </div>

            <Field htmlFor="data" label="Data da compra">
              <input
                className={`${inputClass} sm:max-w-xs`}
                id="data"
                onChange={(e) => setDate(e.target.value)}
                type="date"
                value={date}
              />
            </Field>
          </div>

          {error && (
            <p
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="mt-auto pt-10">
            {estimatedTotal > 0 && (
              <p className="mb-3 flex justify-between text-sm text-[#747a6d]">
                Total estimado
                <strong className="text-[#2b3025]">{formatCurrency(estimatedTotal)}</strong>
              </p>
            )}
            <button className={primaryButton} disabled={!valid || submitting} type="submit">
              {submitting ? 'Registrando…' : 'Registrar compra'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default PurchaseFormPage